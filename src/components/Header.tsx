import React from 'react';
import { ChevronDown, Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2 text-blue-700">
            <Menu className="w-6 h-6 md:hidden" />
          </div>
          <div className="flex items-center">
            <span className="text-blue-800 font-bold text-xl">More Of Jesus</span>
          </div>
        </div>
        
        {/* <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-700 hover:text-blue-700 transition-colors">Accueil</a>
          <a href="#" className="text-gray-700 hover:text-blue-700 transition-colors">Produits</a>
          <a href="#" className="text-gray-700 hover:text-blue-700 transition-colors">À propos</a>
          <a href="#" className="text-gray-700 hover:text-blue-700 transition-colors">Contact</a>
        </div> */}
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="relative cursor-pointer group">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">Benin(FCFA)</span>
                <ChevronDown className="h-4 w-4" /> 
              </div>
              
              {/* <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Benin(FCFA)</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Other countries</a>
              </div> */}
            </div>
          </div>
          
          {/* <div className="relative">
            <ShoppingBag className="h-6 w-6 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              1
            </span>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Header;