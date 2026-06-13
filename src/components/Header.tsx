import React, { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, ClipboardList, LogOut, Menu as MenuIcon, ShoppingCart, User, X } from "lucide-react";
import { ElegantImage } from "./ElegantImage";
import { MobileTab } from "../types";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  userEmail: string | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateAccount: (tab: MobileTab) => void;
}

export function Header({
  cartCount,
  onOpenCart,
  onOpenLogin,
  userEmail,
  onLogout,
  onNavigateHome,
  onNavigateAccount,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Menu", href: "#menu" },
    { label: "About Us", href: "#about-us" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    onNavigateHome();
    window.setTimeout(() => {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAccountNav = (tab: MobileTab) => {
    setAccountMenuOpen(false);
    onNavigateAccount(tab);
  };

  return (
    <header className="bg-brand-green text-white sticky top-0 z-50 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center space-x-3 group animate-in fade-in slide-in-from-top-1 duration-300 cursor-pointer"
        >
          <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 shadow-inner border border-brand-green/20">
            <ElegantImage
              src="src/Public/Logo/logo.png"
              fallback="src/Public/Logo/logo.png"
              alt="Kalyani Kitchen Logo"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>
          <span className="font-extrabold text-xl tracking-wider leading-tight text-white group-hover:text-brand-yellow/90 transition-colors font-display">
            KALYANI KITCHEN
          </span>
        </button>

        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex space-x-8 font-medium">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick(item.href);
                }}
                className="text-white hover:text-brand-yellow/90 py-2 transition-colors text-sm uppercase tracking-wider relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-yellow transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 text-white hover:text-brand-yellow transition-colors bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10 cursor-pointer"
            title="View Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-yellow text-brand-green text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

          {userEmail ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="bg-white text-brand-green px-4 py-2.5 rounded-full font-extrabold text-xs tracking-wider hover:bg-brand-yellow transition-all shadow-md flex items-center gap-2 uppercase cursor-pointer"
              >
                <User className="w-4 h-4" />
                Account
                <ChevronDown className={`w-4 h-4 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">Signed in</p>
                    <p className="text-xs text-neutral-800 font-semibold truncate">{userEmail}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAccountNav("orders")}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4 text-brand-green" />
                    My Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountNav("notifications")}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-brand-green" />
                    Notifications
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountNav("profile")}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-brand-green" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-neutral-100 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="bg-white text-brand-green border border-transparent px-5 py-2.5 rounded-full font-extrabold text-xs tracking-wider hover:bg-brand-yellow hover:text-brand-green transition-all shadow-md flex items-center gap-2 uppercase cursor-pointer"
            >
              <User className="w-4 h-4" />
              SIGN IN
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4 md:hidden">
          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 text-white hover:text-brand-yellow transition-colors bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10 cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-yellow text-brand-green text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-brand-yellow focus:outline-none focus:ring-2 focus:ring-white rounded-full bg-white/10 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-green border-t border-white/15 px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-semibold">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick(item.href);
                }}
                className="text-white hover:text-brand-yellow py-2.5 text-base rounded hover:bg-white/10 px-3 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/15">
            {!userEmail && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full text-center bg-white text-brand-green px-4 py-3 rounded-lg font-extrabold text-sm hover:bg-brand-yellow transition-all shadow cursor-pointer"
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
