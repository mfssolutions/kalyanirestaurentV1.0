import React, { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Search as SearchIcon,
  UserPlus,
} from "lucide-react";
import kitchenLogo from "../Public/Logo/logo.png";
import { OtpVerificationForm } from "./OtpVerificationForm";
import {
  authenticateUser,
  checkEmailRegistered,
  completePasswordReset,
  initiateSignup,
  OTP_RESEND_COOLDOWN_SECONDS,
  resendPasswordResetOtp,
  resendSignupOtp,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  verifySignupOtp,
} from "../lib/supabase";

interface SignInPageProps {
  onLogin: (email: string) => void;
  onNavigateHome: () => void;
  initialPath: string;
  onPathChange: (path: string) => void;
}

type ModeType = "signin" | "forget_password" | "create_account";
type SignupStep = "details" | "security" | "address" | "otp";
type ResetStep = "email" | "otp" | "new_password";
type OtpSendStatus = "idle" | "sending" | "sent" | "failed";

interface MapboxFeature {
  id: string;
  place_name: string;
}

const SIGNUP_STEPS: Array<{ id: SignupStep; label: string }> = [
  { id: "details", label: "Details" },
  { id: "security", label: "Password" },
  { id: "address", label: "Address" },
  { id: "otp", label: "Verify" },
];

