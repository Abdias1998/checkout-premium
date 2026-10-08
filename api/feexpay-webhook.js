const FEEXPAY_STATUS_URL = 'https://api-v2.feexpay.me/api/transactions/public/single/status/';

const processed = globalThis.__feexpayWebhookProcessed ?? new Map();
globalThis.__feexpayWebhookProcessed = processed;

const TTL_MS = 60 * 60 * 1000;

const pruneProcessed = () => {
  const now = Date.now();
  for (const [key, entry] of processed) {
    if (now - entry.at > TTL_MS) processed.delete(key);
  }
};

const parseBody = (body) => {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body && typeof body === 'object' ? body : {};
};

const parseCallbackInfo = (value) => {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      return {};
    }
  }
  return {};
};

const getEnv = (...names) => {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return '';
};

const verifyTransaction = async (reference) => {
  const apiKey = getEnv('FEEXPAY_API_KEY', 'VITE_FEEXPAY_API_KEY');
  if (!apiKey) throw new Error('FEEXPAY_API_KEY manquant');

  const response = await fetch(
    `${FEEXPAY_STATUS_URL}${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  if (!response.ok) {
    throw new Error(`Vérification FeexPay impossible (HTTP ${response.status})`);
  }
  const data = await response.json();
  if (!data || typeof data.status !== 'string') {
    throw new Error('Réponse de statut FeexPay invalide');
  }
  return data;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = parseBody(req.body);
  const reference = typeof payload.reference === 'string' ? payload.reference.trim() : '';
  const status = String(payload.status || '').toUpperCase();

  if (!reference || status !== 'SUCCESSFUL') {
    return res.status(200).json({ received: true, skipped: true });
  }

  pruneProcessed();

  const existing = processed.get(reference);
  if (existing && (existing.state === 'done' || existing.state === 'pending')) {
    return res.status(200).json({ received: true, deduplicated: true });
  }
  processed.set(reference, { state: 'pending', at: Date.now() });

  try {
    const verified = await verifyTransaction(reference);
    if (verified.status !== 'SUCCESSFUL') {
      processed.delete(reference);
      return res.status(200).json({ received: true, verified: verified.status });
    }

    const info = parseCallbackInfo(payload.callback_info);
    const order = {
      event: 'paiement_recu',
      reference,
      amount: payload.amount ?? verified.amount ?? null,
      status: 'SUCCESSFUL',
      type: info.type ?? null,
      buyer: [info.firstName, info.lastName].filter(Boolean).join(' ') || null,
      phone: info.phone || payload.phoneNumber || null,
      whatsapp: info.whatsapp || null,
      address: info.address || null,
      network: payload.reseau || null,
      date: payload.date || new Date().toISOString(),
    };
    console.log('[feexpay-webhook]', JSON.stringify(order));

    processed.set(reference, { state: 'done', at: Date.now() });
    return res.status(200).json({ received: true });
  } catch (error) {
    processed.delete(reference);
    console.error(`[feexpay-webhook] échec pour ${reference}:`, error);
    return res.status(500).json({ received: false, error: String(error?.message || error) });
  }
}
