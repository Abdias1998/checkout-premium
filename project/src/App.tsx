import { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductSection from './components/ProductSection';
import CheckoutForm from './components/CheckoutForm';
import OrderSummary from './components/OrderSummary';
import TestimonialSection from './components/TestimonialSection';
import Footer from './components/Footer';
import { ArrowUp } from 'lucide-react';

function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'usb' | 'link'>('usb');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 text-center mb-2">
            200 dessins animés chrétiens pour enfant
          </h1>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Offrez à vos enfants des histoires bibliques captivantes sur une clé USB prête à l'emploi
          </p>
        </div>
        
        <ProductSection />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <CheckoutForm deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod} />
          </div>
          <div className="md:col-span-1">
            <OrderSummary deliveryMethod={deliveryMethod} />
          </div>
        </div>
        
        <TestimonialSection />
      </main>
      
      <Footer />
      
      {showScrollTop && (
        <button 
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-50"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

export default App;