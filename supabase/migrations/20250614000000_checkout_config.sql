-- Checkout & delivery configuration (no hardcoded values in frontend source)

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (key, value)
VALUES (
  'checkout_config',
  '{
    "platform_fee_percent": 2,
    "min_order_value": 100,
    "delivery_charge": 0,
    "max_delivery_km": 3,
    "hotel_latitude": 12.90115056018236,
    "hotel_longitude": 77.70946252883596
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.app_settings FROM anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

CREATE OR REPLACE FUNCTION public.get_checkout_config()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT value FROM public.app_settings WHERE key = 'checkout_config'),
    '{
      "platform_fee_percent": 2,
      "min_order_value": 100,
      "delivery_charge": 0,
      "max_delivery_km": 3,
      "hotel_latitude": 12.90115056018236,
      "hotel_longitude": 77.70946252883596
    }'::jsonb
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_checkout_config() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_checkout_config(p_config jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'::public.user_role
  ) THEN
    RAISE EXCEPTION 'Only admins can update checkout configuration';
  END IF;

  INSERT INTO public.app_settings (key, value, updated_at)
  VALUES ('checkout_config', p_config, now())
  ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_checkout_config(jsonb) TO authenticated;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id text;
