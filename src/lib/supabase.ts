import { createClient, type EmailOtpType } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const OTP_CODE_LENGTH = 6;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_VERIFY_ATTEMPTS = 5;

export type UserRole = "USER" | "ADMIN" | "RIDER";
export type OtpPurpose = "signup" | "password_reset";

export interface AuthActionResult {
  success: boolean;
  message?: string;
}

export interface OtpGuardResult {
  allowed: boolean;
  message?: string;
  retryAfterSeconds?: number;
  attemptsRemaining?: number;
  lockedUntil?: string | null;
}

export interface AuthenticateResult {
  success: boolean;
  errorType?: "not_registered" | "wrong_password" | "email_not_verified" | "other";
  message?: string;
  name?: string;
  role?: UserRole;
}

export interface SignupPayload {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

interface RpcGuardResponse {
  allowed?: boolean;
  message?: string;
  retry_after_seconds?: number;
  attempts_remaining?: number;
  locked_until?: string | null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapRpcGuard(data: RpcGuardResponse | null): OtpGuardResult {
  if (!data) {
    return { allowed: true };
  }
  return {
    allowed: Boolean(data.allowed),
    message: data.message,
    retryAfterSeconds: data.retry_after_seconds,
    attemptsRemaining: data.attempts_remaining,
    lockedUntil: data.locked_until ?? null,
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidOtp(otp: string): boolean {
  return new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(otp.trim());
}

function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

function supabaseNotConfigured(): AuthActionResult {
  return { success: false, message: "Supabase authentication is not configured." };
}

export async function checkOtpSendAllowed(
  email: string,
  purpose: OtpPurpose
): Promise<OtpGuardResult> {
  if (!supabase) {
    return { allowed: false, message: "Supabase authentication is not configured." };
  }

  const { data, error } = await supabase.rpc("check_otp_send_allowed", {
    p_email: normalizeEmail(email),
    p_purpose: purpose,
  });

  if (error) {
    console.error("checkOtpSendAllowed error:", error);
    return { allowed: false, message: "Unable to verify OTP send eligibility." };
  }

  return mapRpcGuard(data as RpcGuardResponse);
}

export async function checkOtpVerifyAllowed(
  email: string,
  purpose: OtpPurpose
): Promise<OtpGuardResult> {
  if (!supabase) {
    return { allowed: false, message: "Supabase authentication is not configured." };
  }

  const { data, error } = await supabase.rpc("check_otp_verify_allowed", {
    p_email: normalizeEmail(email),
    p_purpose: purpose,
  });

  if (error) {
    console.error("checkOtpVerifyAllowed error:", error);
    return { allowed: false, message: "Unable to verify OTP eligibility." };
  }

  return mapRpcGuard(data as RpcGuardResponse);
}

export async function recordOtpSent(email: string, purpose: OtpPurpose): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.rpc("record_otp_sent", {
    p_email: normalizeEmail(email),
    p_purpose: purpose,
  });

  if (error) {
    console.error("recordOtpSent error:", error);
  }
}

export async function recordOtpVerifyAttempt(
  email: string,
  purpose: OtpPurpose,
  success: boolean
): Promise<OtpGuardResult> {
  if (!supabase) {
    return { allowed: false, message: "Supabase authentication is not configured." };
  }

  const { data, error } = await supabase.rpc("record_otp_verify_attempt", {
    p_email: normalizeEmail(email),
    p_purpose: purpose,
    p_success: success,
  });

  if (error) {
    console.error("recordOtpVerifyAttempt error:", error);
    return { allowed: false, message: "Unable to record verification attempt." };
  }

  return mapRpcGuard(data as RpcGuardResponse);
}

async function verifyEmailOtp(
  email: string,
  otp: string,
  types: EmailOtpType[]
): Promise<{ success: boolean; message?: string }> {
  if (!supabase) {
    return { success: false, message: "Supabase authentication is not configured." };
  }

  const normalizedEmail = normalizeEmail(email);
  const token = otp.trim();

  for (const type of types) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token,
      type,
    });

