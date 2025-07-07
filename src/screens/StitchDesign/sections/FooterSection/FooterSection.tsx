import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export const FooterSection = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-[#2c1810] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/vector---0.svg" alt="Grubz logo" className="w-8 h-8" />
              <h2 className="text-2xl font-bold">
                <span className="text-white">Grub</span>
                <span className="text-[#dd3333]">z</span>
              </h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              The leading food delivery platform trusted by customers worldwide to connect them with their favorite restaurants and deliver delicious meals quickly and safely.
            </p>

          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#dd3333]" />
                <span className="text-gray-300 text-sm">support@grubz.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#dd3333]" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#dd3333]" />
                <span className="text-gray-300 text-sm">San Francisco, CA</span>
              </div>
            </div>
            
            {/* Partner Signup Options */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-3">Looking to partner with us?</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/partner-signup')}
                  className="block text-sm text-[#dd3333] hover:text-[#ff4444] transition-colors font-medium"
                >
                  Restaurant Partner Signup
                </button>
                <button
                  onClick={() => navigate('/driver-signup')}
                  className="block text-sm text-[#dd3333] hover:text-[#ff4444] transition-colors font-medium"
                >
                  Driver Partner Signup
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/auth')}
                className="block text-gray-300 hover:text-white text-sm transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="block text-gray-300 hover:text-white text-sm transition-colors"
              >
                Sign In
              </button>
              <a href="#features" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-white text-sm transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Reviews
              </a>
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Customer Care</h3>
            <div className="space-y-2">
              <a href="#help" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Help Center
              </a>
              <a href="#faq" className="block text-gray-300 hover:text-white text-sm transition-colors">
                FAQ
              </a>
              <a href="#track-order" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Track Your Order
              </a>
              <a href="#refunds" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Refunds & Returns
              </a>
              <a href="#contact" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Grubz. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
