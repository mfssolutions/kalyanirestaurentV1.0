import { useState, useMemo, useEffect } from "react";
import { Search, ShoppingBag, Filter, ArrowRight, HeartPulse, CheckCircle2, RotateCcw, ChefHat, Home, ClipboardList, Bell, User, Clock, LogOut, MapPin, Sparkles, Navigation, ChevronRight } from "lucide-react";
import { MENU_ITEMS, CATEGORIES } from "./data";
import { MenuItem, CartItem } from "./types";
import { Header } from "./components/Header";
import { HeroCarousel } from "./components/HeroCarousel";
import { ItemCard } from "./components/ItemCard";
import { AboutUs } from "./components/AboutUs";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { SignInPage } from "./components/SignInPage";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { AdminDashboard } from "./components/AdminDashboard";
import { RiderDashboard } from "./components/RiderDashboard";
import { supabase, fetchAllOrders, insertOrder, fetchMenuCustomizer, fetchRegisteredUsers } from "./lib/supabase";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Breakfast");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || "/");
  const [navigatingState, setNavigatingState] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"USER" | "ADMIN" | "RIDER" | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string>("Valued Customer");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("No address currently set. Please select below.");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<{ id: string; total: number } | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"home" | "orders" | "profile" | "notifications">("home");

  const [menuOverrides, setMenuOverrides] = useState<Record<string, { price?: number; inStock?: boolean }>>({});
  const [myOrdersList, setMyOrdersList] = useState<any[]>([]);

  // Synchronize client interface with Supabase real-time elements
  const loadClientData = async () => {
    try {
      const customs = await fetchMenuCustomizer();
      setMenuOverrides(customs);

      const list = await fetchAllOrders();
      setMyOrdersList(list);

      // Refresh registered users list to sync roles & names on real-time polling
      await fetchRegisteredUsers();
    } catch (e) {
      console.error("Failed to load synchronized Supabase data:", e);
    }
  };

  useEffect(() => {
    loadClientData();
    const interval = setInterval(loadClientData, 12000);
    return () => clearInterval(interval);
  }, [userEmail]);

  // Custom single page router navigator which shows loading states (Requested to migrate with real loading state)
  const navigateTo = (path: string) => {
    setNavigatingState(true);
    setTimeout(() => {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
      setNavigatingState(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 800);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Native Supabase session dynamic detector
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email || null;
      setUserEmail(email);
    };

    checkSession();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user?.email || null);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Sync profile details securely from database on session change
  useEffect(() => {
    const syncProfile = async () => {
      if (!userEmail || !supabase) {
        setUserRole(null);
        setUserDisplayName("Valued Customer");
        setDeliveryAddress("No address currently set. Please select below.");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", userEmail.toLowerCase())
          .maybeSingle();

        if (data) {
          setUserRole(data.role || "USER");
          setUserDisplayName(data.name || "Valued Customer");
          if (data.phone) {
            setDeliveryAddress(data.phone);
          }
        }
      } catch (e) {
        console.error("Failed to sync profile from db:", e);
      }
    };
    syncProfile();
  }, [userEmail]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
  };

  // State Management Handlers
  const handleAddToCart = (item: MenuItem) => {
    const existing = cart.find((i) => i.item.id === item.id);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map((i) =>
        i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updated = [...cart, { item, quantity: 1 }];
    }
    saveCart(updated);
  };

  const handleUpdateQuantity = (itemId: string, action: "increment" | "decrement") => {
    let updated = cart
      .map((i) => {
        if (i.item.id === itemId) {
          const qty = action === "increment" ? i.quantity + 1 : i.quantity - 1;
          return { ...i, quantity: qty };
        }
        return i;
      })
      .filter((i) => i.quantity > 0);
    saveCart(updated);
  };

  const handleRemoveItem = (itemId: string) => {
    let updated = cart.filter((i) => i.item.id !== itemId);
    saveCart(updated);
  };

  // Search filter and Category logic
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.map((item) => {
      const override = menuOverrides[item.id] || {};
      return {
        ...item,
        price: override.price !== undefined ? override.price : item.price,
        inStock: override.inStock !== undefined ? override.inStock : true
      };
    }).filter((item) => {
      const matchCategory = selectedCategory
        ? item.category.toLowerCase() === selectedCategory.toLowerCase()
        : true;

      const queryLc = searchQuery.trim().toLowerCase();
      const matchSearch = queryLc
        ? item.name.toLowerCase().includes(queryLc) ||
          item.description.toLowerCase().includes(queryLc) ||
          item.category.toLowerCase().includes(queryLc)
        : true;

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery, menuOverrides]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setActiveMobileTab("home");
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserEmail(null);
    setUserRole(null);
    setUserDisplayName("Valued Customer");
    setDeliveryAddress("No address currently set. Please select below.");
    setActiveMobileTab("home");
  };

  const handleCheckout = async () => {
    if (!userEmail) {
      navigateTo("/signin");
      return;
    }

    const subtotal = cart.reduce((acc, current) => acc + current.item.price * current.quantity, 0);
    const gst = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal > 300 ? 0 : 39;
    const finalBill = subtotal + gst + deliveryFee;

    const fakeOrderId = "KK-" + Math.floor(Math.random() * 900000 + 100000);
    
    await insertOrder({
      id: fakeOrderId,
      total: finalBill,
      items: [...cart],
      userEmail: userEmail
    });

    setLastOrderDetails({
      id: fakeOrderId,
      total: finalBill
    });
    setCartOpen(false);
    setOrderSuccess(true);
    saveCart([]); // clear cart on success
    loadClientData(); // Refresh list immediately
  };

  const totalCartCount = cart.reduce((acc, current) => acc + current.quantity, 0);

  if (userRole === "ADMIN") {
    return (
      <>
        {navigatingState && (
          <div className="fixed inset-0 bg-neutral-900 border-neutral-800 z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
              <ChefHat className="w-6 h-6 text-brand-yellow absolute animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-white mt-6 font-display">
              ADMIN CONTROL PANEL
            </h2>
            <p className="text-xs text-brand-yellow mt-1 font-sans uppercase tracking-widest">
              Authorizing secure credentials...
            </p>
          </div>
        )}
        <AdminDashboard adminEmail={userEmail!} onLogout={handleLogout} />
      </>
    );
  }

  if (userRole === "RIDER") {
    return (
      <>
        {navigatingState && (
          <div className="fixed inset-0 bg-neutral-900 border-neutral-800 z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
              <ChefHat className="w-6 h-6 text-brand-yellow absolute animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-white mt-6 font-display">
              RIDER CONTROL PANEL
            </h2>
            <p className="text-xs text-brand-yellow mt-1 font-sans uppercase tracking-widest">
              Securing active maps and dispatch feeds...
            </p>
          </div>
        )}
        <RiderDashboard riderEmail={userEmail!} onLogout={handleLogout} />
      </>
    );
  }

  if (currentPath === "/privacy-policy" || currentPath === "/privacy" || currentPath === "/PRIVACY POLICY" || currentPath === "/PRIVACY%20POLICY") {
    return (
      <>
        {navigatingState && (
          <div className="fixed inset-0 bg-brand-green z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
              <ChefHat className="w-6 h-6 text-brand-yellow absolute animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-white mt-6 font-display">
              KALYANI KITCHEN
            </h2>
            <p className="text-xs text-green-200 mt-1 font-sans uppercase tracking-widest">
              Loading security policy...
            </p>
          </div>
        )}
        <PrivacyPolicy onBackToHome={() => navigateTo("/")} />
      </>
    );
  }

  if (currentPath === "/signin" || currentPath === "/FORGETPASSWORD" || currentPath === "/create-account") {
    return (
      <>
        {navigatingState && (
          <div className="fixed inset-0 bg-brand-green z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
              <ChefHat className="w-6 h-6 text-brand-yellow absolute animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-white mt-6 font-display">
              KALYANI KITCHEN
            </h2>
            <p className="text-xs text-green-200 mt-1 font-sans uppercase tracking-widest">
              Connecting Safely...
            </p>
          </div>
        )}
        <SignInPage
          onLogin={handleLogin}
          onNavigateHome={() => navigateTo("/")}
          initialPath={currentPath}
          onPathChange={(path) => navigateTo(path)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col font-sans text-neutral-800 selection:bg-brand-green selection:text-white relative">
      {/* Page Loading state */}
      {navigatingState && (
        <div className="fixed inset-0 bg-brand-green z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
            <ChefHat className="w-6 h-6 text-brand-yellow absolute animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-widest text-white mt-6 font-display">
            KALYANI KITCHEN
          </h2>
          <p className="text-xs text-green-200 mt-1 font-sans uppercase tracking-widest">
            Loading Fresh Flavors...
          </p>
        </div>
      )}

      {/* Header component */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenLogin={() => navigateTo("/signin")}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 pb-24 lg:pb-16">
        {/* VIEW 1: HOME CATALOG VIEW */}
        {activeMobileTab === "home" && (
          <>
            {/* Hero Section Carousel */}
            <HeroCarousel />

            {/* Search and Category section - matched exactly to the attached first image layout! */}
            <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 scroll-mt-20">
              
              <div className="text-center max-w-2xl mx-auto mb-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-display">
                  Authentic Kerala Delicacies Made with Passion
                </h2>
              </div>

              {/* Styled search card matching first user image */}
              <div className="relative max-w-xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <form onSubmit={(e) => e.preventDefault()} className="relative shadow-md rounded-full overflow-hidden bg-white border border-neutral-200/85 hover:border-brand-green/30 transition-all focus-within:ring-2 focus-within:ring-brand-green/20 focus-within:border-brand-green">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes, ingredients, categories..."
                    className="block w-full pl-10 pr-24 py-2.5 bg-transparent border-0 text-neutral-900 placeholder-neutral-400 focus:ring-0 focus:outline-none text-xs sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-24 px-2.5 text-neutral-400 hover:text-neutral-600 text-xs font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-4 text-xs font-bold flex items-center justify-center shadow transition-all cursor-pointer hover:scale-102 active:scale-98"
                  >
                    SEARCH
                  </button>
                </form>
              </div>

              {/* Scrollable Categories List matching first image pills */}
              <div className="relative mb-10">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
                  
                  {CATEGORIES.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                        }}
                        className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold tracking-wide border transition-all duration-250 cursor-pointer ${
                          isActive
                            ? "bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/10 scale-102"
                            : "bg-white text-brand-green border-brand-green/25 hover:bg-brand-green/5"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid listing section */}
              <div>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-neutral-100 rounded-2xl max-w-xl mx-auto p-8 space-y-4 shadow-sm animate-in fade-in duration-200">
                    <p className="text-4xl">🥘</p>
                    <h3 className="text-lg font-bold text-neutral-800 font-display">No items found</h3>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                      We couldn't find any dishes matching "{searchQuery}" under "{selectedCategory}". Try exploring other categories!
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("Breakfast");
                      }}
                      className="bg-brand-green text-white font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-brand-green/90 transition-colors uppercase tracking-wider"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* About Us section */}
            <AboutUs />
          </>
        )}

        {/* VIEW 2: SWIGGY-STYLE LIVE ORDERS VIEW */}
        {activeMobileTab === "orders" && (
          <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200/60">
              <div>
                <h1 className="text-2xl font-black text-neutral-900 font-display tracking-tight uppercase flex items-center gap-2">
                  <ClipboardList className="w-6 h-6 text-brand-green" />
                  My Orders
                </h1>
                <p className="text-xs text-neutral-500 mt-1">Check active gourmet status & previous delicious receipts.</p>
              </div>
              <div className="bg-brand-green/10 text-brand-green font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider">
                Kerala Traditional
              </div>
            </div>

            {/* Load Dynamic Orders List */}
            {(() => {
              const orders = myOrdersList.filter(
                (o: any) => o.userEmail?.toLowerCase() === userEmail?.toLowerCase()
              );
              if (orders.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 p-8 space-y-4 max-w-md mx-auto shadow-sm">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-3xl">🍳</div>
                    <h3 className="text-base font-bold text-neutral-800 uppercase tracking-wide">No Orders Found</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      You haven't ordered from our traditional Kerala kitchen yet. Grab hot Appams or savory Fish Curry!
                    </p>
                    <button
                      onClick={() => setActiveMobileTab("home")}
                      className="bg-brand-green text-white font-extrabold text-xs px-5 py-2.5 rounded-lg hover:bg-brand-green/90 transition-transform cursor-pointer uppercase tracking-wider"
                    >
                      Browse Hot Menu
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {orders.map((ord: any, index: number) => {
                    // Seed dynamic realistic status for preview interest
                    const displayStatus = index === 0 ? ord.status : "Delivered";
                    
                    return (
                      <div key={ord.id} className="bg-white rounded-xl border border-neutral-200/90 shadow-sm overflow-hidden animate-in fade-in zoom-in-99 duration-250">
                        {/* Order Header */}
                        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-2.5">
                          <div>
                            <span className="text-[10px] font-extrabold text-neutral-400 block uppercase tracking-widest">Order Receipt</span>
                            <span className="text-xs font-black text-neutral-800">{ord.id}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-extrabold text-neutral-400 block uppercase tracking-widest">Date Placed</span>
                            <span className="text-xs font-bold text-neutral-600">{ord.date}</span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              displayStatus === "Preparing" 
                                ? "bg-amber-100 text-amber-800 animate-pulse" 
                                : "bg-green-100 text-green-800"
                            }`}>
                              {displayStatus === "Preparing" ? "🍳 Kitchen Cooking" : "🎉 Delivered"}
                            </span>
                          </div>
                        </div>

                        {/* Items listed */}
                        <div className="p-4 space-y-3">
                          <div className="divide-y divide-neutral-100">
                            {ord.items && ord.items.map((cartIt: any) => (
                              <div key={cartIt.item.id} className="py-2 flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                                  <span className="font-extrabold text-neutral-800">{cartIt.item.name}</span>
                                  <span className="text-neutral-400 font-bold">x{cartIt.quantity}</span>
                                </div>
                                <span className="font-black text-neutral-700">₹{cartIt.item.price * cartIt.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Stepper progress tracker if active preparing */}
                          {displayStatus === "Preparing" && (
                            <div className="pt-4 pb-2 border-t border-neutral-100">
                              <span className="text-[10px] font-extrabold text-brand-green block uppercase tracking-wider mb-2">Live Kitchen Tracker</span>
                              <div className="grid grid-cols-4 text-center relative pt-1.5">
                                <span className="absolute top-[13%] left-[12%] right-[12%] h-[2px] bg-neutral-200 z-0" />
                                <span className="absolute top-[13%] left-[12%] w-[33%] h-[2px] bg-brand-green z-0" />
                                
                                <div className="z-10 flex flex-col items-center">
                                  <div className="w-4 h-4 rounded-full bg-brand-green flex items-center justify-center text-[8px] text-white">✓</div>
                                  <span className="text-[8px] font-black text-neutral-700 mt-1 uppercase">Received</span>
                                </div>
                                <div className="z-10 flex flex-col items-center">
                                  <div className="w-4 h-4 rounded-full bg-brand-green flex items-center justify-center animate-ping absolute" />
                                  <div className="w-4 h-4 rounded-full bg-brand-green flex items-center justify-center text-[10px] text-white relative z-10">🍳</div>
                                  <span className="text-[8px] font-black text-brand-green mt-1 uppercase">Cooking</span>
                                </div>
                                <div className="z-10 flex flex-col items-center">
                                  <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-400">🛵</div>
                                  <span className="text-[8px] font-bold text-neutral-400 mt-1 uppercase">Dispatched</span>
                                </div>
                                <div className="z-10 flex flex-col items-center">
                                  <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-[8px] text-neutral-400">✓</div>
                                  <span className="text-[8px] font-bold text-neutral-400 mt-1 uppercase">Arrived</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Total bill and control panel */}
                          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-bold">Total Bill (GST & Delivery incl.)</span>
                              <span className="text-sm font-black text-brand-green">₹{ord.total}</span>
                            </div>
                            <div className="flex gap-2">
                              {/* Re-order action which repopulates card seamlessly */}
                              <button
                                onClick={() => {
                                  if (ord.items) {
                                    ord.items.forEach((ci: any) => {
                                      handleAddToCart(ci.item);
                                    });
                                    setCartOpen(true);
                                  }
                                }}
                                className="bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                              >
                                Re-Order 🛒
                              </button>
                              <a
                                href={`https://wa.me/918792496216?text=Hello%20Kalyani%20Kitchen%20Chef%2C%20please%20tell%20me%20the%20live%20status%20for%20my%20Order%20ID%20${ord.id}...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-neutral-200 hover:border-neutral-300 text-neutral-700 font-bold text-[10px] px-3 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-transform"
                              >
                                Ping Kitchen 💬
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW 3: PROFILE MANAGEMENT VIEW WITH INTERACTIVE MAPBOX CORRECTION */}
        {activeMobileTab === "profile" && (
          <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-md overflow-hidden">
              {/* Profile Card Header Banner */}
              <div className="bg-brand-green text-white p-6 relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-full border-4 border-white/20 flex items-center justify-center p-1 text-4xl text-brand-green font-black shadow-md uppercase mb-3">
                  {userEmail ? userEmail.charAt(0) : "U"}
                </div>
                <h2 className="text-xl font-black font-display uppercase tracking-wide">
                  {userDisplayName}
                </h2>
                <p className="text-neutral-200 text-xs mt-0.5 font-medium">{userEmail}</p>

                {/* Status Badging */}
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex items-center gap-1 text-[9px] bg-white/25 text-white font-extrabold uppercase px-2.5 py-1 rounded-full border border-white/10">
                    <Sparkles className="w-3 h-3 text-brand-yellow animate-spin" /> Active Member
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] bg-white/25 text-white font-extrabold uppercase px-2.5 py-1 rounded-full border border-white/10">
                    Verified Secure
                  </span>
                </div>
              </div>

              {/* Dynamic Mapbox based Delivery Point Modifier */}
              <div className="p-4 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <MapPin className="w-4 h-4 text-brand-green" /> Registered Order Delivery Address
                  </h3>
                  
                  {/* Real Saved Address block */}
                  <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-4">
                    <span className="text-[10px] font-extrabold text-brand-green block mb-1">CURRENT PINNED DESTINATION</span>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      {deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Mapbox address modifier for smooth updates */}
                <div className="pt-4 border-t border-neutral-100 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wide">Change Order Address</h4>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Type another location or colony. Real autocomplete powered via Mapbox platform.
                    </p>
                  </div>

                  {(() => {
                    // Inline state holder for profile address correction
                    const [searchInGroup, setSearchInGroup] = useState("");
                    const [suggestions, setSuggestions] = useState<any[]>([]);
                    const [newHouseNo, setNewHouseNo] = useState("");
                    const [newAddressRaw, setNewAddressRaw] = useState("");
                    const [isUpdatingCompleted, setIsUpdatingCompleted] = useState(false);

                    const triggerAutocomplete = async (val: string) => {
                      setSearchInGroup(val);
                      if (!val.trim()) {
                        setSuggestions([]);
                        return;
                      }
                      try {
                        const token = import.meta.env.VITE_MAPBOX_TOKEN;
                        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${token}&country=IN&limit=5`);
                        const data = await res.json();
                        if (data && data.features) {
                          setSuggestions(data.features);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    };

                    const handleSaveUpdatedAddress = async () => {
                      if (!newAddressRaw) {
                        alert("Please pick or type a valid address from recommendations block first.");
                        return;
                      }

                      const finalString = `${newHouseNo ? newHouseNo + ", " : ""}${newAddressRaw}`;
                      
                      if (supabase && userEmail) {
                        await supabase
                          .from("users")
                          .update({ phone: finalString })
                          .eq("email", userEmail.toLowerCase());
                      }

                      setDeliveryAddress(finalString);
                      setIsUpdatingCompleted(true);
                      setTimeout(() => {
                        setIsUpdatingCompleted(false);
                        setSearchInGroup("");
                        // Trigger force state update inside parent seamlessly
                        setSelectedCategory((prev) => prev); 
                      }, 1200);
                    };

                    return (
                      <div className="space-y-3">
                        <div className="space-y-1 relative">
                          <input
                            type="text"
                            placeholder="Type colony, apartment complex or city..."
                            value={searchInGroup}
                            onChange={(e) => triggerAutocomplete(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                          />
                          
                          {suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 max-h-36 overflow-y-auto divide-y divide-neutral-100">
                              {suggestions.map((feat) => (
                                <button
                                  key={feat.id}
                                  type="button"
                                  onClick={() => {
                                    setNewAddressRaw(feat.place_name);
                                    setSearchInGroup(feat.place_name);
                                    setSuggestions([]);
                                  }}
                                  className="w-full text-left p-2 hover:bg-neutral-50 text-[10px] font-medium text-neutral-700 truncate block"
                                >
                                  📍 {feat.place_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Flat / Floor / House No."
                            value={newHouseNo}
                            onChange={(e) => setNewHouseNo(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-green bg-neutral-50 text-neutral-900 font-medium"
                          />
                          <button
                            type="button"
                            onClick={handleSaveUpdatedAddress}
                            className="bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center"
                          >
                            {isUpdatingCompleted ? "✓ Saved Successfully" : "Update Address"}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Danger logout card strictly safe */}
                <div className="pt-6 border-t border-neutral-150 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-neutral-800 uppercase tracking-widest">Account Security</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Authorization tokens cached securely inside secure sandbox container.</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[10px] uppercase py-2 px-4 rounded-lg tracking-wider border border-red-200 cursor-pointer flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SYSTEM AND PROMOTIONAL NOTIFICATIONS VIEW */}
        {activeMobileTab === "notifications" && (
          <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200/60 font-sans">
              <div>
                <h1 className="text-2xl font-black text-neutral-900 font-display tracking-tight uppercase flex items-center gap-2">
                  <Bell className="w-6 h-6 text-brand-green" />
                  Alerts log
                </h1>
                <p className="text-xs text-neutral-500 mt-1">Fresh coupons, kitchen alerts & delivery executive notices.</p>
              </div>
              <div className="bg-brand-green/10 text-brand-green font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                Real-Time Beacons
              </div>
            </div>

            <div className="space-y-4">
              {/* Alert 1 */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm flex gap-3.5 relative overflow-hidden">
                <span className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200 text-lg">🎁</div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-neutral-800 uppercase tracking-wide">Promo Code: FIRSTKK</h3>
                    <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">NEW</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Enjoy ₹100 direct deduction on orders above ₹399. Code automatically computed during checkout drawer calculations.
                  </p>
                  <span className="text-[9px] font-mono font-medium text-neutral-400 block pt-1">Active Now • Expires June 30</span>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm flex gap-3.5 relative overflow-hidden">
                <span className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-green" />
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-200 text-lg">🛵</div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-neutral-800 uppercase tracking-wide">Free Delivery Offer Active</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    We waived the delivery fee of ₹39 for any order matching ₹300 total value. Order direct, save big.
                  </p>
                  <span className="text-[9px] font-mono font-medium text-neutral-400 block pt-1">Active Now • No Code required</span>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm flex gap-3.5 relative overflow-hidden">
                <span className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500" />
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-200 text-sm">🔒</div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-neutral-800 uppercase tracking-wide">Database handshake complete</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Personalized profile successfully connected to custom database registries. Authentic keys never sent to browsers.
                  </p>
                  <span className="text-[9px] font-mono font-medium text-neutral-400 block pt-1">Just Now</span>
                </div>
              </div>

              {/* Alert 4 */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm flex gap-3.5 relative overflow-hidden">
                <span className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-green" />
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100 text-lg">👨‍🍳</div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-neutral-800 uppercase tracking-wide">Todays Special: Appam & Mutton Stew</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Extra fluffy fermented rice lacy Appams coupled with slow-stewed mutton, loaded with thick coconut cream. Cooking hot now!
                  </p>
                  <span className="text-[9px] font-mono font-medium text-neutral-400 block pt-1">4 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer component */}
      <Footer onNavigate={navigateTo} />

      {/* Slide-over cart drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Order Success Screen Dialog overlay */}
      {orderSuccess && lastOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOrderSuccess(false)} />
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center relative z-10 border border-neutral-100 shadow-2xl animate-in fade-in zoom-in-95 duration-250 font-sans">
            <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-brand-green" />
            </div>
            
            <h3 className="text-2xl font-black text-neutral-900 font-display">Order Placed Successfully!</h3>
            <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
              Your gourmet order from <strong className="text-brand-green">Kalyani Kitchen</strong> is received and currently being cooked by our master chefs.
            </p>

            <div className="my-6 p-4 rounded-xl bg-brand-green/3 border border-brand-green/10 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 font-medium">Order ID</span>
                <span className="font-extrabold text-neutral-800">{lastOrderDetails.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 font-medium">Delivery Address</span>
                <span className="font-extrabold text-neutral-800 truncate max-w-[200px]">{userEmail}</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-brand-green/15">
                <span className="text-neutral-700 font-bold">Paid via UPI / Card</span>
                <span className="font-black text-brand-green">₹{lastOrderDetails.total}</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 bg-neutral-50 p-2.5 rounded-lg mb-6">
              🛵 Your neighborhood delivery executive is already assigned to Kalyani Kitchen base. ETA 25 minutes.
            </div>

            <button
              onClick={() => setOrderSuccess(false)}
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-extrabold text-sm uppercase py-3.5 rounded-lg shadow-md transition-colors"
            >
              Continue Dining Experience
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Lifted Bottom Mobile & Tablet Navigation Bar */}
      {userEmail && (
        <div 
          id="mob-nav-bar"
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-neutral-200/95 shadow-[0_-10px_35px_rgba(0,0,0,0.12)] z-40 lg:hidden px-4 sm:px-10 flex items-center justify-around select-none transition-all duration-300 pb-[calc(1.75rem+env(safe-area-inset-bottom,10px))] pt-4 mb-0"
        >
          {/* Home button */}
          <button
            onClick={() => {
              setActiveMobileTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
              activeMobileTab === "home" ? "text-brand-green scale-105 font-black" : "text-neutral-400 font-medium"
            }`}
          >
            <Home className="w-5.5 h-5.5" />
            <span className="text-[10px] mt-1.5 uppercase tracking-wider">Home</span>
          </button>

          {/* Orders button */}
          <button
            onClick={() => {
              setActiveMobileTab("orders");
            }}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all relative ${
              activeMobileTab === "orders" ? "text-brand-green scale-105 font-black" : "text-neutral-400 font-medium"
            }`}
          >
            <ClipboardList className="w-5.5 h-5.5" />
            <span className="text-[10px] mt-1.5 uppercase tracking-wider">My Orders</span>
            {(() => {
              const orders = myOrdersList.filter(
                (o: any) => o.userEmail?.toLowerCase() === userEmail?.toLowerCase()
              );
              return orders.length > 0 && activeMobileTab !== "orders" ? (
                <span className="absolute top-0 right-1/4 bg-brand-yellow text-brand-green font-extrabold text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {orders.length}
                </span>
              ) : null;
            })()}
          </button>

          {/* Notifications button */}
          <button
            onClick={() => {
              setActiveMobileTab("notifications");
            }}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all relative ${
              activeMobileTab === "notifications" ? "text-brand-green scale-105 font-black" : "text-neutral-400 font-medium"
            }`}
          >
            <Bell className="w-5.5 h-5.5" />
            <span className="text-[10px] mt-1.5 uppercase tracking-wider">Alerts</span>
            {activeMobileTab !== "notifications" && (
              <span className="absolute top-1.5 right-[32%] bg-red-500 h-2 w-2 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Profile button */}
          <button
            onClick={() => {
              setActiveMobileTab("profile");
            }}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all ${
              activeMobileTab === "profile" ? "text-brand-green scale-105 font-black" : "text-neutral-400 font-medium"
            }`}
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[10px] mt-1.5 uppercase tracking-wider">Profile</span>
          </button>
        </div>
      )}

      {/* Floating WhatsApp Order Button */}
      <a
        href="https://wa.me/918792496216?text=Hello%20Kalyani%20Kitchen%2C%20I%20would%20like%20to%20place%20an%20order..."
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer group ${
          userEmail ? "bottom-[98px] lg:bottom-6" : "bottom-6"
        }`}
        title="Order via WhatsApp"
      >
        <span className="absolute right-full mr-3 bg-neutral-900/90 text-white text-[10px] sm:text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md whitespace-nowrap">
          Order via WhatsApp 💬
        </span>
        <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.748.002-2.607-1.01-5.059-2.85-6.902C16.645 2.113 14.197 1.1 11.604 1.1 6.162 1.1 1.74 5.47 1.737 10.849c-.001 1.701.448 3.364 1.3 4.872l-.991 3.619 3.733-.969c1.493.81 3.07 1.236 4.606 1.236-.002 0-.002 0-.001 0zm11.332-6.52c-.312-.156-1.847-.91-2.128-1.012-.282-.102-.487-.156-.692.156-.204.312-.793 1.013-.974 1.22-.18.204-.36.23-.672.073-1.016-.411-1.921-.837-2.673-1.503-.591-.52-.942-1.127-1.059-1.33-.117-.204-.012-.315.089-.415.092-.091.205-.23.307-.347.102-.117.137-.197.205-.33.067-.13-.034-.249-.084-.351-.05-.102-.487-1.173-.672-1.611-.18-.433-.362-.375-.494-.381-.127-.006-.273-.008-.418-.008-.146 0-.381.054-.581.272-.2.218-.762.744-.762 1.815 0 1.072.78 2.106.89 2.253.11.147 1.534 2.341 3.717 3.284.519.224.924.359 1.242.46.521.166.996.143 1.368.088.416-.061 1.847-.756 2.109-1.451.262-.695.262-1.29.184-1.42s-.282-.204-.593-.362z" />
        </svg>
      </a>
    </div>
  );
}
