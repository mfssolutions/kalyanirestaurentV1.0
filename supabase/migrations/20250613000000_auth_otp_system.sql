-- Kalyani Kitchen: Email OTP auth system
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- 1. OTP rate-limiting & brute-force guard table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auth_otp_guards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('signup', 'password_reset')),
  last_sent_at timestamptz,
  verify_attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_otp_guards_email_purpose_key UNIQUE (email, purpose)
);

CREATE INDEX IF NOT EXISTS idx_auth_otp_guards_email_purpose
  ON public.auth_otp_guards (email, purpose);

CREATE INDEX IF NOT EXISTS idx_auth_otp_guards_locked_until
  ON public.auth_otp_guards (locked_until)
  WHERE locked_until IS NOT NULL;

ALTER TABLE public.auth_otp_guards ENABLE ROW LEVEL SECURITY;

-- No direct client access; all access via SECURITY DEFINER RPC functions
REVOKE ALL ON public.auth_otp_guards FROM anon, authenticated;
GRANT ALL ON public.auth_otp_guards TO service_role;

-- ---------------------------------------------------------------------------
-- 2. Updated_at trigger for auth_otp_guards
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_auth_otp_guards_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_otp_guards_updated_at ON public.auth_otp_guards;
CREATE TRIGGER trg_auth_otp_guards_updated_at
  BEFORE UPDATE ON public.auth_otp_guards
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auth_otp_guards_updated_at();

-- ---------------------------------------------------------------------------
-- 3. OTP guard RPC: check send allowed (60s cooldown + lock check)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_otp_send_allowed(p_email text, p_purpose text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_record public.auth_otp_guards%ROWTYPE;
  v_cooldown_seconds int := 60;
  v_seconds_since_last int;
  v_retry int;
BEGIN
  IF v_email IS NULL OR v_email = '' THEN
    RETURN jsonb_build_object('allowed', false, 'message', 'Email is required.');
  END IF;

  IF p_purpose NOT IN ('signup', 'password_reset') THEN
    RETURN jsonb_build_object('allowed', false, 'message', 'Invalid OTP purpose.');
  END IF;

  SELECT * INTO v_record
  FROM public.auth_otp_guards
  WHERE email = v_email AND purpose = p_purpose;

  IF FOUND AND v_record.locked_until IS NOT NULL AND v_record.locked_until > now() THEN
    v_retry := GREATEST(1, EXTRACT(EPOCH FROM (v_record.locked_until - now()))::int);
    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'Too many failed verification attempts. Please try again later.',
      'locked_until', v_record.locked_until,
      'retry_after_seconds', v_retry
    );
  END IF;

  IF FOUND AND v_record.last_sent_at IS NOT NULL THEN
    v_seconds_since_last := EXTRACT(EPOCH FROM (now() - v_record.last_sent_at))::int;
    IF v_seconds_since_last < v_cooldown_seconds THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'message', 'Please wait before requesting a new verification code.',
        'retry_after_seconds', v_cooldown_seconds - v_seconds_since_last
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. OTP guard RPC: record OTP sent
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_otp_sent(p_email text, p_purpose text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
BEGIN
  INSERT INTO public.auth_otp_guards (email, purpose, last_sent_at, verify_attempts, locked_until)
  VALUES (v_email, p_purpose, now(), 0, NULL)
  ON CONFLICT (email, purpose) DO UPDATE SET
    last_sent_at = now(),
    verify_attempts = 0,
    locked_until = NULL,
    updated_at = now();
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. OTP guard RPC: record verify attempt (max 5 failures, 15 min lock)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_otp_verify_attempt(
  p_email text,
  p_purpose text,
  p_success boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_max_attempts int := 5;
  v_lock_minutes int := 15;
  v_attempts int;
  v_locked_until timestamptz;
BEGIN
  IF p_purpose NOT IN ('signup', 'password_reset') THEN
    RETURN jsonb_build_object('allowed', false, 'message', 'Invalid OTP purpose.');
  END IF;

  INSERT INTO public.auth_otp_guards (email, purpose, verify_attempts)
  VALUES (v_email, p_purpose, 0)
  ON CONFLICT (email, purpose) DO NOTHING;

  IF p_success THEN
    UPDATE public.auth_otp_guards
    SET verify_attempts = 0,
        locked_until = NULL,
        updated_at = now()
    WHERE email = v_email AND purpose = p_purpose;

    RETURN jsonb_build_object('allowed', true, 'attempts_remaining', v_max_attempts);
  END IF;

  UPDATE public.auth_otp_guards
  SET verify_attempts = verify_attempts + 1,
      locked_until = CASE
        WHEN verify_attempts + 1 >= v_max_attempts THEN now() + make_interval(mins => v_lock_minutes)
        ELSE locked_until
      END,
      updated_at = now()
  WHERE email = v_email AND purpose = p_purpose
  RETURNING verify_attempts, locked_until INTO v_attempts, v_locked_until;

  IF v_attempts >= v_max_attempts THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'Too many incorrect codes. Your account is temporarily locked.',
      'attempts_remaining', 0,
      'locked_until', v_locked_until,
      'retry_after_seconds', GREATEST(1, EXTRACT(EPOCH FROM (v_locked_until - now()))::int)
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'message', 'Incorrect verification code.',
    'attempts_remaining', v_max_attempts - v_attempts
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. OTP guard RPC: pre-verify lock check
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_otp_verify_allowed(p_email text, p_purpose text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_record public.auth_otp_guards%ROWTYPE;
  v_max_attempts int := 5;
  v_retry int;
BEGIN
  SELECT * INTO v_record
  FROM public.auth_otp_guards
  WHERE email = v_email AND purpose = p_purpose;

  IF FOUND AND v_record.locked_until IS NOT NULL AND v_record.locked_until > now() THEN
    v_retry := GREATEST(1, EXTRACT(EPOCH FROM (v_record.locked_until - now()))::int);
    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'Too many failed verification attempts. Please try again later.',
      'locked_until', v_record.locked_until,
      'retry_after_seconds', v_retry,
      'attempts_remaining', 0
    );
  END IF;

  IF FOUND AND v_record.verify_attempts >= v_max_attempts THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'Too many failed verification attempts.',
      'attempts_remaining', 0
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'attempts_remaining', v_max_attempts - COALESCE(v_record.verify_attempts, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_otp_send_allowed(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_otp_sent(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_otp_verify_attempt(text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_otp_verify_allowed(text, text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. New user trigger: ALWAYS role=USER unless service_role sets app_metadata.role
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
  v_app_role text;
BEGIN
  v_app_role := NEW.raw_app_meta_data ->> 'role';

  IF v_app_role IN ('ADMIN', 'RIDER') THEN
    v_role := v_app_role::public.user_role;
  ELSE
    v_role := 'USER'::public.user_role;
  END IF;

  INSERT INTO public.users (id, email, name, phone, role, created_at, updated_at)
  VALUES (
    NEW.id,
    lower(NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    v_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.users.name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.users.phone),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 8. Prevent frontend role escalation on public.users
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_user_role_on_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
      IF (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'authenticated' THEN
        NEW.role := OLD.role;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_user_role_on_update ON public.users;
CREATE TRIGGER trg_enforce_user_role_on_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_role_on_update();

-- ---------------------------------------------------------------------------
-- 9. RLS: users can read/update own profile (not role)
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS users_select_admin ON public.users;
CREATE POLICY users_select_admin ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'ADMIN'::public.user_role
    )
  );