    if (!error && data.session) {
      return { success: true };
    }
  }

  return {
    success: false,
    message: "Invalid or expired verification code. Please try again.",
  };
}

async function syncUserProfile(
  userId: string,
  email: string,
  name: string,
  phone: string
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from("users")
    .update({
      name,
      phone,
      email: normalizeEmail(email),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("syncUserProfile error:", error);
  }
}

export async function fetchRegisteredUsers(): Promise<
  Array<{
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone: string;
    vehicle: string;
  }>
> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      console.warn("Error fetching users from Supabase:", error);
      return [];
    }

    return (data ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: (u.role || "USER") as UserRole,
      phone: u.phone || "",
      vehicle: u.vehicle || "",
    }));
  } catch (e) {
    console.error("fetchRegisteredUsers error:", e);
    return [];
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticateResult> {
  if (!supabase) {
    return { success: false, errorType: "other", message: "Supabase database client is not configured" };
  }

  if (!isValidEmail(email)) {
    return { success: false, errorType: "other", message: "Please enter a valid email address." };
  }

  if (!isValidPassword(password)) {
    return { success: false, errorType: "other", message: "Password must be at least 6 characters." };
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!authError && authData?.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      const finalRole = (userData?.role || "USER") as UserRole;
      const finalName =
        userData?.name || authData.user.user_metadata?.name || normalizedEmail.split("@")[0];

      return {
        success: true,
        name: finalName,
        role: finalRole,
      };
    }

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("password")) {
        return { success: false, errorType: "wrong_password" };
      }
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        return {
          success: false,
          errorType: "email_not_verified",
          message: "Please verify your email with the 6-digit code sent during signup.",
        };
      }
      if (msg.includes("not found") || msg.includes("does not exist")) {
        return { success: false, errorType: "not_registered" };
      }
      return { success: false, errorType: "other", message: authError.message };
    }

    return { success: false, errorType: "not_registered" };
  } catch (err) {
    console.error("Supabase authentication error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, errorType: "other", message };
  }
}

export async function checkEmailRegistered(email: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("email", normalizeEmail(email))
      .maybeSingle();

    return !error && Boolean(data);
  } catch (err) {
    console.error("checkEmailRegistered error:", err);
    return false;
  }
}

export async function initiateSignup(payload: SignupPayload): Promise<AuthActionResult> {
  if (!supabase) return supabaseNotConfigured();

  const normalizedEmail = normalizeEmail(payload.email);
  const name = payload.name.trim();
  const phone = payload.phone?.trim() || "";

  if (!name) {
    return { success: false, message: "Name is required." };
  }
  if (!isValidEmail(normalizedEmail)) {
    return { success: false, message: "Please enter a valid email address." };
  }
  if (!isValidPassword(payload.password)) {
    return { success: false, message: "Password must be at least 6 characters." };
  }
  if (!phone) {
    return { success: false, message: "Delivery address is required." };
  }

  const alreadyRegistered = await checkEmailRegistered(normalizedEmail);
  if (alreadyRegistered) {
    return { success: false, message: "This email is already registered. Please sign in instead." };
  }

  const sendGuard = await checkOtpSendAllowed(normalizedEmail, "signup");
  if (!sendGuard.allowed) {
    return {
      success: false,
      message:
        sendGuard.message ||
        `Please wait ${sendGuard.retryAfterSeconds ?? OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting a new code.`,
    };
  }

  const { error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: payload.password,
    options: {
      data: {
        name,
        phone,
      },
    },
  });

  if (signUpError) {
    const msg = signUpError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { success: false, message: "This email is already registered. Please sign in instead." };
    }
    return { success: false, message: signUpError.message };
  }

  await recordOtpSent(normalizedEmail, "signup");

  return {
    success: true,
    message: "A 6-digit verification code has been sent to your email.",
  };
}

