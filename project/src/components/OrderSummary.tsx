import { ShieldCheck } from 'lucide-react';

interface OrderSummaryProps {
  deliveryMethod: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ deliveryMethod }) => {
  const isUsb = deliveryMethod === 'usb';
  const price = isUsb ? 10000 : 7000;
  const discount = isUsb ? 5000 : 4000;
  const total = price - discount;

  const handleBuyNowClick = () => {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Résumé de la commande</h3>
      
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-lg h-16 w-16 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-800 font-bold text-xs text-center">
              {deliveryMethod === 'usb' ? 'USB' : 'LIEN'}
            </span>
          </div>
          <div>
            <h4 className="font-medium">200 dessins animés chrétiens</h4>
            <p className="text-sm text-gray-600">
              {deliveryMethod === 'usb' 
                ? 'Clé USB - Contenu pour enfants' 
                : 'Lien de téléchargement - Accès immédiat'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Prix</span>
          <span className="text-gray-800">{price.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Réduction</span>
          <span className="text-green-600">-{discount.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Livraison</span>
          <span className="text-gray-800">{isUsb ? 'Gratuite' : 'N/A'}</span>
        </div>
        <div className="pt-3 border-t border-gray-200 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-blue-800">{total.toLocaleString()} FCFA</span>
        </div>
      </div>

      <button
        onClick={handleBuyNowClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        Acheter maintenant
      </button>
      
      <div className="mb-6">
        <div className="flex items-start space-x-2 text-sm bg-gray-50 p-3 rounded-lg">
          <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-gray-700">
            Paiement 100% sécurisé. Vos informations sont protégées par un cryptage SSL.
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-700">Livraison rapide incluse</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-700">Garantie de satisfaction</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-700">Support disponible 24/7</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;