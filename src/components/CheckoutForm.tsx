import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

// Lien de livraison affiché au payeur après paiement et envoyé par email
const VIDEO_LINK = 'https://drive.google.com/drive/folders/1CvC21AFYVv0C2Xw8yw-UvXN7ffr-ow5g?usp=sharing';

const EMAILJS_CONFIG = {
  serviceId: 'service_p23fwvh',
  templateId: 'template_9b8zrkw',
  publicKey: 'DcVixUWN5yqMZFiX7',
};

// Interfaces pour les réponses de l'API FeexPay
interface RequestPayResponse {
  reference: string;
  message?: string;
}

interface StatusResponse {
  status: 'SUCCESSFUL' | 'FAILED' | 'CANCELLED' | 'PENDING';
  message?: string;
}

// Helper pour créer une pause
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Envoi de l'email de confirmation avec 1 nouvelle tentative en cas d'échec.
// Retourne null si l'email a été envoyé, sinon le message d'erreur détaillé.
const sendConfirmationEmail = async (templateParams: Record<string, unknown>): Promise<string | null> => {
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        { publicKey: EMAILJS_CONFIG.publicKey }
      );
      return null;
    } catch (error) {
      console.error(`Échec de l'envoi de l'email (tentative ${attempt}/${maxAttempts}):`, error);
      if (attempt < maxAttempts) {
        await sleep(2000);
        continue;
      }
      const err = error as { text?: string; message?: string; status?: number };
      return err.text || err.message || `erreur EmailJS (statut ${err.status ?? 'inconnu'})`;
    }
  }
  return null;
};

