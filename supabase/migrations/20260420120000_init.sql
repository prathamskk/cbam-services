-- CBAM MVP schema: suppliers, products, shipments, emissions, documents, portal tokens, profiles

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'importer' CHECK (role = 'importer'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  carbon_maturity_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cn_code TEXT NOT NULL,
  description TEXT,
  default_emission_factor_tco2e_per_tonne NUMERIC NOT NULL DEFAULT 2.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cn_code)
);

CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_date DATE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  mass_tonnes NUMERIC NOT NULL CHECK (mass_tonnes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.emissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('actual', 'default')),
  emission_factor_tco2e_per_tonne NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shipment_id, type)
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers (id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.supplier_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_product_date ON public.shipments (product_id, shipment_date);
CREATE INDEX idx_shipments_supplier ON public.shipments (supplier_id);
CREATE INDEX idx_documents_supplier ON public.documents (supplier_id);
CREATE INDEX idx_products_cn_code ON public.products (cn_code);

-- -----------------------------------------------------------------------------
-- Row Level Security (authenticated importers)
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_portal_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "suppliers_all" ON public.suppliers FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "products_all" ON public.products FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "shipments_all" ON public.shipments FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "emissions_all" ON public.emissions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "documents_all" ON public.documents FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "portal_tokens_all" ON public.supplier_portal_tokens FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- Auth: auto-create profile on signup
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'importer');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Storage bucket: documents (private)
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "documents_storage_authenticated_all" ON storage.objects;
CREATE POLICY "documents_storage_authenticated_all"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- -----------------------------------------------------------------------------
-- Seed data (development / demo)
-- -----------------------------------------------------------------------------

INSERT INTO public.suppliers (id, name, country, carbon_maturity_score)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Shanghai Steelworks Co.', 'CN', 72),
  ('22222222-2222-4222-8222-222222222222', 'Baltic Pig Iron Ltd', 'EE', 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, cn_code, description, default_emission_factor_tco2e_per_tonne)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '7201', 'Pig iron and spiegeleisen in pigs, blocks or other primary forms', 1.91),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '7208', 'Flat-rolled products of iron or steel, hot-rolled', 2.12)
ON CONFLICT (cn_code) DO NOTHING;

INSERT INTO public.shipments (id, shipment_date, supplier_id, product_id, mass_tonnes)
VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '2026-01-15', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 12.5),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '2026-03-02', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 18.0),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '2026-02-20', '22222222-2222-4222-8222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 22.3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.emissions (shipment_id, type, emission_factor_tco2e_per_tonne)
VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'default', 1.91),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'actual', 1.35),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'default', 1.91),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'actual', 1.91),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'default', 2.12),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'actual', 1.6)
ON CONFLICT (shipment_id, type) DO NOTHING;
