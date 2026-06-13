import { createClient } from "@supabase/supabase-js";

// @ts-ignore
const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL as string) || "";
// @ts-ignore
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface AuthActionResult {
  success: boolean;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

// Fetch live users from Supabase
export async function fetchRegisteredUsers(): Promise<any[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      console.warn("Error fetching users from Supabase:", error);
      return [];
    }

    if (data) {
      return data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role || "USER",
        phone: u.phone || "",
        vehicle: u.vehicle || ""
      }));
    }
  } catch (e) {
    console.error("fetchRegisteredUsers error:", e);
  }
  return [];
}

// Helper to check if a user exists and check credentials
export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; errorType?: "not_registered" | "wrong_password" | "other"; message?: string; name?: string; role?: "USER" | "ADMIN" | "RIDER" }> {
  if (!supabase) {
    return { success: false, errorType: "other", message: "Supabase database client is not configured" };
  }

  try {
    // 1. Try checking via Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (!authError && authData?.user) {
      // 2. Fetch the custom profile info and role of this user from public.users table (synced by your database triggers on auth user insertion)
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      const finalRole = userData?.role || "USER";
      const finalName = userData?.name || authData.user.user_metadata?.name || email.split("@")[0];

      return { 
        success: true, 
        name: finalName,
        role: finalRole
      };
    }

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("password")) {
        return { success: false, errorType: "wrong_password" };
      }
      if (msg.includes("not found") || msg.includes("does not exist") || msg.includes("email not confirmed")) {
        return { success: false, errorType: "not_registered" };
      }
    }

    return { success: false, errorType: "not_registered" };
  } catch (err: any) {
    console.error("Supabase authentication error:", err);
    return { success: false, errorType: "other", message: err.message || "An expected error occurred" };
  }
}

// Check if email already registered
export async function checkEmailRegistered(email: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (!error && data) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("checkEmailRegistered error:", err);
    return false;
  }
}

// Complete register / insert user
export async function registerNewUser(user: { 
  email: string; 
  name: string; 
  password?: string;
  phone?: string;
}): Promise<AuthActionResult> {
  const normalizedEmail = user.email.toLowerCase();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase authentication is not configured."
    };
  }

  if (!user.password) {
    return {
      success: false,
      message: "A password is required to create an account."
    };
  }

  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: user.password,
      options: {
        data: {
          name: user.name,
          phone: user.phone || ""
        }
      }
    });

    if (signUpError) {
      return { success: false, message: signUpError.message };
    }

    return {
      success: true,
      requiresEmailConfirmation: !data.session
    };
  } catch (e: any) {
    console.error("Supabase user register error:", e);
    return {
      success: false,
      message: e?.message || "Failed to create the account."
    };
  }
}

export async function sendPasswordResetEmail(email: string, redirectTo?: string): Promise<AuthActionResult> {
  if (!supabase) {
    return {
      success: false,
      message: "Supabase authentication is not configured."
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Password reset instructions have been sent if the account exists."
    };
  } catch (e: any) {
    console.error("sendPasswordResetEmail error:", e);
    return {
      success: false,
      message: e?.message || "Failed to send password reset instructions."
    };
  }
}

// Change password for an authenticated recovery session.
export async function updateUserPasswordInDB(newPassword: string): Promise<AuthActionResult> {
  if (!supabase) {
    return {
      success: false,
      message: "Supabase authentication is not configured."
    };
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.error("updateUserPasswordInDB error:", e);
    return {
      success: false,
      message: e?.message || "Failed to update the password."
    };
  }
}

// --- Orders database persistence ---
export async function fetchAllOrders(): Promise<any[]> {
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

    if (data) {
      return data.map((d: any) => ({
        id: d.id,
        total: d.total,
        items: typeof d.items === 'string' ? JSON.parse(d.items) : d.items,
        date: d.date || new Date(d.created_at).toLocaleDateString("en-IN"),
        status: d.status,
        riderEmail: d.rider_email,
        riderName: d.rider_name,
        userEmail: d.user_email,
      }));
    }
  } catch (err) {
    console.error("Orders fetch error:", err);
  }
  return [];
}

export async function insertOrder(order: { id: string; total: number; items: any[]; userEmail: string }): Promise<boolean> {
  if (!supabase) return false;

  const IndianDateString = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  try {
    const { error } = await supabase.from("orders").insert({
      id: order.id,
      total: order.total,
      items: order.items,
      status: "Pending",
      user_email: order.userEmail,
      date: IndianDateString,
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
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

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

export async function assignRiderToOrderInDB(orderId: string, riderEmail: string, riderName: string, status?: string): Promise<boolean> {
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

// --- Menu customization database helpers ---
export async function fetchMenuCustomizer(): Promise<Record<string, { price?: number; inStock?: boolean }>> {
  if (!supabase) return {};

  try {
    const { data, error } = await supabase.from("menu_customizer").select("*");
    if (error) {
      console.warn("Error fetching menu customizer:", error);
      return {};
    }

    if (data) {
      const customs: Record<string, { price?: number; inStock?: boolean }> = {};
      data.forEach((row: any) => {
        customs[row.item_id] = {
          price: row.price !== null ? Number(row.price) : undefined,
          inStock: row.in_stock !== null ? row.in_stock : undefined,
        };
      });
      return customs;
    }
  } catch (e) {
    console.error("Fetch menu customizer error:", e);
  }
  return {};
}

export async function saveMenuCustomizerInDB(itemId: string, settings: { price?: number; inStock?: boolean }): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: existing } = await supabase
      .from("menu_customizer")
      .select("item_id")
      .eq("item_id", itemId)
      .maybeSingle();

    let query;
    if (existing) {
      const updateFields: any = {};
      if (settings.price !== undefined) updateFields.price = settings.price;
      if (settings.inStock !== undefined) updateFields.in_stock = settings.inStock;
      query = supabase
        .from("menu_customizer")
        .update(updateFields)
        .eq("item_id", itemId);
    } else {
      query = supabase
        .from("menu_customizer")
        .insert({
          item_id: itemId,
          price: settings.price !== undefined ? settings.price : null,
          in_stock: settings.inStock !== undefined ? settings.inStock : true,
        });
    }

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