interface CheckoutFormProps {
  deliveryMethod: 'usb' | 'link';
  setDeliveryMethod: (method: 'usb' | 'link') => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ deliveryMethod, setDeliveryMethod }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    address: '',
    mobileOperator: 'mtn',
    mobileNumber: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    link?: { href: string; label: string };
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const apiKey = "fp_KmimqoKTSOAiMqqRSWLeyDcmPuts3exVYxd2RILxCaGcK0sfXIPD8AXT98PyZPGa";
    const shopId = "PAjtgouuFlCibjn";

    const amount = deliveryMethod === 'usb' ? 10 : 10;

    const countryCodes: { [key: string]: string } = {
      'mtn': '229',
      'moov': '229',
      'celtiis_bj': '229',
      'moov_tg': '228',
      'togocom_tg': '228',
      'orange_ci': '225',
      'mtn_ci': '225',
      'orange_bf': '226',
    };
    const countryCode = countryCodes[formData.mobileOperator];
    const fullPhoneNumber = countryCode && !formData.mobileNumber.startsWith(countryCode)
      ? `${countryCode}${formData.mobileNumber}`
      : formData.mobileNumber;

    const requestBody = {
      amount,
      phoneNumber: fullPhoneNumber,
      shop: shopId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      description: `Achat ${deliveryMethod === 'usb' ? 'Clé USB' : 'Lien Vidéo'}`,
      email: formData.email,
      whatsapp: formData.whatsapp.replace(/\s+/g, ''),
      address: formData.address,
      type: deliveryMethod,
      callback_info: {
        phone: formData.phone,
        whatsapp: formData.whatsapp.replace(/\s+/g, ''),
        address: formData.address,
        email: formData.email,
        type: deliveryMethod,
      },
    };

    try {
      const initialResponse = await fetch(`https://api-v2.feexpay.me/api/transactions/public/requesttopay/${formData.mobileOperator}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const initialResult: RequestPayResponse = await initialResponse.json();
      if (!initialResponse.ok) {
        throw new Error(initialResult.message || 'Erreur lors de l\'initiation du paiement.');
      }

      const { reference } = initialResult;
      setNotification({ type: 'info', message: 'Demande envoyée. Veuillez valider sur votre téléphone...' });

      let paymentStatus = '';
      let finalStatusMessage = ''; // Pour stocker le message d'erreur spécifique
      const maxAttempts = 24; // 2 minutes  24

      for (let i = 0; i < maxAttempts; i++) {
        await sleep(5000);
        try {
          const statusResponse = await fetch(`https://api-v2.feexpay.me/api/transactions/public/single/status/${reference}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
          });

          if (statusResponse.ok) {
            const statusResult: StatusResponse = await statusResponse.json();
            if (statusResult.status === 'SUCCESSFUL') {
              paymentStatus = 'SUCCESSFUL';
              break;
            }
            if (statusResult.status === 'FAILED' || statusResult.status === 'CANCELLED') {
              finalStatusMessage = `Paiement ${statusResult.status === 'FAILED' ? 'échoué' : 'annulé'}. Référence de la transaction : ${reference}. Veuillez contacter le support si le problème persiste.`;
              throw new Error(finalStatusMessage);
            }
            // Si PENDING, on continue la boucle
          } else {
            // Gérer les erreurs de réseau ou de serveur pendant le polling, sans arrêter la boucle immédiatement
            console.warn(`Erreur lors de la vérification du statut (tentative ${i + 1}/${maxAttempts}): ${statusResponse.status}`);
          }
        } catch (pollError) {
          // Si l'erreur est due à un FAILED/CANCELLED, on la propage
          if (finalStatusMessage) throw pollError;
          // Pour d'autres erreurs de fetch, on log et on continue (ou on arrête si c'est critique)
          console.error(`Erreur critique pendant le polling (tentative ${i + 1}/${maxAttempts}):`, pollError);
          // Optionnel: décider d'arrêter le polling ici si l'erreur est persistante
        }
      }

      if (paymentStatus === 'SUCCESSFUL') {
        // Envoi de l'email de confirmation (avec nouvelle tentative en cas d'échec)
        let emailFailure: string | null = null;
        if (formData.email && formData.email.trim() !== '') {
          const templateParams = {
            to_name: `${formData.firstName} ${formData.lastName}`,
            to_email: formData.email,
            delivery_type: deliveryMethod === 'usb' ? 'Clé USB' : 'Lien Vidéo',
            delivery_info: deliveryMethod === 'usb'
              ? `Votre clé USB sera livrée à l'adresse suivante : ${formData.address}. Nous vous contacterons au ${formData.phone} pour confirmer.`
              : `Vous pouvez accéder à votre vidéo via ce lien : ${VIDEO_LINK}`,
            video_link: VIDEO_LINK,
            whatsapp: formData.whatsapp,
            transaction_reference: reference,
            amount: amount,
          };
          emailFailure = await sendConfirmationEmail(templateParams);
        } else {
          emailFailure = 'adresse email manquante';
        }

        const emailNote = emailFailure
          ? `L'email de confirmation n'a pas pu être envoyé : ${emailFailure}.`
          : 'Un email de confirmation vous a été envoyé.';

        setNotification({
          type: 'success',
          message: deliveryMethod === 'link'
            ? `Paiement réussi ! Cliquez sur le lien ci-dessous pour accéder à votre vidéo. ${emailNote}`
            : `Paiement réussi ! ${emailNote}`,
          link: deliveryMethod === 'link'
            ? { href: VIDEO_LINK, label: 'Ouvrir mon lien vidéo' }
            : undefined,
        });
      } else {
        // Si la boucle se termine et que le statut n'est pas SUCCESSFUL
        if (!finalStatusMessage) { // Si aucun message d'erreur spécifique n'a été défini (FAILED/CANCELLED)
            finalStatusMessage = `La confirmation du paiement a expiré après 2 minutes. Référence de la transaction : ${reference}. Veuillez contacter le support.`;
        }
        throw new Error(finalStatusMessage);
      }

    } catch (error) {
      if (error instanceof Error) {
        setNotification({ type: 'error', message: error.message });
      } else {
        setNotification({ type: 'error', message: 'Une erreur inattendue est survenue.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const mobileOperators = [
    { value: 'mtn', label: 'MTN Bénin' },
    { value: 'moov', label: 'Moov Bénin' },
    { value: 'celtiis_bj', label: 'Celtiis Bénin' },
    { value: 'moov_tg', label: 'Moov Togo' },
    { value: 'togocom_tg', label: 'Yas' },
    { value: 'orange_ci', label: 'Orange Côte d\'Ivoire' },
    { value: 'mtn_ci', label: 'MTN Côte d\'Ivoire' },
    { value: 'orange_bf', label: 'Orange Burkina' },
  ];

  return (
    <form id="checkout-form" onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Finaliser votre commande</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">1. Choisissez votre option</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label 
            className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${deliveryMethod === 'usb' ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="usb"
              checked={deliveryMethod === 'usb'}
              onChange={() => setDeliveryMethod('usb')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="font-bold text-gray-800">Clé USB</span>
              <p className="text-sm text-gray-600">Recevez une clé USB avec les 200 dessins animés.</p>
            </div>
          </label>
          <label 
            className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${deliveryMethod === 'link' ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="link"
              checked={deliveryMethod === 'link'}
              onChange={() => setDeliveryMethod('link')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="font-bold text-gray-800">Lien Vidéo</span>
              <p className="text-sm text-gray-600">Accès instantané via un lien de téléchargement.</p>
            </div>
          </label>
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-800 mb-3">2. Remplissez vos informations</h3>

   
      <div className="mb-6">
     
      </div>

      <div className="mb-6">
        {/* <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3> */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Votre prénom" required />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Votre nom" required />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="votre@email.com" required />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">Numéro WhatsApp</label>
            <input type="tel" id="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="+229 01 02 03 04 05" required />
            <p className="text-xs text-gray-500 mt-1">Nous vous contacterons sur ce numéro WhatsApp pour la confirmation et la livraison</p>
          </div>

          {deliveryMethod === 'usb' && (
            <>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Votre numéro de téléphone" required />
                <p className="text-xs text-gray-500 mt-1">Nous vous contacterons à ce numéro pour confirmer la livraison</p>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
                <textarea id="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Votre adresse complète pour la livraison" required></textarea>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Paiement par Mobile Money</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mobileOperator" className="block text-sm font-medium text-gray-700 mb-1">Opérateur</label>
            <select id="mobileOperator" value={formData.mobileOperator} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {mobileOperators.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Numéro de paiement</label>
            <input type="tel" id="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Numéro pour le paiement" required />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Vous aurez un push USSD pour confirmer le paiement
            </p>
          </div>
        </div>
      </div>
      {notification && (
        <div className={`p-4 mb-4 rounded-lg flex items-start ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error'   ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800' // info
        }`}>
          {notification.type === 'success' && <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />}
          {notification.type === 'error' && <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />}
          <div className="flex-1">
            <span>{notification.message}</span>
            {notification.link && (
              <div>
                <a
                  href={notification.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg transition-colors duration-200 shadow-md"
                >
                  <ExternalLink className="h-5 w-5" />
                  {notification.link.label}
                </a>
                <p className="text-xs text-green-700 mt-2">
                  Conservez ce lien, il vous donne un accès immédiat à votre vidéo.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-gray-400">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
        <span>{isLoading ? 'Paiement en cours...' : 'Valider et payer'}</span>
      </button>
    </form>
  );
};

export default CheckoutForm;
