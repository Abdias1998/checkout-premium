import React from 'react';
import { Star } from 'lucide-react';

const TestimonialSection: React.FC = () => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Ce que nos clients disent</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-gray-700 mb-4">
              "Ces dessins animés sont parfaits pour mes enfants. Ils adorent regarder les histoires bibliques et apprendre de manière amusante. La clé USB est très pratique pour l'utiliser sur différents appareils."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                MM
              </div>
              <div>
                <h4 className="font-medium">Marie Mensah</h4>
                <p className="text-sm text-gray-500">Mère de 3 enfants</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-gray-700 mb-4">
              "Une collection incroyable d'histoires bibliques. Mes enfants sont captivés par les animations et les enseignements. Je recommande vivement ce produit à tous les parents chrétiens."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                PK
              </div>
              <div>
                <h4 className="font-medium">Paul Koffi</h4>
                <p className="text-sm text-gray-500">Pasteur</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex text-yellow-400 mb-3">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
              <Star className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-gray-700 mb-4">
              "La qualité des animations est excellente et le contenu est très éducatif. Ma fille a beaucoup appris sur les histoires bibliques. La livraison a été rapide et le service client très réactif."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                ST
              </div>
              <div>
                <h4 className="font-medium">Sophie Tonou</h4>
                <p className="text-sm text-gray-500">Enseignante</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;