import { PlayCircle, ShieldCheck, Download, Award } from 'lucide-react';
import background from '../assets/background.jpeg'

const ProductSection: React.FC = () => {
  const handleBuyNowClick = () => {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
      <div className="flex flex-col space-y-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-1">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-blue-500/30 z-0"></div>
          <img 
            src={background} 
            alt="USB drive with Christian animated cartoons" 
            className="w-full h-auto rounded-lg object-cover z-10 relative"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-transparent p-4 text-white">
            <h3 className="text-lg font-bold">Clé USB incluse</h3>
            <p className="text-sm">Prête à l'emploi sur tous vos appareils</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 animate-fade-in">
          <h3 className="font-bold text-lg mb-2 text-blue-800">Ce que vous recevez:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <PlayCircle className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <span className="font-medium">200 dessins animés chrétiens</span>
                <p className="text-sm text-gray-600">Histoires bibliques captivantes pour enfants</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Download className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <span className="font-medium">Format compatible</span>
                <p className="text-sm text-gray-600">Fonctionne sur ordinateur, tablette et télévision</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <span className="font-medium">Garantie de qualité</span>
                <p className="text-sm text-gray-600">Contenu éducatif et divertissant</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Award className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <span className="font-medium">Bonus inclus</span>
                <p className="text-sm text-gray-600">Ressources supplémentaires pour parents</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">200 dessins animés chrétiens</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">USB</span>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-gray-500 line-through text-lg">10000 FCFA</span>
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">-50%</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-red-600">5000 FCFA</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Clé USB incluse</p>
          </div>
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-gray-500 line-through text-lg">7000 FCFA</span>
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">-40%</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-red-600">3000 FCFA</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Lien de téléchargement</p>
          </div>
          
          <button 
            onClick={handleBuyNowClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 mb-4"
          >
            Acheter maintenant
          </button>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Moyens de paiement disponibles</h3>
              <div className="flex flex-wrap gap-2">
                <div className="bg-gray-100 rounded-md p-2 flex items-center justify-center w-14 h-10">
                  <span className="font-medium text-xs">MTN</span>
                </div>
                <div className="bg-gray-100 rounded-md p-2 flex items-center justify-center w-14 h-10">
                  <span className="font-medium text-xs">Orange</span>
                </div>
                <div className="bg-gray-100 rounded-md p-2 flex items-center justify-center w-14 h-10">
                  <span className="font-medium text-xs">Wave</span>
                </div>
                <div className="bg-gray-100 rounded-md p-2 flex items-center justify-center w-14 h-10">
                  <span className="font-medium text-xs">Moov</span>
                </div>
                <div className="bg-gray-100 rounded-md p-2 flex items-center justify-center w-14 h-10">
                  <span className="font-medium text-xs">Visa</span>
                </div>
                <div className="bg-gray-100 rounded-md p-2 flex items-center justify-center w-14 h-10">
                  <span className="font-medium text-xs">Master</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm border-t pt-4">
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <span>Partager</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <span>Nous contacter</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <span>Signaler</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-lg mb-4 text-blue-800">Pourquoi choisir ce produit?</h3>
          <p className="text-gray-700 mb-4">
            Offrez à vos enfants 200 dessins animés chrétiens captivants qui enseignent les valeurs bibliques de manière ludique et engageante. Toutes les histoires sont soigneusement adaptées pour les enfants.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-blue-800 font-medium">Livraison rapide de la clé USB partout au Bénin. Contenu prêt à l'emploi, sans installation complexe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSection;