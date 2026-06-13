import React, { useState, useEffect } from "react";
import { 
  Bike, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  CheckCircle, 
  Truck, 
  Clock, 
  DollarSign, 
  Navigation, 
  Power, 
  RefreshCw,
  TrendingUp,
  Inbox
} from "lucide-react";
import { fetchAllOrders, updateOrderStatusInDB } from "../lib/supabase";

interface RiderDashboardProps {
  riderEmail: string;
  onLogout: () => void;
}

export function RiderDashboard({ riderEmail, onLogout }: RiderDashboardProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [orders, setOrders] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const loadRiderData = async () => {
    const rawOrders = await fetchAllOrders();
    setOrders(rawOrders);
  };

  useEffect(() => {
    loadRiderData();
    const interval = setInterval(loadRiderData, 6000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  // 1. MARK AS OUT FOR DELIVERY (PICKED UP)
  const handleMarkPickedUp = async (orderId: string) => {
    await updateOrderStatusInDB(orderId, "Out for Delivery");
    loadRiderData();
    triggerNotification(`Order ${orderId} picked up! Safe riding!`);
    
    // Dispatch standard browser event so user view also reflects this change
    window.dispatchEvent(new Event("storage"));
  };

  // 2. MARK AS DELIVERED
  const handleMarkDelivered = async (orderId: string) => {
    await updateOrderStatusInDB(orderId, "Delivered");
    loadRiderData();
    triggerNotification(`Order ${orderId} delivered! Excellent work!`);
    
    window.dispatchEvent(new Event("storage"));
  };

  // Filter orders assigned specifically to this Rider
  const riderAssignedOrders = orders.filter((o: any) => o.riderEmail?.toLowerCase() === riderEmail.toLowerCase());

  // Split into active pending vs past completed deliveries
  const activeDeliveries = riderAssignedOrders.filter((o: any) => o.status !== "Delivered");
  const completedDeliveries = riderAssignedOrders.filter((o: any) => o.status === "Delivered");

  // Sum total cash collections
  const totalCompletedEarnings = completedDeliveries.reduce((acc: number, curr: any) => acc + curr.total, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col pt-16">
      
      {/* Rider Header Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 sticky top-16 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-brand-green/20 rounded-full flex items-center justify-center border border-brand-green/30">
              <Bike className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase font-display text-white tracking-widest leading-none">
                RIDER PORTAL
              </h1>
              <p className="text-[10px] text-neutral-400 mt-1 select-all font-mono">
                {riderEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadRiderData}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all rounded cursor-pointer active:scale-95"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-extrabold uppercase text-[9px] flex items-center gap-1 transition-all"
            >
              <Power className="w-3 h-3" /> EXIT
            </button>
          </div>
        </div>
      </div>

      {/* Rider Floating Action Alert */}
      {notification && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-50 bg-brand-green border border-green-400/30 text-white shadow-2xl px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-bounce flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-yellow" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container Mobile Friendly */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4 pb-20">
        
        {/* Earnings & Success Stats box */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 grid grid-cols-2 gap-4">
          <div className="text-center space-y-1 border-r border-neutral-800 pr-2">
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3 text-brand-green" />
              Cash Collected
            </span>
            <p className="text-xl font-black font-mono text-white">₹{totalCompletedEarnings}</p>
            <p className="text-[8px] text-neutral-500">Collected from user base</p>
          </div>

          <div className="text-center space-y-1 pl-2">
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-brand-green" />
              Trips Completed
            </span>
            <p className="text-xl font-black font-mono text-white">{completedDeliveries.length}</p>
            <p className="text-[8px] text-neutral-500">100% success rating</p>
          </div>
        </div>

        {/* Tab Selection Filter */}
        <div className="flex bg-neutral-900 rounded-xl p-1 border border-neutral-800 gap-1 text-[11px] font-extrabold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2 rounded-lg text-center transition-all ${
              activeTab === "pending"
                ? "bg-brand-green text-white font-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Active Rides ({activeDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              activeTab === "completed"
                ? "bg-brand-green text-white font-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            History ({completedDeliveries.length})
          </button>
        </div>

        {/* Deliveries Display list */}
        {activeTab === "pending" ? (
          <div className="space-y-4">
            {activeDeliveries.length === 0 ? (
              <div className="bg-neutral-900/40 rounded-2xl border border-neutral-900/60 p-8 text-center text-neutral-500">
                <Inbox className="w-10 h-10 mx-auto text-neutral-800 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">All Clear!</p>
                <p className="text-[10px] text-neutral-600 mt-1">Admin has not assigned any active orders to your queue yet.</p>
              </div>
            ) : (
              activeDeliveries.map((order) => {
                return (
                  <div key={order.id} className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-4.5 shadow-xl">
                    
                    {/* Header info */}
                    <div className="flex justify-between items-start border-b border-neutral-800/80 pb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black text-brand-yellow uppercase">{order.id}</span>
                          <span className="bg-blue-950 text-blue-300 font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded border border-blue-900">
                            {order.status || "Preparing"}
                          </span>
                        </div>
                        <div className="text-[9px] text-neutral-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          <span>Placed: {order.timestamp || "Just Now"}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-neutral-500 block uppercase font-bold">Collect Cash On Hand</span>
                        <span className="text-base font-black text-white font-mono">₹{order.total}</span>
                      </div>
                    </div>

                    {/* Customer location details card layout */}
                    <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80 space-y-2.5">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-neutral-500 block uppercase font-black">Customer Destination</span>
                          <p className="text-xs text-neutral-100 font-semibold leading-relaxed">
                            {order.address || "Handover point counter"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-800/40">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <div>
                          <span className="text-[8px] text-neutral-500 block uppercase">Recipient Customer Name</span>
                          <span className="text-[11px] font-bold text-neutral-200 select-text">
                            {order.userName || "Customer Recipient"} (Call +91-7204995421)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Order List Overview */}
                    <div className="text-[10px] text-neutral-300 space-y-0.5 bg-neutral-950/20 p-2 rounded-lg">
                      <span className="text-[8px] font-extrabold text-neutral-500 uppercase tracking-widest block mb-1">
                        Dispatched Bag
                      </span>
                      {order.items?.map((it: any, index: number) => (
                        <div key={index} className="flex justify-between font-medium">
                          <span>{it.item.name} <strong className="text-brand-yellow">x{it.quantity}</strong></span>
                          <span className="text-neutral-400 font-mono">₹{it.item.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Interactive workflow action status buttons */}
                    <div className="pt-2">
                      {order.status !== "Out for Delivery" ? (
                        <button
                          onClick={() => handleMarkPickedUp(order.id)}
                          className="w-full bg-brand-green hover:bg-brand-green/95 text-white py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-98 shadow-md"
                        >
                          <Truck className="w-4 h-4 text-brand-yellow" />
                          Mark Out for Delivery (Picked Up)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-98 shadow-md shadow-blue-900/10"
                        >
                          <CheckCircle className="w-4 h-4 text-brand-yellow" />
                          Mark Delivered (Unlock payment collected)
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {completedDeliveries.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center italic py-10">No past deliveries on your account record yet.</p>
            ) : (
              [...completedDeliveries].reverse().map((order) => (
                <div key={order.id} className="bg-neutral-900/65 rounded-xl border border-neutral-800/80 p-3 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-extrabold text-neutral-300">{order.id}</span>
                      <span className="text-[8px] bg-green-950 text-green-300 px-1.5 py-0.2 rounded font-black border border-green-900">
                        SUCCESS
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400">{order.address?.split(",")[0] || "Custom Delivey"}</p>
                  </div>
                  <div className="text-right font-semibold">
                    <span className="text-brand-yellow block font-black text-xs font-mono">₹{order.total}</span>
                    <span className="text-[8px] text-neutral-500 font-medium">Collected Cash</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

    </div>
  );
}
