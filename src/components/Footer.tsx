import React from "react";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";

export interface FooterProps {
  onNavigate?: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleScrollToSegment = (id: string) => {
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-brand-green text-green-100/90 pt-16 pb-8 border-t border-white/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12">
          
          {/* Main Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-wide font-display">
                Kalyani Restaurant
              </h3>
              <p className="text-sm text-green-100/70">
                Authentic flavors, crafted with love.
              </p>
            </div>
            <div className="text-xs text-green-100/60 pt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
                <span>Kochi, Kerala, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-green-100/80">
              <li>
                <button
                  onClick={() => handleScrollToSegment("#home")}
                  className="hover:text-brand-yellow transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollToSegment("#menu")}
                  className="hover:text-brand-yellow transition-colors text-left"
                >
                  Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScrollToSegment("#about-us")}
                  className="hover:text-brand-yellow transition-colors text-left"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Information Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-green-100/80">
              <li>
                <a 
                  href="/privacy-policy" 
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate("/privacy-policy");
                    }
                  }}
                  className="hover:text-brand-yellow transition-colors cursor-pointer"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-brand-yellow transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#refund" className="hover:text-brand-yellow transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#cookie" className="hover:text-brand-yellow transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-green-100/80">
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-brand-yellow shrink-0" />
                <a
                  href="mailto:info@kalyanirestaurant.store"
                  className="hover:text-brand-yellow transition-colors break-all text-xs"
                >
                  info@kalyanirestaurant.store
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-brand-yellow shrink-0" />
                <a href="tel:+918792496216" className="hover:text-brand-yellow transition-colors">
                  +91 87924 96216
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator Divider Line */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-green-100/50">
          <p>© 2026 Kalyani Restaurant. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span className="text-brand-yellow">Powered by</span>
            <span className="font-semibold text-white tracking-wide uppercase font-display">
              Kalyani Kitchen
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
