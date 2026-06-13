import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ClipboardList, 
  Users, 
  Utensils, 
  Plus, 
  Trash2, 
  Check, 
  Truck, 
  UserCheck, 
  ChevronRight, 
  RefreshCw, 
  ShieldAlert, 
  Bike,
  Power,
  X,
  MapPin,
  Clock,
  DollarSign
} from "lucide-react";
import { 
  fetchRegisteredUsers,
  fetchAllOrders, 
  updateOrderStatusInDB, 
  assignRiderToOrderInDB, 
  fetchMenuCustomizer, 
  saveMenuCustomizerInDB 
} from "../lib/supabase";
import { MENU_ITEMS } from "../data";

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
}

export function AdminDashboard({ adminEmail, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "riders" | "menu" | "analytics">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  // New Rider Form States
  const [riderName, setRiderName] = useState("");
  const [riderEmail, setRiderEmail] = useState("");
  const [riderPassword, setRiderPassword] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderVehicle, setRiderVehicle] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load backend states from Supabase & Fallbacks
  const loadDashboardData = async () => {
    // 1. Load orders
    const storedOrders = await fetchAllOrders();
    setOrders(storedOrders);

    // 2. Load riders from registered users
    const allUsers = await fetchRegisteredUsers();
    const filteredRiders = allUsers.filter((u: any) => u.role === "RIDER");
    setRiders(filteredRiders);

    // 3. Load menu with overrides
    const menuCustoms = await fetchMenuCustomizer();
    const configuredMenu = MENU_ITEMS.map(item => {
      const custom = menuCustoms[item.id] || {};
      return {
        ...item,
        price: custom.price !== undefined ? custom.price : item.price,
        inStock: custom.inStock !== undefined ? custom.inStock : true
      };
    });
    setMenuItems(configuredMenu);
  };

  useEffect(() => {
    loadDashboardData();
    // Refresh interval
    const interval = setInterval(loadDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. UPDATE ORDER STATUS
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    await updateOrderStatusInDB(orderId, status);
    loadDashboardData();
    triggerNotification("success", `Order ${orderId} updated to ${status}`);
    
    // Auto-update standard user context
    window.dispatchEvent(new Event("storage"));
  };

  // 2. ASSIGN RIDER TO ORDER
  const handleAssignRider = async (orderId: string, riderEmailValue: string) => {
    const riderObj = riders.find((r: any) => r.email === riderEmailValue);
    const targetRiderName = riderObj ? riderObj.name : "Assigned Rider";
    
    await assignRiderToOrderInDB(orderId, riderEmailValue, targetRiderName);
    loadDashboardData();
    triggerNotification("success", `Rider assigned successfully to Order ${orderId}`);
    
    window.dispatchEvent(new Event("storage"));
  };

  // 3. RECRUIT A NEW RIDER
  // (Rider creation from frontend has been removed for security reasons)

  // 4. MENU CUSTOMIZATION
  const handleToggleMenuAvailability = async (itemId: string, currentStock: boolean) => {
    await saveMenuCustomizerInDB(itemId, { inStock: !currentStock });
    loadDashboardData();
    triggerNotification("success", `Menu item status updated successfully.`);
  };

  const handleUpdatePrice = async (itemId: string, newPrice: number) => {
    await saveMenuCustomizerInDB(itemId, { price: newPrice });
    loadDashboardData();
    triggerNotification("success", `Dish price updated successfully.`);
  };

  // Calculations for analytics
  const totalRevenue = orders
    .filter((o: any) => o.status === "Delivered")
    .reduce((acc: number, curr: any) => acc + curr.total, 0);

  const pendingCount = orders.filter((o: any) => ["Pending", "Preparing", "Ready for Pickup", "Out for Delivery"].includes(o.status)).length;
  
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex flex-col pt-16 select-none">
      
      {/* Admin Subheader Panel */}
      <div className="bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-brand-yellow animate-pulse" />
              <h1 className="text-xl font-black font-display text-white tracking-wider uppercase">
                ADMIN COMMAND PORTAL
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Logged in: <strong className="text-neutral-200">{adminEmail}</strong> (Super Administator Override)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadDashboardData}
              className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-neutral-200 transition-all cursor-pointer active:scale-95 text-xs font-semibold flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button 
              onClick={onLogout}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all cursor-pointer active:scale-95 text-xs font-bold leading-none flex items-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" /> LOG OUT
            </button>
          </div>
        </div>
      </div>

      {/* Floating System Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border transition-all duration-300 transform translate-y-0 ${
          notification.type === "success" 
            ? "bg-green-900/90 border-green-700 text-green-200" 
            : "bg-red-900/90 border-red-700 text-red-200"
        }`}>
          <ShieldAlert className="w-4 h-4 text-brand-yellow" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Admin Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Nav Selection */}
        <div className="space-y-2 lg:col-span-1">
          <div className="bg-neutral-800 rounded-xl p-3 border border-neutral-700/80 space-y-1.5">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all ${
                activeTab === "orders" 
                  ? "bg-brand-green text-white shadow-md font-black" 
                  : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> 
                Dispatch Desk
              </span>
              {pendingCount > 0 && (
                <span className="bg-brand-yellow text-neutral-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full ring-2 ring-neutral-800">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("riders")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === "riders" 
                  ? "bg-brand-green text-white shadow-md font-black" 
                  : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              <Bike className="w-4 h-4" /> Recruit Riders
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === "menu" 
                  ? "bg-brand-green text-white shadow-md font-black" 
                  : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              <Utensils className="w-4 h-4" /> Menu Stock Control
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === "analytics" 
                  ? "bg-brand-green text-white shadow-md font-black" 
                  : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Operations Insights
            </button>
          </div>

          {/* Quick Overview Mini Panel */}
          <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-800 text-xs text-neutral-400 space-y-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Command Summary</span>
            <div className="flex justify-between">
              <span>Earnings Delivered:</span>
              <span className="text-white font-bold font-mono">₹{totalRevenue}</span>
            </div>
            <div className="flex justify-between">
              <span>Recruited Riders:</span>
              <span className="text-white font-bold">{riders.length} active</span>
            </div>
          </div>
        </div>

        {/* Tab View Contents */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* ================= tab 1: ORDERS DISPATCH DESK ================= */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  Live Dispatch Control Block
                </h2>
                <span className="text-xs text-neutral-400 font-medium">
                  {orders.length} total orders recorded
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-neutral-800/40 rounded-xl p-8 border border-neutral-800 text-center text-neutral-500">
                  <ClipboardList className="w-12 h-12 mx-auto text-neutral-700 mb-2" />
                  <p className="text-xs font-semibold">No order logs placed yet on this system.</p>
                  <p className="text-[10px] text-neutral-600 mt-1">When users place orders, they will appear dynamically here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...orders].reverse().map((order) => {
                    return (
                      <div 
                        key={order.id}
                        className={`bg-neutral-800 rounded-xl border p-4 sm:p-5 transition-all space-y-4 ${
                          order.status === "Delivered" 
                            ? "border-neutral-800/80 opacity-70" 
                            : "border-neutral-700 shadow-md shadow-black/20"
                        }`}
                      >
                        {/* Order Header info */}
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-neutral-700 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-black text-brand-yellow uppercase tracking-wider">
                                {order.id}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                order.status === "Delivered" ? "bg-green-950 text-green-300 border border-green-900" :
                                order.status === "Out for Delivery" ? "bg-blue-950 text-blue-300 border border-blue-900" :
                                order.status === "Ready for Pickup" ? "bg-pink-950 text-pink-300 border border-pink-900" :
                                order.status === "Preparing" ? "bg-amber-950 text-amber-300 border border-amber-900" :
                                "bg-red-950 text-red-300 border border-red-900 animate-pulse"
                              }`}>
                                {order.status || "Pending"}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-neutral-500" />
                              <span>{order.timestamp || "Just Now"}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-neutral-400 block font-semibold">Total Invoice Bill</span>
                            <span className="text-base font-black text-white font-mono">₹{order.total}</span>
                          </div>
                        </div>

                        {/* Order Items list */}
                        <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-lg">
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                            Ordered Spices / Food Plates
                          </span>
                          {order.items?.map((it: any, index: number) => (
                            <div key={index} className="flex justify-between text-xs font-semibold">
                              <span className="text-neutral-300">
                                {it.item.name} <span className="text-brand-yellow font-bold">x{it.quantity}</span>
                              </span>
                              <span className="text-neutral-400 font-mono">₹{it.item.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Address & dispatch instructions */}
                        <div className="space-y-0.5 text-xs">
                          <span className="text-[9px] font-bold text-neutral-500 uppercase block">Delivery Location Block</span>
                          <p className="font-semibold text-neutral-200 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-yellow shrink-0 mt-0.5" />
                            <span>{order.address || "Handover counter pick"}</span>
                          </p>
                        </div>

                        {/* Rider Assignment & Action controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-700/60 text-xs">
                          
                          {/* Left: Rider Assign Select */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                              Assign Delivery Rider
                            </label>
                            {order.status === "Delivered" ? (
                              <p className="text-neutral-400 font-bold flex items-center gap-1 bg-neutral-900/40 p-1.5 rounded">
                                <UserCheck className="w-4 h-4 text-green-500" /> 
                                Delivered by: {order.riderName || "Internal Courier"}
                              </p>
                            ) : (
                              <div className="flex gap-2">
                                <select
                                  value={order.riderEmail || ""}
                                  onChange={(e) => handleAssignRider(order.id, e.target.value)}
                                  className="bg-neutral-700 border border-neutral-600 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-green flex-1"
                                >
                                  <option value="">-- Click to assign rider --</option>
                                  {riders.map((r: any) => (
                                    <option key={r.email} value={r.email}>
                                      🏍️ {r.name} ({r.vehicle || "Standard"})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Right: Update state status */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                              Quick Manual Status Step
                            </label>
                            <div className="flex gap-1.5">
                              {["Preparing", "Ready for Pickup", "Out for Delivery", "Delivered"].map((st) => {
                                const isActive = order.status === st;
                                return (
                                  <button
                                    key={st}
                                    onClick={() => handleUpdateOrderStatus(order.id, st)}
                                    className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                                      isActive 
                                        ? "bg-brand-green text-white font-black" 
                                        : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600 cursor-pointer"
                                    }`}
                                    title={`Set as ${st}`}
                                  >
                                    {st === "Ready for Pickup" ? "Ready" : st === "Out for Delivery" ? "Out" : st === "Preparing" ? "Prep" : "Done"}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= tab 2: RIDERS RECRUITMENT ================= */}
          {activeTab === "riders" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form panel to add riders */}
              <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 space-y-4 md:col-span-1">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-brand-yellow uppercase tracking-widest">
                    Recruit New Rider
                  </h3>
                  <p className="text-[10px] text-neutral-400 leading-snug">
                    Rider profiles are created strictly by administrators via secure SQL insertions in the Database Dashboard.
                  </p>
                </div>
                <div className="bg-neutral-700/50 p-4 rounded-lg border border-neutral-600 border-dashed">
                  <p className="text-xs text-neutral-300 font-medium text-center">
                    The ability to create admin/rider accounts from the frontend has been removed for strict security compliance.
                  </p>
                </div>
              </div>

              {/* Current Riders listing card */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">
                  Active Courier Staff ({riders.length})
                </h3>

                {riders.length === 0 ? (
                  <p className="text-neutral-500 text-xs italic">No rider accounts deployed yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {riders.map((r: any) => (
                      <div key={r.email} className="bg-neutral-800 rounded-xl p-4 border border-neutral-700/80 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-brand-green/25 rounded-full flex items-center justify-center text-brand-green text-xs font-extrabold">
                            🏍️
                          </div>
                          <div>
                            <p className="font-extrabold text-neutral-100 text-xs">{r.name}</p>
                            <p className="text-[10px] text-neutral-400 font-mono select-text">{r.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400 pt-2 border-t border-neutral-700/60 font-semibold">
                          <div>
                            <span className="text-[8px] text-neutral-500 block uppercase">Phone Contact</span>
                            <span className="text-neutral-200 font-mono select-text">{r.phone || "+917204995421"}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 block uppercase">License Plate</span>
                            <span className="text-neutral-200 font-mono">{r.vehicle || "Standard Bike"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= tab 3: MENU AVAILABILITY MENU CUSTOMIZER ================= */}
          {activeTab === "menu" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  Menu Stock Overrides
                </h3>
                <span className="text-xs text-neutral-400">
                  Toggle availability dynamically
                </span>
              </div>

              <div className="bg-neutral-800 rounded-xl border border-neutral-700 divide-y divide-neutral-700 overflow-hidden">
                {menuItems.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-neutral-700 overflow-hidden shrink-0 border border-neutral-600">
                        <img 
                          src={item.fallbackImage} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                          <h4 className="font-extrabold text-xs text-neutral-100">{item.name}</h4>
                        </div>
                        <p className="text-[10px] text-neutral-400 max-w-md line-clamp-1 truncate">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold self-end sm:self-auto">
                      {/* Price modifier input */}
                      <div className="flex items-center gap-1.5 bg-neutral-900 rounded px-2 py-1 border border-neutral-700">
                        <span className="text-neutral-500">₹</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdatePrice(item.id, Number(e.target.value))}
                          className="w-12 bg-transparent text-white font-mono focus:outline-none text-right font-bold"
                        />
                      </div>

                      {/* Stock availability toggle */}
                      <button
                        onClick={() => handleToggleMenuAvailability(item.id, item.inStock)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          item.inStock 
                            ? "bg-green-950 text-green-300 border border-green-800" 
                            : "bg-red-950 text-red-300 border border-red-800"
                        }`}
                      >
                        {item.inStock ? "● IN STOCK" : "○ SOLD OUT"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= tab 4: OPERATIONS ANALYTICS ================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              
              {/* Analytics grid stat blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Delivered Income</span>
                    <h3 className="text-2xl font-black font-mono text-white mt-1">₹{totalRevenue}</h3>
                    <p className="text-[9px] text-neutral-500 mt-1">From completed deliveries</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-950 flex items-center justify-center text-green-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Total Orders Logs</span>
                    <h3 className="text-2xl font-black font-mono text-white mt-1">{orders.length}</h3>
                    <p className="text-[9px] text-neutral-500 mt-1">Including pending orders</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Deployed Couriers</span>
                    <h3 className="text-2xl font-black font-mono text-white mt-1">{riders.length}</h3>
                    <p className="text-[9px] text-neutral-500 mt-1">Active recruited riders</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-blue-400">
                    <Bike className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Status breakdown bar */}
              <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Logistical Pipeline Ratios
                </h4>
                
                {orders.length === 0 ? (
                  <p className="text-xs text-neutral-500">No active breakdown ratios available yet.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="h-3 rounded-full bg-neutral-900 overflow-hidden flex w-full">
                      <div 
                        style={{ width: `${(orders.filter(o => o.status === "Delivered").length / orders.length) * 100}%` }}
                        className="bg-green-500" 
                        title="Delivered"
                      />
                      <div 
                        style={{ width: `${(orders.filter(o => o.status === "Out for Delivery").length / orders.length) * 100}%` }}
                        className="bg-blue-500" 
                        title="Out for Delivery"
                      />
                      <div 
                        style={{ width: `${(orders.filter(o => ["Preparing", "Ready for Pickup"].includes(o.status)).length / orders.length) * 100}%` }}
                        className="bg-amber-500" 
                        title="Preparing or Ready"
                      />
                      <div 
                        style={{ width: `${(orders.filter(o => !o.status || o.status === "Pending").length / orders.length) * 100}%` }}
                        className="bg-red-500" 
                        title="Pending"
                      />
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] font-extrabold uppercase text-neutral-400">
                      <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded bg-green-500" /> Delivered ({orders.filter(o => o.status === "Delivered").length})</span>
                      <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> Out for Delivery ({orders.filter(o => o.status === "Out for Delivery").length})</span>
                      <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> In-Kitchen Preparing ({orders.filter(o => ["Preparing", "Ready for Pickup"].includes(o.status)).length})</span>
                      <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded bg-red-500" /> Unprocessed orders ({orders.filter(o => !o.status || o.status === "Pending").length})</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