function SignupProgress({ currentStep }: { currentStep: SignupStep }) {
  const currentIndex = SIGNUP_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-1">
        {SIGNUP_STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border ${
                  isComplete
                    ? "bg-brand-green text-white border-brand-green"
                    : isActive
                      ? "bg-brand-yellow text-brand-green border-brand-yellow"
                      : "bg-neutral-100 text-neutral-400 border-neutral-200"
                }`}
              >
                {isComplete ? "✓" : index + 1}
              </div>
              <span
                className={`text-[8px] font-bold uppercase tracking-wide ${
                  isActive ? "text-brand-green" : isComplete ? "text-neutral-600" : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SignInPage({ onLogin, onNavigateHome, initialPath, onPathChange }: SignInPageProps) {
  const getModeFromPath = (path: string): ModeType => {
    if (path === "/FORGETPASSWORD") return "forget_password";
    if (path === "/create-account") return "create_account";
    return "signin";
  };

  const mode = getModeFromPath(initialPath);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [signupStep, setSignupStep] = useState<SignupStep>("details");
  const [resetStep, setResetStep] = useState<ResetStep>("email");
  const [locatingUser, setLocatingUser] = useState(false);
  const [addressLine, setAddressLine] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [mapSearch, setMapSearch] = useState("");
  const [mapSuggestions, setMapSuggestions] = useState<MapboxFeature[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingAddress, setPendingAddress] = useState("");
  const [otpSendStatus, setOtpSendStatus] = useState<OtpSendStatus>("idle");
  const [shouldSendSignupOtp, setShouldSendSignupOtp] = useState(false);

  useEffect(() => {
    setEmail("");
    setName("");
    setPassword("");
    setNewPassword("");
    setShowPassword(false);
    setShowNewPassword(false);
    setErrorMsg("");
    setInfoMsg("");
    setIsLoading(false);
    setIsSuccess(false);
    setSuccessMessage("");
    setSignupStep("details");
    setResetStep("email");
    setLocatingUser(false);
    setAddressLine("");
    setHouseNo("");
    setLandmark("");
    setMapSearch("");
    setMapSuggestions([]);
    setResendCooldown(0);
    setPendingAddress("");
    setOtpSendStatus("idle");
    setShouldSendSignupOtp(false);
  }, [initialPath]);

  useEffect(() => {
    if (!shouldSendSignupOtp || signupStep !== "otp") {
      return;
    }

    let cancelled = false;

    const sendSignupOtp = async () => {
      setOtpSendStatus("sending");
      setErrorMsg("");
      setInfoMsg("");

      const result = await initiateSignup({
        email,
        name,
        password,
        phone: pendingAddress,
      });

      if (cancelled) return;

      setShouldSendSignupOtp(false);

      if (!result.success) {
        setOtpSendStatus("failed");
        setErrorMsg(result.message || "Failed to send verification code.");
        return;
      }

      setOtpSendStatus("sent");
      setInfoMsg(result.message || "Verification code sent. Check your email.");
      startResendCooldown();
    };

    void sendSignupOtp();

    return () => {
      cancelled = true;
    };
  }, [shouldSendSignupOtp, signupStep, email, name, password, pendingAddress]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const startResendCooldown = (seconds = OTP_RESEND_COOLDOWN_SECONDS) => {
    setResendCooldown(seconds);
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleMapSearch = async (query: string) => {
    setMapSearch(query);
    setErrorMsg("");

    if (!query.trim()) {
      setMapSuggestions([]);
      return;
    }

    if (!mapboxToken) {
      setErrorMsg("Address search is unavailable until VITE_MAPBOX_TOKEN is configured.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=IN&limit=5`
      );
      const data = await response.json();
      setMapSuggestions(Array.isArray(data?.features) ? data.features : []);
    } catch (error) {
      console.error("Mapbox autocomplete failed:", error);
      setErrorMsg("Address lookup failed. Please type the address manually.");
      setMapSuggestions([]);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported in this browser.");
      return;
    }

    setLocatingUser(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          if (!mapboxToken) {
            setAddressLine(`Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            return;
          }

          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`
          );
          const data = await response.json();
          const firstMatch = data?.features?.[0]?.place_name;
          const detectedAddress =
            firstMatch || `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setAddressLine(detectedAddress);
          setMapSearch(detectedAddress);
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setAddressLine(`Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setLocatingUser(false);
        }
      },
      (error) => {
        console.error(error);
        setErrorMsg("We could not detect your location. Please type the address manually.");
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSignInSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const result = await authenticateUser(email, password);
    setIsLoading(false);

    if (!result.success) {
      if (result.errorType === "not_registered") {
        setErrorMsg("This account is not registered. Please create an account below.");
      } else if (result.errorType === "wrong_password") {
        setErrorMsg("Wrong password. Please try again or use Forgot Password.");
      } else if (result.errorType === "email_not_verified") {
        setErrorMsg(
          result.message ||
            "Please verify your email with the 6-digit code sent during signup."
        );
      } else {
        setErrorMsg(result.message || "Unable to sign you in right now.");
      }
      return;
    }

    setIsSuccess(true);
    setSuccessMessage("Signed in successfully.");
    setTimeout(() => {
      onLogin(email);
      onNavigateHome();
    }, 900);
  };

  const handleForgotPasswordEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    const result = await sendPasswordResetOtp(email);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || "Unable to send verification code.");
      return;
    }

    setInfoMsg(result.message || "Verification code sent.");
    startResendCooldown();
    setResetStep("otp");
  };

  const handleForgotPasswordOtpVerify = async (otp: string) => {
    setErrorMsg("");
    setInfoMsg("");
    setIsLoading(true);
    const result = await verifyPasswordResetOtp(email, otp);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || "Invalid verification code.");
      return;
    }

    setInfoMsg(result.message || "Verification successful.");
    setResetStep("new_password");
  };

  const handleForgotPasswordResend = async () => {
    setErrorMsg("");
    setInfoMsg("");
    setIsLoading(true);
    const result = await resendPasswordResetOtp(email);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || "Unable to resend verification code.");
      return;
    }

    setInfoMsg(result.message || "A new verification code has been sent.");
    startResendCooldown();
  };

  const handleForgotPasswordNewPasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const result = await completePasswordReset(newPassword);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || "Unable to update password.");
      return;
    }

    setIsSuccess(true);
    setSuccessMessage(result.message || "Password updated successfully.");
    setTimeout(() => {
      onPathChange("/signin");
    }, 1200);
  };

  const handleCreateAccountSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (signupStep === "details") {
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

      setSignupStep("security");
      return;
    }

    if (signupStep === "security") {
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }

      setSignupStep("address");
      setTimeout(() => {
        handleDetectLocation();
      }, 150);
      return;
    }

    if (signupStep === "address") {
      if (!addressLine.trim()) {
        setErrorMsg("Please select or detect your address first.");
        return;
      }

      const finalAddress = `${houseNo ? `${houseNo}, ` : ""}${addressLine}${landmark ? ` (Landmark: ${landmark})` : ""}`;
      setPendingAddress(finalAddress);
      setSignupStep("otp");
      setShouldSendSignupOtp(true);
    }
  };

  const handleSignupOtpVerify = async (otp: string) => {
    setErrorMsg("");
    setInfoMsg("");
    setIsLoading(true);
    const result = await verifySignupOtp(email, otp, {
      name,
      phone: pendingAddress,
    });
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || "Invalid verification code.");
      return;
    }

    setIsSuccess(true);
    setSuccessMessage("Account created and verified successfully.");
    setTimeout(() => {
      onLogin(email);
      onNavigateHome();
    }, 1200);
  };

  const handleSignupOtpResend = async () => {
    setErrorMsg("");
    setInfoMsg("");
    setOtpSendStatus("sending");
    const result = await resendSignupOtp(email);

    if (!result.success) {
      setOtpSendStatus("failed");
      setErrorMsg(result.message || "Unable to resend verification code.");
      return;
    }

    setOtpSendStatus("sent");
    setInfoMsg(result.message || "A new verification code has been sent.");
    startResendCooldown();
  };

  const handleRetrySignupOtpSend = () => {
    setShouldSendSignupOtp(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800">
      <div className="bg-brand-green py-3 px-4 text-white flex items-center justify-between shadow-sm">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white hover:text-brand-yellow transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden border border-neutral-100 animate-in fade-in zoom-in-95 duration-250 relative">
          <div className="bg-brand-green text-white p-4 text-center relative overflow-hidden flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 shadow-md border border-white/20 mb-2">
              <img
                src={kitchenLogo}
                alt="Kalyani Kitchen Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-wide font-display text-white uppercase leading-tight">
              {mode === "create_account" && signupStep === "otp" && "Verify Email"}
              {mode === "create_account" && signupStep !== "otp" && "Create Account"}
              {mode === "forget_password" && resetStep === "otp" && "Verify Email"}
              {mode === "forget_password" && resetStep !== "otp" && "Reset Password"}
              {mode === "signin" && "Kalyani Kitchen"}
            </h1>
          </div>

          <div className="p-4 sm:p-5 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-150">
                <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
                <h3 className="font-extrabold text-neutral-900 mt-3 text-xs font-display uppercase tracking-wider">
                  Processing...
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">Secured connection to authentication service.</p>
              </div>
            )}

            {isSuccess && (
              <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-150">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-brand-green border border-green-200">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-neutral-900 mt-3 text-xs font-display uppercase tracking-wider">
                  Success!
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">{successMessage}</p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 text-red-800 text-[10px] leading-snug p-2 rounded-lg border border-red-200 font-bold mb-3">
                {errorMsg}
              </div>
            )}
            {infoMsg && (
              <div className="bg-green-50 text-brand-green text-[10px] leading-snug p-2 rounded-lg border border-green-150 font-bold mb-3">
                {infoMsg}
              </div>
            )}

            {mode === "signin" && (
              <form onSubmit={handleSignInSubmit} className="space-y-3">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <label className="flex items-center gap-1 text-neutral-600 font-bold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-brand-green focus:ring-0 accent-brand-green w-3 h-3"
                      defaultChecked
                    />
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
                  Sign In
                </button>

                <div className="pt-3 border-t border-neutral-100 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400">New to Kalyani Kitchen?</span>
                  <button
                    type="button"
                    onClick={() => onPathChange("/create-account")}
                    className="inline-flex items-center gap-1 text-brand-green font-extrabold text-[10px] uppercase hover:underline cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {mode === "forget_password" && resetStep === "email" && (
              <form onSubmit={handleForgotPasswordEmailSubmit} className="space-y-3">
                <p className="text-[10px] text-neutral-500 leading-normal text-center mb-1">
                  Enter your registered email. We will send a 6-digit verification code to reset your password.
                </p>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="Your registered email address"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                >
                  Send Verification Code
                </button>

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

            {mode === "forget_password" && resetStep === "otp" && (
              <div className="space-y-3">
                <OtpVerificationForm
                  email={email}
                  onVerify={handleForgotPasswordOtpVerify}
                  onResend={handleForgotPasswordResend}
                  isLoading={isLoading}
                  resendCooldownSeconds={resendCooldown}
                  submitLabel="Verify Code"
                  description="Enter the 6-digit code sent to your email to continue."
                />
                <div className="pt-2 border-t border-neutral-100 text-center">
                  <button
                    type="button"
                    onClick={() => setResetStep("email")}
                    className="text-[10px] font-extrabold text-brand-green uppercase tracking-wide hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change Email
                  </button>
                </div>
              </div>
            )}

            {mode === "forget_password" && resetStep === "new_password" && (
              <form onSubmit={handleForgotPasswordNewPasswordSubmit} className="space-y-3">
                <p className="text-[10px] text-neutral-500 leading-normal text-center mb-1">
                  Email verified. Choose a new secure password for your account.
                </p>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                >
                  Update Password
                </button>
              </form>
            )}

            {mode === "create_account" && signupStep !== "otp" && (
              <form onSubmit={handleCreateAccountSubmit} className="space-y-3">
                <SignupProgress currentStep={signupStep} />
                {signupStep === "details" && (
                  <>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your first and last name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      Next
                    </button>
                  </>
                )}

                {signupStep === "security" && (
                  <>
                    <p className="text-[10px] text-neutral-500 leading-normal text-center mb-1">
                      Choose a password to secure your personal kitchen profile.
                    </p>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="w-full pl-8 pr-8 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
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
                      Continue
                    </button>
                  </>
                )}

                {signupStep === "address" && (
                  <div className="space-y-3">
                    <div className="bg-brand-green/5 p-2 rounded-lg">
                      <p className="text-[10px] font-bold text-brand-green flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Delivery Address
                      </p>
                      <p className="text-[9px] text-neutral-500 mt-0.5">
                        Please pin or search your precise home delivery address.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locatingUser}
                      className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 active:scale-98 transition-transform cursor-pointer"
                    >
                      <Navigation className={`w-3 h-3 ${locatingUser ? "animate-spin" : ""}`} />
                      {locatingUser ? "Detecting current location..." : "Detect Current Location"}
                    </button>

                    <div className="space-y-0.5 relative">
                      <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                        Search Delivery Location
                      </label>
                      <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Search landmark, colony, city..."
                          value={mapSearch}
                          onChange={(event) => handleMapSearch(event.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none bg-neutral-50 text-neutral-900"
                        />
                      </div>

                      {mapSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto divide-y divide-neutral-100">
                          {mapSuggestions.map((feature) => (
                            <button
                              key={feature.id}
                              type="button"
                              onClick={() => {
                                setAddressLine(feature.place_name);
                                setMapSearch(feature.place_name);
                                setMapSuggestions([]);
                              }}
                              className="w-full text-left p-2 hover:bg-neutral-50 transition-colors text-[10px] font-medium text-neutral-700 truncate block"
                            >
                              {feature.place_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-0.5">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                          House / Flat / Block No.
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Building 4B, Flat 201"
                          value={houseNo}
                          onChange={(event) => setHouseNo(event.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none text-neutral-900 font-medium"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                          Landmark / Floor Area
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Near Post Office"
                          value={landmark}
                          onChange={(event) => setLandmark(event.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-green focus:outline-none text-neutral-900 font-medium"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-extrabold text-neutral-600 block uppercase tracking-wider">
                          Full Delivery Address
                        </label>
                        <textarea
                          rows={2}
                          readOnly
                          value={addressLine}
                          className="w-full px-2 py-1 text-[10px] border border-neutral-200 bg-neutral-50 rounded-md text-neutral-600 font-medium focus:outline-none resize-none"
                          placeholder="Detected or selected address will appear here"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/95 text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer mt-2"
                    >
                      Send Verification Code
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

            {mode === "create_account" && signupStep === "otp" && (
              <div className="space-y-3">
                <SignupProgress currentStep="otp" />

                <div className="bg-brand-green/5 border border-brand-green/15 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-extrabold text-brand-green uppercase tracking-wider">
                    Email Verification Required
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                    Enter the 6-digit code we sent to complete your Kalyani Kitchen account.
                  </p>
                </div>

                {otpSendStatus === "failed" && (
                  <button
                    type="button"
                    onClick={handleRetrySignupOtpSend}
                    className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase py-2 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    Retry Sending Code
                  </button>
                )}

                <OtpVerificationForm
                  email={email}
                  onVerify={handleSignupOtpVerify}
                  onResend={handleSignupOtpResend}
                  isLoading={isLoading}
                  isSending={otpSendStatus === "sending"}
                  resendCooldownSeconds={resendCooldown}
                  submitLabel="Verify & Create Account"
                  description="Enter the 6-digit code sent to your email to complete registration."
                />
                <div className="pt-2 border-t border-neutral-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupStep("address");
                      setOtpSendStatus("idle");
                      setShouldSendSignupOtp(false);
                    }}
                    className="text-[10px] font-extrabold text-brand-green uppercase tracking-wide hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
