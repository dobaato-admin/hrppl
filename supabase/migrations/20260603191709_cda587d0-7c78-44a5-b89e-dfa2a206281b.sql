
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('super_admin','regional_admin','org_admin','manager','employee');
CREATE TYPE public.tenant_status AS ENUM ('pending','active','suspended','cancelled');

-- Regions
CREATE TABLE public.regions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.regions TO authenticated, anon;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regions readable by all" ON public.regions FOR SELECT USING (true);

-- Countries
CREATE TABLE public.countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region_code TEXT NOT NULL REFERENCES public.regions(code),
  currency_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.countries TO authenticated, anon;
GRANT ALL ON public.countries TO service_role;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "countries readable by all" ON public.countries FOR SELECT USING (true);

-- Tenants (organizations)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL REFERENCES public.countries(code),
  currency_code TEXT NOT NULL,
  status public.tenant_status NOT NULL DEFAULT 'pending',
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  plan TEXT NOT NULL DEFAULT 'starter',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, tenant_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Role scope (regional admins -> countries)
CREATE TABLE public.role_scope (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL REFERENCES public.countries(code),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, country_code)
);
GRANT SELECT ON public.role_scope TO authenticated;
GRANT ALL ON public.role_scope TO service_role;
ALTER TABLE public.role_scope ENABLE ROW LEVEL SECURITY;

-- Subscription confirmations
CREATE TABLE public.subscription_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  currency_code TEXT NOT NULL,
  bank_reference TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  confirmed_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.subscription_confirmations TO authenticated;
GRANT ALL ON public.subscription_confirmations TO service_role;
ALTER TABLE public.subscription_confirmations ENABLE ROW LEVEL SECURITY;

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Security definer helpers
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_country_scope(_user_id UUID, _country_code TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.role_scope WHERE user_id = _user_id AND country_code = _country_code);
$$;

CREATE OR REPLACE FUNCTION public.user_tenant_id(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id;
$$;

-- Profiles RLS
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- User roles RLS
CREATE POLICY "user reads own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

-- Role scope RLS
CREATE POLICY "user reads own scope" ON public.role_scope FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

-- Tenants RLS
CREATE POLICY "super admin all tenants" ON public.tenants FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "regional admin sees scoped tenants" ON public.tenants FOR SELECT
  USING (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), country_code));
CREATE POLICY "regional admin updates scoped tenants" ON public.tenants FOR UPDATE
  USING (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), country_code));
CREATE POLICY "regional admin inserts scoped tenants" ON public.tenants FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'regional_admin') AND public.has_country_scope(auth.uid(), country_code));
CREATE POLICY "org members read their tenant" ON public.tenants FOR SELECT
  USING (id = public.user_tenant_id(auth.uid()));

-- Subscription confirmations RLS
CREATE POLICY "admins read confirmations" ON public.subscription_confirmations FOR SELECT
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'regional_admin'));
CREATE POLICY "admins insert confirmations" ON public.subscription_confirmations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'regional_admin'));

-- Audit log RLS
CREATE POLICY "super admin reads audit" ON public.audit_log FOR SELECT
  USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "authenticated inserts own audit" ON public.audit_log FOR INSERT
  WITH CHECK (actor_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER tenants_touch BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Profile auto-create
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed regions & countries
INSERT INTO public.regions(code,name) VALUES
  ('NA','North America'),('EU','Europe'),('APAC','Asia Pacific'),
  ('MEA','Middle East & Africa'),('LATAM','Latin America');

INSERT INTO public.countries(code,name,region_code,currency_code) VALUES
  ('US','United States','NA','USD'),
  ('CA','Canada','NA','CAD'),
  ('GB','United Kingdom','EU','GBP'),
  ('DE','Germany','EU','EUR'),
  ('FR','France','EU','EUR'),
  ('IN','India','APAC','INR'),
  ('SG','Singapore','APAC','SGD'),
  ('AU','Australia','APAC','AUD'),
  ('JP','Japan','APAC','JPY'),
  ('AE','United Arab Emirates','MEA','AED'),
  ('SA','Saudi Arabia','MEA','SAR'),
  ('ZA','South Africa','MEA','ZAR'),
  ('BR','Brazil','LATAM','BRL'),
  ('MX','Mexico','LATAM','MXN');
