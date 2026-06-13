import React, { useState } from "react";
import { Menu as MenuIcon, X, ShoppingCart, User } from "lucide-react";
import { ElegantImage } from "./ElegantImage";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  userEmail: string | null;
  onLogout: () => void;
}

export function Header({ cartCount, onOpenCart, onOpenLogin, userEmail, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Menu", href: "#menu" },
    { label: "About Us", href: "#about-us" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="bg-brand-green text-white sticky top-0 z-50 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <a href="#home" onClick={() => handleNavClick("#home")} className="flex items-center space-x-3 group animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 shadow-inner border border-brand-green/20">
            <ElegantImage
              src="src/Public/Logo/logo.png"
              fallback="src/Public/Logo/logo.png"
              alt="Kalyani Kitchen Logo"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider leading-tight text-white group-hover:text-brand-yellow/90 transition-colors font-display">
              KALYANI KITCHEN
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex space-x-8 font-medium">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="text-white hover:text-brand-yellow/90 py-2 transition-colors text-sm uppercase tracking-wider relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-yellow transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Cart Interaction */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-white hover:text-brand-yellow transition-colors bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10"
            title="View Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-yellow text-brand-green text-xs font-black rounded-full h-5 w-5 flex items-center justify-center animate-bounce shadow">
                {cartCount}
              </span>
            )}
          </button>

          {/* Login / Profile Button */}
          {userEmail ? (
            <div className="flex items-center space-x-3 bg-white/10 py-1.5 px-3 rounded-full border border-white/10">
              <span className="text-xs text-white max-w-[120px] truncate">{userEmail}</span>
              <button
                onClick={onLogout}
                className="text-xs bg-white text-brand-green px-3 py-1 rounded-full font-bold hover:bg-brand-yellow transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-white text-brand-green border border-transparent px-5 py-2.5 rounded-full font-extrabold text-xs tracking-wider hover:bg-brand-yellow hover:text-brand-green transition-all shadow-md hover:shadow-lg flex items-center gap-2 uppercase"
            >
              <User className="w-4 h-4" />
              SIGN IN
            </button>
          )}
        </div>

        {/* Mobile menu trigger + Cart */}
        <div className="flex items-center space-x-4 md:hidden">
          <button
            onClick={onOpenCart}
            className="relative p-2 text-white hover:text-brand-yellow transition-colors bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-yellow text-brand-green text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-brand-yellow focus:outline-none focus:ring-2 focus:ring-white rounded-full bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-green border-t border-white/15 px-4 pt-4 pb-6 space-y-4 shadow-xl transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-semibold">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="text-white hover:text-brand-yellow py-2.5 text-base rounded hover:bg-white/10 px-3 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/15 flex flex-col gap-3">
            {userEmail ? (
              <div className="space-y-2 px-3">
                <p className="text-xs text-white/80">Logged in as: <span className="font-bold text-white block truncate">{userEmail}</span></p>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-center bg-white/10 text-white border border-white/20 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-white hover:text-brand-green transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full text-center bg-white text-brand-green border border-transparent px-4 py-3 rounded-lg font-extrabold text-sm hover:bg-brand-yellow hover:text-brand-green transition-all shadow"
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
