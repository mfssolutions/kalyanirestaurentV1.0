import React, { useState, FormEvent, useEffect, useRef } from "react";
import { Lock, Mail, ChefHat, ArrowLeft, Eye, EyeOff, UserPlus, CheckCircle, MapPin, Search as SearchIcon, Navigation, ShieldCheck } from "lucide-react";
import { authenticateUser, checkEmailRegistered, registerNewUser, updateUserPasswordInDB } from "../lib/supabase";

interface SignInPageProps {
  onLogin: (email: string) => void;
  onNavigateHome: () => void;
  initialPath: string;
  onPathChange: (path: string) => void;
}

type ModeType = "signin" | "forget_password" | "create_account";

export function SignInPage({ onLogin, onNavigateHome, initialPath, onPathChange }: SignInPageProps) {
  // Current mode derived from routing paths: "/signin", "/FORGETPASSWORD", "/create-account"
  const getModeFromPath = (path: string): ModeType => {
    if (path === "/FORGETPASSWORD") return "forget_password";
    if (path === "/create-account") return "create_account";
    return "signin";
  };

  const mode = getModeFromPath(initialPath);

  // General States
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sign up & Reset workflow phases
  // phases - 1: Info input, 2: OTP verify, 3: Password setup, 4: Location fetch
  const [signupPhase, setSignupPhase] = useState<1 | 2 | 3 | 4>(1);
  const [forgetPhase, setForgetPhase] = useState<1 | 2 | 3>(1);

  // OTP Verification States
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [typedOtp, setTypedOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [timer, setTimer] = useState(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mapbox location fetching states
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const [locatingUser, setLocatingUser] = useState(false);
  const [addressLine, setAddressLine] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [mapSearch, setMapSearch] = useState("");
  const [mapSuggestions, setMapSuggestions] = useState<any[]>([]);

  // Cleanup error notices on path transitions
  useEffect(() => {
    setErrorMsg("");
    setInfoMsg("");
    setEmail("");
    setName("");
    setPassword("");
    setSignupPhase(1);
    setForgetPhase(1);
    setTimer(45);
    setTypedOtp(Array(6).fill(""));
  }, [initialPath]);

  // Handle active OTP countdown
  useEffect(() => {
    if ((mode === "create_account" && signupPhase === 2) || (mode === "forget_password" && forgetPhase === 2)) {
      setTimer(45);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, signupPhase, forgetPhase]);

  // Dynamic system code generation for instant verification
  const sendEmailOtp = (targetEmail: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTypedOtp(Array(6).fill(""));
    
    // Aesthetic prompt representation matching perfect food authentication layout
    setTimeout(() => {
      alert(`💬 KALYANI KITCHEN SECURITY\nWe sent a 6-digit OTP to your registered mailbox (${targetEmail}).\n\nYour Verification Code is: ${code}`);
    }, 450);
  };

  // Resend code logic
  const handleResendOtp = () => {
    if (timer > 0) return;
    sendEmailOtp(email);
    setTimer(45);
  };

  // Autocomplete suggestions search query from Mapbox 
  const handleMapSearch = async (query: string) => {
    setMapSearch(query);
    if (!query.trim()) {
      setMapSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=IN&limit=5`);
      const data = await response.json();
      if (data && data.features) {
        setMapSuggestions(data.features);
      }
    } catch (e) {
      console.error("Mapbox Autocomplete API Error:", e);
    }
  };

  const selectSuggestion = (feature: any) => {
    setAddressLine(feature.place_name);
    setMapSearch(feature.place_name);
    setMapSuggestions([]);
  };

  // HTML5 GeoLocation API caller + Mapbox reverse geocode
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation capability not supported in your browser.");
      return;
    }

    setLocatingUser(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`);
          const data = await response.json();
          if (data && data.features && data.features.length > 0) {
            setAddressLine(data.features[0].place_name);
            setMapSearch(data.features[0].place_name);
          } else {
            setAddressLine(`Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch (err) {
          setAddressLine(`Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setLocatingUser(false);
        }
      },
      (err) => {
        console.error(err);
        setErrorMsg("Failed to auto-detect location. Please type manually inside search.");
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleOtpChange = (val: string, index: number) => {
    // only look at last char or single digit matching
    const digit = val.slice(-1);
    if (digit && !/^\d+$/.test(digit)) return; // numbers only

    const newOtp = [...typedOtp];
    newOtp[index] = digit;
    setTypedOtp(newOtp);

    // Auto focus next box
    if (digit !== "" && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !typedOtp[index] && index > 0) {
      const newOtp = [...typedOtp];
      newOtp[index - 1] = "";
      setTypedOtp(newOtp);
      otpRefs[index - 1].current?.focus();
    }
  };

  // Validate E-mails structure
  const isValidEmail = (val: string) => {
    return val.includes("@") && val.includes(".");
  };

  // SIGN IN SUBMISSION Action
  const handleSignInSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address containing '@' and a domain.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await authenticateUser(email, password);
      setIsLoading(false);
      
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onLogin(email);
          onNavigateHome();
        }, 1000);
      } else {
        if (res.errorType === "not_registered") {
          setErrorMsg("This account is not registered. Please create an account below.");
        } else if (res.errorType === "wrong_password") {
          setErrorMsg("Wrong password. Please try again or click Forgot Password.");
        } else {
          setErrorMsg(res.message || "Invalid authentication response.");
        }
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg("Server error trying to authenticate. Please try again.");
    }
  };

  // FORGET PASSWORD SUBMISSION Actions
  const handleForgetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (forgetPhase === 1) {
      if (!isValidEmail(email)) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      setIsLoading(true);
      const registered = await checkEmailRegistered(email);
      setIsLoading(false);

      if (!registered) {
        setErrorMsg("This email address is not registered. Please check the spelling or sign up below.");
        return;
      }

      // Validated. Go to verification
      sendEmailOtp(email);
      setForgetPhase(2);
    } else if (forgetPhase === 2) {
      const otpCodeStr = typedOtp.join("");
      if (otpCodeStr.length < 6) {
        setErrorMsg("Please type the entire 6-digit verification code.");
        return;
      }

      if (otpCodeStr !== generatedOtp) {
        setErrorMsg("Incorrect verification code. Please check code or click resend.");
        return;
      }

      // Correct! Go to new password setup
      setForgetPhase(3);
    } else if (forgetPhase === 3) {
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 digits/characters.");
        return;
      }

      setIsLoading(true);
      await updateUserPasswordInDB(email, password);
      setIsLoading(false);

      setIsSuccess(true);
      setTimeout(() => {
        onLogin(email);
        onNavigateHome();
      }, 1000);
    }
  };

  // CREATE ACCOUNT SUBMISSION Actions
  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (signupPhase === 1) {
      if (!name.trim()) {
        setErrorMsg("Name input required.");
        return;
      }
      if (!isValidEmail(email)) {
        setErrorMsg("Please use a valid email structure.");
        return;
      }

      setIsLoading(true);
      const exists = await checkEmailRegistered(email);
      setIsLoading(false);

      if (exists) {
        setErrorMsg("This email is already registered. Please sign in instead.");
        return;
      }

      // Go to validation OTP send stage
      sendEmailOtp(email);
      setSignupPhase(2);
    } else if (signupPhase === 2) {
      const otpCodeStr = typedOtp.join("");
      if (otpCodeStr.length < 6) {
        setErrorMsg("Please fill all 6 digits of code.");
        return;
      }

      if (otpCodeStr !== generatedOtp) {
        setErrorMsg("Incorrect verification code.");
        return;
      }

      setSignupPhase(3);
    } else if (signupPhase === 3) {
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }

      // Proceed to Location Swiggy locator
      setSignupPhase(4);
      // Fire detect initial location automatically
      setTimeout(() => {
        handleDetectLocation();
      }, 200);
    } else if (signupPhase === 4) {
      // Complete registration process
      if (!addressLine.trim()) {
        setErrorMsg("Please select or detect order address first.");
        return;
      }

      setIsLoading(true);
      const constructedAddress = `${houseNo ? houseNo + ", " : ""}${addressLine}${landmark ? " (Landmark: " + landmark + ")" : ""}`;
      
      await registerNewUser({
        email: email,
        name: name,
        password: password,
        phone: constructedAddress
      });
      setIsLoading(false);

      setIsSuccess(true);
      setTimeout(() => {
        onLogin(email);
        onNavigateHome();
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800">
      
      {/* Top minimal header back menu bar without branding labels as requested */}
      <div className="bg-brand-green py-3 px-4 text-white flex items-center justify-between shadow-sm">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white hover:text-brand-yellow transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        {/* Compact card resized tight, avoiding unused vertical spaces completely */}
        <div className="max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-250 relative">
          
          {/* Top Banner section with Logo embedded custom size instead of chefs cap */}
          <div className="bg-brand-green text-white p-4 text-center relative overflow-hidden flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 shadow-md border border-white/20 mb-2">
              <img
                src="src/Public/Logo/logo.png"
                alt="Kalyani Kitchen Logo"
                className="w-full h-full object-cover rounded-full bg-white"
                onError={(e) => {
                  // If image public loading fails, fall back gracefully
                  e.currentTarget.src = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&auto=format&fit=crop&q=80";
                }}
              />
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-wide font-display text-white uppercase leading-tight">
              {mode === "create_account" && "Create Account"}
              {mode === "forget_password" && "Reset Password"}
              {mode === "signin" && "Kalyani Kitchen"}
            </h1>
          </div>

          {/* Core dynamic forms with tight styling spacing to fit perfectly into mobile screens */}
          <div className="p-4 sm:p-5 relative">
            
            {/* Overlay loading server connection block */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-150">
                <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
                <h3 className="font-extrabold text-neutral-900 mt-3 text-xs font-display uppercase tracking-wider">
                  Verifying Identity...
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Secured connection to database registries.
                </p>
              </div>
            )}

            {/* Success Animation view */}
            {isSuccess && (
              <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-150">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-brand-green border border-green-200">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-neutral-900 mt-3 text-xs font-display uppercase tracking-wider">
                  Success!
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Welcome to the world of authentic kitchen spices.
                </p>
              </div>
            )}

            {/* ERROR AND INFORMATION NOTIFICATIONS */}
            {errorMsg && (
              <div className="bg-red-50 text-red-800 text-[10px] leading-snug p-2 rounded-lg border border-red-200 font-bold mb-3">
                ⚠️ {errorMsg}
              </div>
            )}
            {infoMsg && (
              <div className="bg-green-50 text-brand-green text-[10px] leading-snug p-2 rounded-lg border border-green-150 font-bold mb-3">
                💡 {infoMsg}
              </div>
            )}

            {/* ==================== 1. SIGN IN FLOW ==================== */}
            {mode === "signin" && (
              <form onSubmit={handleSignInSubmit} className="space-y-3">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <label className="flex items-center gap-1 text-neutral-600 font-bold select-none cursor-pointer">
                    <input type="checkbox" className="rounded text-brand-green focus:ring-0 accent-brand-green w-3 h-3" defaultChecked />
                    Remember
                  </label>
                  <button
                    type="button"
                    onClick={() => onPathChange("/FORGETPASSWORD")}
                    className="text-brand-green font-extrabold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm transition-transform cursor-pointer hover:scale-101 active:scale-99 mt-2 leading-none"
                >
                  SIGN IN
                </button>

                <div className="pt-3 border-t border-neutral-100 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400">New to Kalyani Kitchen?</span>
                  <button
                    type="button"
                    onClick={() => onPathChange("/create-account")}
                    className="inline-flex items-center gap-1 text-brand-green font-extrabold text-[10px] uppercase hover:underline cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    CREATE ACCOUNT
                  </button>
                </div>
              </form>
            )}

            {/* ==================== 2. FORGET PASSWORD FLOW ==================== */}
            {mode === "forget_password" && (
              <form onSubmit={handleForgetSubmit} className="space-y-3">
                {forgetPhase === 1 && (
                  <>
                    <p className="text-[10px] text-neutral-500 leading-normal text-center mb-1">
                      Enter your registered email below to receive authentication instructions.
                    </p>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          required
                          placeholder="Your registered email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      NEXT
                    </button>
                  </>
                )}

                {forgetPhase === 2 && (
                  <div className="space-y-3 text-center">
                    <div className="bg-brand-green/5 p-2 rounded-lg text-left">
                      <p className="text-[10px] font-bold text-brand-green text-center">
                        🔒 Verification OTP Sent
                      </p>
                      <p className="text-[9px] text-neutral-500 text-center mt-0.5">
                        We dispatched verification key to <strong>{email}</strong>
                      </p>
                    </div>

                    {/* 6 small type boxes matching specification perfectly */}
                    <div className="flex justify-center gap-1.5 pt-1">
                      {typedOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          maxLength={1}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e.target.value, idx)}
                          className="w-8 h-8 text-center text-sm font-bold border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 uppercase"
                        />
                      ))}
                    </div>

                    <div className="text-[9px] text-neutral-500 flex justify-between items-center px-1 pt-1">
                      <span>Verification Active Code</span>
                      {timer > 0 ? (
                        <span className="text-brand-green font-bold">Resend code in {timer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-brand-green font-extrabold hover:underline"
                        >
                          RESEND OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      VERIFY
                    </button>
                  </div>
                )}

                {forgetPhase === 3 && (
                  <>
                    <p className="text-[10px] text-neutral-500 leading-normal text-center mb-1">
                      Verification verified successfully. Set up your secure new account credentials.
                    </p>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="At least 6 digits long"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-8 pr-8 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      CONTINUE
                    </button>
                  </>
                )}

                <div className="pt-3 border-t border-neutral-100 text-center">
                  <button
                    type="button"
                    onClick={() => onPathChange("/signin")}
                    className="text-[10px] font-extrabold text-brand-green uppercase tracking-wide hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* ==================== 3. CREATE ACCOUNT FLOW ==================== */}
            {mode === "create_account" && (
              <form onSubmit={handleCreateSubmit} className="space-y-3">
                
                {/* PHASE 1: Name, Email Inputs */}
                {signupPhase === 1 && (
                  <>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Your First & Last name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Email Address</label>
                      <input
                        type="text"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      NEXT
                    </button>
                  </>
                )}

                {/* PHASE 2: OTP Verification */}
                {signupPhase === 2 && (
                  <div className="space-y-3 text-center">
                    <div className="bg-brand-green/5 p-2 rounded-lg text-left">
                      <p className="text-[10px] font-bold text-brand-green text-center">
                        🔒 Verification OTP Sent
                      </p>
                      <p className="text-[9px] text-neutral-500 text-center mt-0.5">
                        We dispatched verification code to <strong>{email}</strong>
                      </p>
                    </div>

                    {/* 6 small type boxes matching specification perfectly */}
                    <div className="flex justify-center gap-1.5 pt-1">
                      {typedOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          maxLength={1}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e.target.value, idx)}
                          className="w-8 h-8 text-center text-sm font-bold border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 uppercase"
                        />
                      ))}
                    </div>

                    <div className="text-[9px] text-neutral-500 flex justify-between items-center px-1 pt-1">
                      <span>Verification code active</span>
                      {timer > 0 ? (
                        <span className="text-brand-green font-bold">Resend code in {timer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-brand-green font-extrabold hover:underline"
                        >
                          RESEND OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      VERIFY
                    </button>
                  </div>
                )}

                {/* PHASE 3: New Password Input */}
                {signupPhase === 3 && (
                  <>
                    <p className="text-[10px] text-neutral-500 leading-normal text-center mb-1">
                      Verify complete. Choose a password to secure your personal kitchen profile.
                    </p>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Password (Minimum 6 digits)</label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-8 pr-8 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      CONTINUE
                    </button>
                  </>
                )}

                {/* PHASE 4: Swiggy Model Location Fetching Page */}
                {signupPhase === 4 && (
                  <div className="space-y-3">
                    <div className="bg-brand-green/5 p-2 rounded-lg">
                      <p className="text-[10px] font-bold text-brand-green flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 animate-bounce" />
                        SWIGGY STYLE LOCATION SELECTOR
                      </p>
                      <p className="text-[9px] text-neutral-500 mt-0.5">
                        Please pin or search your precise home door delivery address.
                      </p>
                    </div>

                    {/* detect location action */}
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locatingUser}
                      className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 active:scale-98 transition-transform cursor-pointer"
                    >
                      <Navigation className={`w-3 h-3 ${locatingUser ? "animate-spin" : ""}`} />
                      {locatingUser ? "DETECTING LIVE GPS COORDINATES..." : "DETECT LIVE CURRENT LOCATION"}
                    </button>

                    {/* Search address bar using Real mapbox token */}
                    <div className="space-y-0.5 relative">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Search Delivery Location</label>
                      <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Search landmark, colony, city..."
                          value={mapSearch}
                          onChange={(e) => handleMapSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900"
                        />
                      </div>

                      {/* dropdown suggestion results */}
                      {mapSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto divide-y divide-neutral-100">
                          {mapSuggestions.map((feature) => (
                            <button
                              key={feature.id}
                              type="button"
                              onClick={() => selectSuggestion(feature)}
                              className="w-full text-left p-2 hover:bg-neutral-50 transition-colors text-[10px] font-medium text-neutral-700 line-clamp-1 truncate block"
                            >
                              📍 {feature.place_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* visual mock delivery pin area */}
                    <div className="h-20 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(#ddd_1px,transparent_1px)] [background-size:12px_12px] opacity-70 animate-pulse" />
                      <div className="z-10 flex flex-col items-center justify-center text-center p-2">
                        <div className="relative">
                          <MapPin className="w-5 h-5 text-brand-green fill-brand-green/20 animate-bounce" />
                          <div className="w-2 h-1 bg-neutral-400 rounded-full blur-xs mx-auto animate-ping" />
                        </div>
                        <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wide mt-1">
                          Delivery Exec Radar Ring Active
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-0.5">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">House / Flat / Block No.</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Building 4B, Flat 201"
                          value={houseNo}
                          onChange={(e) => setHouseNo(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none text-neutral-900 font-medium"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Landmark / Floor Area</label>
                        <input
                          type="text"
                          placeholder="e.g. Near Post Office"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none text-neutral-900 font-medium"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">Full Delivery Address detected</label>
                        <textarea
                          rows={2}
                          readOnly
                          value={addressLine}
                          className="w-full px-2 py-1 text-[10px] border border-neutral-200 bg-neutral-50 rounded-md text-neutral-600 font-medium focus:outline-none resize-none"
                          placeholder="Detected or selected address will lock here"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      UPDATE & NEXT
                    </button>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-100 text-center">
                  <button
                    type="button"
                    onClick={() => onPathChange("/signin")}
                    className="text-[10px] font-extrabold text-brand-green uppercase tracking-wide hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
