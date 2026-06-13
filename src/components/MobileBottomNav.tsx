import { Bell, ClipboardList, Home, User } from "lucide-react";
import { MobileTab } from "../types";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  orderCount: number;
  onNavigateHome: () => void;
  onNavigateOrders: () => void;
  onNavigateNotifications: () => void;
  onNavigateProfile: () => void;
}

export function MobileBottomNav({
  activeTab,
  orderCount,
  onNavigateHome,
  onNavigateOrders,
  onNavigateNotifications,
  onNavigateProfile,
}: MobileBottomNavProps) {
  return (
    <div
      id="mob-nav-bar"
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-neutral-200/95 shadow-[0_-10px_35px_rgba(0,0,0,0.12)] z-40 lg:hidden px-4 sm:px-10 flex items-center justify-around select-none transition-all duration-300 pb-[calc(1.75rem+env(safe-area-inset-bottom,10px))] pt-4"
    >
      <button
        type="button"
        onClick={onNavigateHome}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-all cursor-pointer ${
          activeTab === "home" ? "text-brand-green scale-105 font-black" : "text-neutral-400 font-medium"
        }`}
      >
        <Home className="w-5.5 h-5.5" />
        <span className="text-[10px] mt-1.5 uppercase tracking-wider">Home</span>
      </button>

      <button
        type="button"
        onClick={onNavigateOrders}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-all relative cursor-pointer ${
          activeTab === "orders" ? "text-brand-green scale-105 font-black" : "text-neutral-400 font-medium"
        }`}
      >
        <ClipboardList className="w-5.5 h-5.5" />
        <span className="text-[10px] mt-1.5 uppercase tracking-wider">My Orders</span>
        {orderCount > 0 && activeTab !== "orders" && (
          <span className="absolute top-0 right-1/4 bg-brand-yellow text-brand-green font-extrabold text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-white">
            {orderCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onNavigateNotifications}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-all relative cursor-pointer ${
          activeTab === "notifications" ? "text-brand-green scale-105 font-black" : "text-neutral-400 font-medium"
        }`}
      >
        <Bell className="w-5.5 h-5.5" />
        <span className="text-[10px] mt-1.5 uppercase tracking-wider">Alerts</span>
        {activeTab !== "notifications" && (
          <span className="absolute top-1.5 right-[32%] bg-red-500 h-2 w-2 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      <button
        type="button"
        onClick={onNavigateProfile}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-all cursor-pointer ${
          activeTab === "profile" ? "text-brand-green scale-105 font-black" : "text-neutral-400 font-medium"
        }`}
      >
        <User className="w-5.5 h-5.5" />
        <span className="text-[10px] mt-1.5 uppercase tracking-wider">Profile</span>
      </button>
    </div>
  );
}