export async function resendSignupOtp(email: string): Promise<AuthActionResult> {
  if (!supabase) return supabaseNotConfigured();

  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const sendGuard = await checkOtpSendAllowed(normalizedEmail, "signup");
  if (!sendGuard.allowed) {
    return {
      success: false,
      message:
        sendGuard.message ||
        `Please wait ${sendGuard.retryAfterSeconds ?? OTP_RESEND_COOLDOWN_SECONDS} seconds before resending.`,
    };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  await recordOtpSent(normalizedEmail, "signup");

  return {
    success: true,
    message: "A new verification code has been sent to your email.",
  };
}

export async function verifySignupOtp(
  email: string,
  otp: string,
  profile: { name: string; phone: string }
): Promise<AuthActionResult> {
  if (!supabase) return supabaseNotConfigured();

  const normalizedEmail = normalizeEmail(email);
  if (!isValidOtp(otp)) {
    return { success: false, message: `Please enter a valid ${OTP_CODE_LENGTH}-digit code.` };
  }

  const verifyGuard = await checkOtpVerifyAllowed(normalizedEmail, "signup");
  if (!verifyGuard.allowed) {
    return {
      success: false,
      message: verifyGuard.message || "Verification is temporarily locked.",
    };
  }

  const verification = await verifyEmailOtp(normalizedEmail, otp, ["signup", "email"]);

  if (!verification.success) {
    const attemptResult = await recordOtpVerifyAttempt(normalizedEmail, "signup", false);
    const attemptsMsg =
      attemptResult.attemptsRemaining !== undefined
        ? ` ${attemptResult.attemptsRemaining} attempt(s) remaining.`
        : "";
    return {
      success: false,
      message: (verification.message || "Invalid verification code.") + attemptsMsg,
    };
  }

  await recordOtpVerifyAttempt(normalizedEmail, "signup", true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await syncUserProfile(user.id, normalizedEmail, profile.name.trim(), profile.phone.trim());
  }

  return { success: true, message: "Email verified. Your account is ready." };
}

export async function sendPasswordResetOtp(email: string): Promise<AuthActionResult> {
  if (!supabase) return supabaseNotConfigured();

  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const registered = await checkEmailRegistered(normalizedEmail);
  if (!registered) {
    return {
      success: false,
      message: "This email address is not registered. Please check the spelling or sign up.",
    };
  }

  const sendGuard = await checkOtpSendAllowed(normalizedEmail, "password_reset");
  if (!sendGuard.allowed) {
    return {
      success: false,
      message:
        sendGuard.message ||
        `Please wait ${sendGuard.retryAfterSeconds ?? OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting a new code.`,
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  await recordOtpSent(normalizedEmail, "password_reset");

  return {
    success: true,
    message: "A 6-digit verification code has been sent to your email.",
  };
}

export async function resendPasswordResetOtp(email: string): Promise<AuthActionResult> {
  return sendPasswordResetOtp(email);
}

export async function verifyPasswordResetOtp(email: string, otp: string): Promise<AuthActionResult> {
  if (!supabase) return supabaseNotConfigured();

  const normalizedEmail = normalizeEmail(email);
  if (!isValidOtp(otp)) {
    return { success: false, message: `Please enter a valid ${OTP_CODE_LENGTH}-digit code.` };
  }

  const verifyGuard = await checkOtpVerifyAllowed(normalizedEmail, "password_reset");
  if (!verifyGuard.allowed) {
    return {
      success: false,
      message: verifyGuard.message || "Verification is temporarily locked.",
    };
  }

  const verification = await verifyEmailOtp(normalizedEmail, otp, ["email", "recovery"]);

  if (!verification.success) {
    const attemptResult = await recordOtpVerifyAttempt(normalizedEmail, "password_reset", false);
    const attemptsMsg =
      attemptResult.attemptsRemaining !== undefined
        ? ` ${attemptResult.attemptsRemaining} attempt(s) remaining.`
        : "";
    return {
      success: false,
      message: (verification.message || "Invalid verification code.") + attemptsMsg,
    };
  }

  await recordOtpVerifyAttempt(normalizedEmail, "password_reset", true);

  return { success: true, message: "Verification successful. Set your new password." };
}

export async function completePasswordReset(newPassword: string): Promise<AuthActionResult> {
  if (!supabase) return supabaseNotConfigured();

  if (!isValidPassword(newPassword)) {
    return { success: false, message: "Password must be at least 6 characters." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return { success: false, message: updateError.message };
  }

  await supabase.auth.signOut();

  return { success: true, message: "Password updated successfully. Please sign in." };
}

export async function fetchAllOrders(): Promise<
  Array<{
    id: string;
    total: number;
    items: unknown;
    date: string;
    status: string;
    riderEmail: string;
    riderName: string;
    userEmail: string;
  }>
> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching Supabase orders:", error);
      return [];
    }

    return (data ?? []).map((d) => ({
      id: d.id,
      total: d.total,
      items: typeof d.items === "string" ? JSON.parse(d.items) : d.items,
      date: d.date || new Date(d.created_at).toLocaleDateString("en-IN"),
      status: d.status,
      riderEmail: d.rider_email,
      riderName: d.rider_name,
      userEmail: d.user_email,
    }));
  } catch (err) {
    console.error("Orders fetch error:", err);
    return [];
  }
}

export async function insertOrder(order: {
  id: string;
  total: number;
  items: unknown[];
  userEmail: string;
}): Promise<boolean> {
  if (!supabase) return false;

  const indianDateString = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    const { error } = await supabase.from("orders").insert({
      id: order.id,
      total: order.total,
      items: order.items,
      status: "Pending",
      user_email: order.userEmail,
      date: indianDateString,
    });
    if (error) {
      console.error("Error inserting Supabase order:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase insert order error:", err);
    return false;
  }
}

export async function updateOrderStatusInDB(orderId: string, status: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

    if (error) {
      console.error("Error updating status in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Status update error:", err);
    return false;
  }
}

export async function assignRiderToOrderInDB(
  orderId: string,
  riderEmail: string,
  riderName: string,
  status?: string
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("orders")
      .update({
        rider_email: riderEmail,
        rider_name: riderName,
        status: status || "Preparing",
      })
      .eq("id", orderId);

    if (error) {
      console.error("Error assigning rider in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Rider assign error:", err);
    return false;
  }
}

export async function fetchMenuCustomizer(): Promise<
  Record<string, { price?: number; inStock?: boolean }>
> {
  if (!supabase) return {};

  try {
    const { data, error } = await supabase.from("menu_customizer").select("*");
    if (error) {
      console.warn("Error fetching menu customizer:", error);
      return {};
    }

    const customs: Record<string, { price?: number; inStock?: boolean }> = {};
    (data ?? []).forEach((row) => {
      customs[row.item_id] = {
        price: row.price !== null ? Number(row.price) : undefined,
        inStock: row.in_stock !== null ? row.in_stock : undefined,
      };
    });
    return customs;
  } catch (e) {
    console.error("Fetch menu customizer error:", e);
    return {};
  }
}

export async function saveMenuCustomizerInDB(
  itemId: string,
  settings: { price?: number; inStock?: boolean }
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: existing } = await supabase
      .from("menu_customizer")
      .select("item_id")
      .eq("item_id", itemId)
      .maybeSingle();

    const updateFields: { price?: number; in_stock?: boolean } = {};
    if (settings.price !== undefined) updateFields.price = settings.price;
    if (settings.inStock !== undefined) updateFields.in_stock = settings.inStock;

    const query = existing
      ? supabase.from("menu_customizer").update(updateFields).eq("item_id", itemId)
      : supabase.from("menu_customizer").insert({
          item_id: itemId,
          price: settings.price !== undefined ? settings.price : null,
          in_stock: settings.inStock !== undefined ? settings.inStock : true,
        });

    const { error } = await query;
    if (error) {
      console.error("Error saving menu customizer in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Save menu customizer error:", err);
    return false;
  }
}
