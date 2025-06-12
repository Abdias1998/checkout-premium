import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

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

interface CheckoutFormProps {
  deliveryMethod: 'usb' | 'link';
  setDeliveryMethod: (method: 'usb' | 'link') => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ deliveryMethod, setDeliveryMethod }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    mobileOperator: 'mtn',
    mobileNumber: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const apiKey = "fp_HHNoQGt9Vn8KpZoLaBkG3uEeKpLUYBaHUZIZXJE3Xgv0OKG2tK3A7PtlytctikrJ";
    const shopId = "671a774c706593edb3dc4ab2";

    const amount = deliveryMethod === 'usb' ? 5000 : 3000;

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
      address: formData.address,
      type: deliveryMethod,
      callback_info: {
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        type: deliveryMethod,
      },
    };

    try {
      const initialResponse = await fetch(`https://api.feexpay.me/api/transactions/public/requesttopay/${formData.mobileOperator}`, {
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
          const statusResponse = await fetch(`https://api.feexpay.me/api/transactions/getrequesttopay/integration/${reference}`, {
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
        if (formData.email && formData.email.trim() !== '') {
          // Envoyer l'email de confirmation
          const templateParams = {
            to_name: `${formData.firstName} ${formData.lastName}`,
            to_email: formData.email,
            delivery_type: deliveryMethod === 'usb' ? 'Clé USB' : 'Lien Vidéo',
            delivery_info: deliveryMethod === 'usb'
              ? `Votre clé USB sera livrée à l'adresse suivante : ${formData.address}. Nous vous contacterons au ${formData.phone} pour confirmer.`
              : 'Vous pouvez accéder à votre vidéo via ce lien : https://drive.google.com/drive/folders/1CvC21AFYVv0C2Xw8yw-UvXN7ffr-ow5g?usp=sharing',
            transaction_reference: reference, // référence que tu génères ou reçois
            amount: amount, // montant payé
          };
          
          try {
            await emailjs.send(
              'service_p23fwvh', // Remplacez par votre Service ID EmailJS
              'template_9b8zrkw', // Remplacez par votre Template ID EmailJS
              templateParams,
              'DcVixUWN5yqMZFiX7' // Remplacez par votre Public Key EmailJS
            );
            setNotification({ type: 'success', message: 'Paiement réussi ! Un email de confirmation vous a été envoyé.' });
          } catch (emailError) {
            console.error('Failed to send email:', emailError);
            setNotification({ type: 'success', message: 'Paiement réussi, mais l\'envoi de l\'email de confirmation a échoué. Veuillez vérifier votre adresse email.' });
          }
        } else {
          // Gérer le cas où l'adresse e-mail est vide
          console.error('Recipient email address is empty. Cannot send confirmation email.');
          setNotification({ type: 'success', message: 'Paiement réussi ! (L\'email de confirmation n\'a pas pu être envoyé car l\'adresse email est manquante).' });
        }
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

      {notification && (
        <div className={`p-4 mb-4 rounded-lg flex items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error'   ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800' // info
        }`}>
          {notification.type === 'success' && <CheckCircle className="mr-2 h-5 w-5" />}
          {notification.type === 'error' && <AlertCircle className="mr-2 h-5 w-5" />}
          {notification.message}
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">Comment souhaitez-vous recevoir votre commande ?</h3>
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setDeliveryMethod('usb')}
            className={`flex-1 py-2 px-4 rounded-l-md transition-colors ${deliveryMethod === 'usb' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Clé USB
          </button>
          <button
            type="button"
            onClick={() => setDeliveryMethod('link')}
            className={`flex-1 py-2 px-4 rounded-r-md transition-colors ${deliveryMethod === 'link' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Lien vidéo
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
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
              Vous serez redirigé pour confirmer le paiement sur votre téléphone.
            </p>
          </div>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-gray-400">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
        <span>{isLoading ? 'Paiement en cours...' : 'Valider et payer'}</span>
      </button>
    </form>
  );
};

export default CheckoutForm;