import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">More Of Jesus</h3>
            <p className="text-gray-400 mb-4">
              Votre partenaire de confiance pour du contenu chrétien de qualité pour toute la famille.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Accueil</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Produits</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">À propos</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Assistance</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Livraison</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Retours</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Conditions d'utilisation</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">+229 0153037832 / +229 0160661600</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">lagraceparle98@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} More Of Jesus. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;