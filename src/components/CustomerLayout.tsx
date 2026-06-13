import { ReactNode } from "react";
import { ChefHat } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileTab } from "../types";

interface CustomerLayoutProps {
  children: ReactNode;
  cartCount: number;
  userEmail: string | null;
  navigatingState: boolean;
  activeMobileTab: MobileTab;
  orderCount: number;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateAccount: (tab: MobileTab) => void;
  onNavigate: (path: string) => void;
  showMobileNav: boolean;
  showWhatsApp?: boolean;
}

export function CustomerLayout({
  children,
  cartCount,
  userEmail,
  navigatingState,
  activeMobileTab,
  orderCount,
  onOpenCart,
  onOpenLogin,
  onLogout,
  onNavigateHome,
  onNavigateAccount,
  onNavigate,
  showMobileNav,
  showWhatsApp = true,
}: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col font-sans text-neutral-800 selection:bg-brand-green selection:text-white relative">
      {navigatingState && (
        <div className="fixed inset-0 bg-brand-green z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
            <ChefHat className="w-6 h-6 text-brand-yellow absolute animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-widest text-white mt-6 font-display">KALYANI KITCHEN</h2>
          <p className="text-xs text-green-200 mt-1 font-sans uppercase tracking-widest">Loading Fresh Flavors...</p>
        </div>
      )}

      <Header
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenLogin={onOpenLogin}
        userEmail={userEmail}
        onLogout={onLogout}
        onNavigateHome={onNavigateHome}
        onNavigateAccount={onNavigateAccount}
      />

      <main className={`flex-1 ${showMobileNav ? "pb-24 lg:pb-16" : "pb-16"}`}>{children}</main>

      <Footer onNavigate={onNavigate} />

      {showMobileNav && userEmail && (
        <MobileBottomNav
          activeTab={activeMobileTab}
          orderCount={orderCount}
          onNavigateHome={onNavigateHome}
          onNavigateOrders={() => onNavigateAccount("orders")}
          onNavigateNotifications={() => onNavigateAccount("notifications")}
          onNavigateProfile={() => onNavigateAccount("profile")}
        />
      )}

      {showWhatsApp && (
        <a
          href="https://wa.me/918792496216?text=Hello%20Kalyani%20Kitchen%2C%20I%20would%20like%20to%20place%20an%20order..."
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer group ${
            userEmail && showMobileNav ? "bottom-[98px] lg:bottom-6" : "bottom-6"
          }`}
          title="Order via WhatsApp"
        >
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.748.002-2.607-1.01-5.059-2.85-6.902C16.645 2.113 14.197 1.1 11.604 1.1 6.162 1.1 1.74 5.47 1.737 10.849c-.001 1.701.448 3.364 1.3 4.872l-.991 3.619 3.733-.969c1.493.81 3.07 1.236 4.606 1.236-.002 0-.002 0-.001 0zm11.332-6.52c-.312-.156-1.847-.91-2.128-1.012-.282-.102-.487-.156-.692.156-.204.312-.793 1.013-.974 1.22-.18.204-.36.23-.672.073-1.016-.411-1.921-.837-2.673-1.503-.591-.52-.942-1.127-1.059-1.33-.117-.204-.012-.315.089-.415.092-.091.205-.23.307-.347.102-.117.137-.197.205-.33.067-.13-.034-.249-.084-.351-.05-.102-.487-1.173-.672-1.611-.18-.433-.362-.375-.494-.381-.127-.006-.273-.008-.418-.008-.146 0-.381.054-.581.272-.2.218-.762.744-.762 1.815 0 1.072.78 2.106.89 2.253.11.147 1.534 2.341 3.717 3.284.519.224.924.359 1.242.46.521.166.996.143 1.368.088.416-.061 1.847-.756 2.109-1.451.262-.695.262-1.29.184-1.42s-.282-.204-.593-.362z" />
          </svg>
        </a>
      )}
    </div>
  );
}
