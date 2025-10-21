export const schema = `
-- Disable Row Level Security for initial setup
ALTER TABLE IF EXISTS public.boq_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subprojects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ratebook_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ratebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.glossary DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.regional_factors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_orgs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations DISABLE ROW LEVEL SECURITY;

-- Drop existing tables in reverse order of dependency
DROP TABLE IF EXISTS public.boq_items;
DROP TABLE IF EXISTS public.subprojects;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.ratebook_details;
DROP TABLE IF EXISTS public.ratebooks;
DROP TABLE IF EXISTS public.glossary;
DROP TABLE IF EXISTS public.regional_factors;
DROP TABLE IF EXISTS public.regions;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.user_orgs;
DROP TABLE IF EXISTS public.organizations;

-- Drop types and functions if they exist
DROP TYPE IF EXISTS public.plan_type;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.ratebook_source_type;
DROP TYPE IF EXISTS public.ratebook_status;
DROP TYPE IF EXISTS public.project_type;
DROP TYPE IF EXISTS public.project_status;
DROP TYPE IF EXISTS public.item_category;
DROP TYPE IF EXISTS public.language_code;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.set_config_for_org(text);

-- Create ENUM types
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.user_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public.ratebook_source_type AS ENUM ('derived', 'upload');
CREATE TYPE public.ratebook_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.project_type AS ENUM ('building', 'road', 'drain', 'industrial', 'custom');
CREATE TYPE public.project_status AS ENUM ('active', 'archived');
CREATE TYPE public.item_category AS ENUM ('labour', 'material', 'machinery', 'carriage', 'composite', 'sundry', 'adjustment', 'concrete');
CREATE TYPE public.language_code AS ENUM ('en', 'hi', 'te', 'mr');

-- 1. Core Administrative Entities
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    region_default_id UUID,
    plan_type public.plan_type NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.organizations IS 'Logical workspace for teams/projects.';

CREATE TABLE public.user_orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'viewer',
    status TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, org_id)
);
COMMENT ON TABLE public.user_orgs IS 'Many-to-many link between users and organizations.';

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_type public.plan_type NOT NULL DEFAULT 'free',
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_projects INT NOT NULL DEFAULT 5,
    started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);
COMMENT ON TABLE public.subscriptions IS 'Billing and plan status per organization.';

-- 2. Regional & Ratebook Management
CREATE TABLE public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    short_code TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL DEFAULT 'India',
    base_factor_labour NUMERIC(5,3) NOT NULL DEFAULT 1.0,
    base_factor_material NUMERIC(5,3) NOT NULL DEFAULT 1.0,
    base_factor_machinery NUMERIC(5,3) NOT NULL DEFAULT 1.0,
    base_factor_carriage NUMERIC(5,3) NOT NULL DEFAULT 1.0,
    currency_symbol VARCHAR(4) NOT NULL DEFAULT '₹',
    locale TEXT NOT NULL DEFAULT 'en-IN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.regions IS 'Administrative regions or departments.';

CREATE TABLE public.ratebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region_id UUID NOT NULL REFERENCES public.regions(id),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- Custom ratebooks belong to an org
    year INT NOT NULL,
    effective_date DATE,
    source_type public.ratebook_source_type NOT NULL,
    parent_ratebook_id UUID REFERENCES public.ratebooks(id),
    status public.ratebook_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);
COMMENT ON TABLE public.ratebooks IS 'CPWD and State rate card containers.';

CREATE TABLE public.ratebook_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ratebook_id UUID NOT NULL REFERENCES public.ratebooks(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description_en TEXT NOT NULL,
    description_local TEXT,
    lang_code public.language_code,
    uom VARCHAR(20) NOT NULL,
    category public.item_category NOT NULL,
    base_rate NUMERIC(12, 2) NOT NULL,
    mapped_cpwd_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(ratebook_id, code)
);
COMMENT ON TABLE public.ratebook_details IS 'Item-level rate definitions (bilingual).';

-- 3. Project Hierarchy & BOQ Data
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    project_type public.project_type NOT NULL DEFAULT 'building',
    region_id UUID NOT NULL REFERENCES public.regions(id),
    ratebook_id UUID NOT NULL REFERENCES public.ratebooks(id),
    water_pct NUMERIC(5, 3) NOT NULL DEFAULT 1.0,
    gst_factor NUMERIC(6, 4) NOT NULL DEFAULT 0.2127,
    cpoh_pct NUMERIC(5, 2) NOT NULL DEFAULT 15.0,
    cess_pct NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    language public.language_code NOT NULL DEFAULT 'en',
    status public.project_status NOT NULL DEFAULT 'active',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.projects IS 'Top-level project records.';

CREATE TABLE public.subprojects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.subprojects IS 'Logical groupings within a project.';

CREATE TABLE public.boq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subproject_id UUID NOT NULL REFERENCES public.subprojects(id) ON DELETE CASCADE,
    ratebook_detail_id UUID NOT NULL REFERENCES public.ratebook_details(id),
    quantity NUMERIC(14, 3) NOT NULL,
    -- Analysis & Overrides
    analysis_json JSONB,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.boq_items IS 'Bill-of-quantities entries with computed rates.';


-- 4. Glossary & Multilingual Support
CREATE TABLE public.glossary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- Custom terms for an org
    term VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    en TEXT,
    hi TEXT,
    te TEXT,
    mr TEXT,
    notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    UNIQUE(org_id, term)
);
COMMENT ON TABLE public.glossary IS 'Curated bilingual technical dictionary.';

-- Handle New User: Create Org and link them as owner
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create a new organization for the user
  INSERT INTO public.organizations (name, plan_type)
  VALUES (NEW.email || '''s Org', 'free')
  RETURNING id INTO new_org_id;

  -- Link the new user to the new organization as 'owner'
  INSERT INTO public.user_orgs (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'owner');
  
  -- Create a free subscription for the new org
  INSERT INTO public.subscriptions (org_id, plan_type, is_active, max_projects)
  VALUES (new_org_id, 'free', true, 5);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function for RLS to set org context
create or replace function set_config_for_org(org_id_to_set text)
returns void as $$
begin
  -- check if user is a member of the org
  if not exists (
    select 1 from public.user_orgs
    where org_id = org_id_to_set::uuid and user_id = auth.uid()
  ) then
    raise exception 'User is not a member of the specified organization';
  end if;
  perform set_config('app.current_org_id', org_id_to_set, false);
end;
$$ language plpgsql;


-- RLS Policies
-- Helper function to get the current org_id from the session variable
CREATE OR REPLACE FUNCTION get_current_org() RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_org_id', true)::UUID;
EXCEPTION
  WHEN UNDEFINED_OBJECT THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see organizations they belong to" ON public.organizations FOR SELECT USING (
  id IN (SELECT org_id FROM public.user_orgs WHERE user_id = auth.uid())
);

-- UserOrgs
ALTER TABLE public.user_orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own memberships" ON public.user_orgs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Owners can manage memberships in their org" ON public.user_orgs FOR ALL USING (
  org_id = get_current_org() AND (
    SELECT role FROM public.user_orgs WHERE user_id = auth.uid() AND org_id = get_current_org()
  ) = 'owner'
);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own org subscription" ON public.subscriptions FOR SELECT USING (org_id = get_current_org());

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage projects in their current org" ON public.projects FOR ALL USING (org_id = get_current_org());

-- Subprojects
ALTER TABLE public.subprojects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage subprojects in their current org" ON public.subprojects FOR ALL USING (
  (SELECT org_id FROM public.projects WHERE id = project_id) = get_current_org()
);

-- BOQ Items
ALTER TABLE public.boq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage boq_items in their current org" ON public.boq_items FOR ALL USING (
  (SELECT p.org_id FROM public.projects p JOIN public.subprojects sp ON p.id = sp.project_id WHERE sp.id = subproject_id) = get_current_org()
);

-- Ratebooks
ALTER TABLE public.ratebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view of public ratebooks" ON public.ratebooks FOR SELECT USING (org_id IS NULL);
CREATE POLICY "Allow access to org-specific ratebooks" ON public.ratebooks FOR ALL USING (org_id = get_current_org());

-- RatebookDetails
ALTER TABLE public.ratebook_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access to ratebook items based on parent ratebook" ON public.ratebook_details FOR SELECT USING (
  (SELECT org_id FROM public.ratebooks WHERE id = ratebook_id) IS NULL OR
  (SELECT org_id FROM public.ratebooks WHERE id = ratebook_id) = get_current_org()
);

-- Glossary
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow view of public glossary terms" ON public.glossary FOR SELECT USING (org_id IS NULL);
CREATE POLICY "Allow access to org-specific glossary terms" ON public.glossary FOR ALL USING (org_id = get_current_org());

-- Regions (public data)
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to regions" ON public.regions FOR ALL USING (true);
`;
