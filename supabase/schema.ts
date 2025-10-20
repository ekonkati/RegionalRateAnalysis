
// This file contains the SQL script to set up your Supabase database.
//
// HOW TO USE:
// 1. Copy the entire string content from the `schema` variable below.
// 2. Go to your Supabase project dashboard.
// 3. Navigate to the "SQL Editor".
// 4. Click "+ New query".
// 5. Paste the copied SQL script into the editor.
// 6. Click "RUN".
//
// This will create all the necessary tables and enable Row Level Security.

export const schema = `
-- Drop existing tables in reverse order of dependency to avoid foreign key constraints issues
DROP TABLE IF EXISTS public.boq_items;
DROP TABLE IF EXISTS public.subprojects;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.rate_analysis_components;
DROP TABLE IF EXISTS public.rate_analyses;
DROP TABLE IF EXISTS public.ratebook_items;
DROP TABLE IF EXISTS public.ratebooks;
DROP TABLE IF EXISTS public.seigniorage_charges;
DROP TABLE IF EXISTS public.loading_unloading_charges;
DROP TABLE IF EXISTS public.transport_charge_slabs;
DROP TABLE IF EXISTS public.contractor_overheads;

-- Create Ratebooks Table
CREATE TABLE public.ratebooks (
    id TEXT PRIMARY KEY DEFAULT 'rb-' || lower(hex(randomblob(8))),
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    year INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    items_count INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.ratebooks IS 'Stores schedules of rates books, e.g., CPWD DSR 2025.';

-- Create Contractor Overheads Table
CREATE TABLE public.contractor_overheads (
    id TEXT PRIMARY KEY DEFAULT 'co-' || lower(hex(randomblob(8))),
    region TEXT NOT NULL UNIQUE,
    percentage NUMERIC(5, 3) NOT NULL
);
COMMENT ON TABLE public.contractor_overheads IS 'Stores contractor profit and overhead percentages by region.';

-- Create Seigniorage Charges Table
CREATE TABLE public.seigniorage_charges (
    id TEXT PRIMARY KEY DEFAULT 'sgc-' || lower(hex(randomblob(8))),
    region TEXT NOT NULL,
    material_category TEXT NOT NULL,
    rate NUMERIC(10, 2) NOT NULL,
    uom TEXT NOT NULL,
    UNIQUE(region, material_category)
);
COMMENT ON TABLE public.seigniorage_charges IS 'Stores royalty/seigniorage fees for raw materials by region.';

-- Create Loading and Unloading Charges Table
CREATE TABLE public.loading_unloading_charges (
    id TEXT PRIMARY KEY DEFAULT 'luc-' || lower(hex(randomblob(8))),
    region TEXT NOT NULL,
    material_category TEXT NOT NULL,
    charge_type TEXT NOT NULL, -- 'loading' or 'unloading'
    method TEXT NOT NULL, -- 'manual' or 'mechanical'
    rate NUMERIC(10, 2) NOT NULL,
    uom TEXT NOT NULL,
    UNIQUE(region, material_category, charge_type, method)
);
COMMENT ON TABLE public.loading_unloading_charges IS 'Stores costs for loading and unloading materials.';

-- Create Transport (Lead/Lift) Charge Slabs Table
CREATE TABLE public.transport_charge_slabs (
    id TEXT PRIMARY KEY DEFAULT 'tcs-' || lower(hex(randomblob(8))),
    region TEXT NOT NULL,
    transport_type TEXT NOT NULL, -- 'lead' or 'lift'
    material_category TEXT NOT NULL,
    start_dist NUMERIC(8, 2) NOT NULL,
    end_dist NUMERIC(8, 2) NOT NULL,
    rate NUMERIC(10, 2) NOT NULL, -- Rate for this slab (per uom per distance unit)
    is_fixed_rate BOOLEAN DEFAULT FALSE -- True if the rate is a total for the slab, not per km/m
);
COMMENT ON TABLE public.transport_charge_slabs IS 'Stores tiered transport (lead) and vertical movement (lift) charges.';


-- Create Ratebook Items Table
CREATE TABLE public.ratebook_items (
    id TEXT PRIMARY KEY DEFAULT 'rbi-' || lower(hex(randomblob(8))),
    ratebook_id TEXT NOT NULL REFERENCES public.ratebooks(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    uom TEXT NOT NULL,
    base_rate NUMERIC(12, 2) NOT NULL, -- The final rate from the SOR, including overheads
    initial_lead_included_km NUMERIC(8, 2) DEFAULT 0,
    initial_lift_included_m NUMERIC(8, 2) DEFAULT 0,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.ratebook_items IS 'Individual line items for each ratebook.';

-- Create Rate Analyses Table (Header for a breakdown)
CREATE TABLE public.rate_analyses (
    id TEXT PRIMARY KEY DEFAULT 'ra-' || lower(hex(randomblob(8))),
    ratebook_item_id TEXT NOT NULL REFERENCES public.ratebook_items(id) ON DELETE CASCADE UNIQUE,
    contractor_overhead_id TEXT REFERENCES public.contractor_overheads(id),
    analysis_for_quantity NUMERIC(10,2) NOT NULL DEFAULT 1.00,
    uom TEXT NOT NULL
);
COMMENT ON TABLE public.rate_analyses IS 'Header for a detailed rate breakdown of a ratebook item.';

-- Create Rate Analysis Components Table (Materials, Labour, Machinery)
CREATE TABLE public.rate_analysis_components (
    id TEXT PRIMARY KEY DEFAULT 'rac-' || lower(hex(randomblob(8))),
    rate_analysis_id TEXT NOT NULL REFERENCES public.rate_analyses(id) ON DELETE CASCADE,
    component_type TEXT NOT NULL, -- 'material', 'labour', 'machinery'
    description TEXT NOT NULL,
    quantity NUMERIC(12, 4),
    uom TEXT,
    rate NUMERIC(12, 2)
);
COMMENT ON TABLE public.rate_analysis_components IS 'Component items for a rate analysis (materials, labour, etc).';


-- Create Projects Table
CREATE TABLE public.projects (
    id TEXT PRIMARY KEY DEFAULT 'proj-' || lower(hex(randomblob(8))),
    name TEXT NOT NULL,
    region TEXT,
    status TEXT NOT NULL DEFAULT 'Planning',
    total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    ratebook_id TEXT REFERENCES public.ratebooks(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.projects IS 'Top-level construction projects.';

-- Create Subprojects Table
CREATE TABLE public.subprojects (
    id TEXT PRIMARY KEY DEFAULT 'sp-' || lower(hex(randomblob(8))),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.subprojects IS 'Sub-sections of a project, e.g., Foundation Works.';

-- Create Bill of Quantities (BOQ) Items Table
CREATE TABLE public.boq_items (
    id TEXT PRIMARY KEY DEFAULT 'boqi-' || lower(hex(randomblob(8))),
    subproject_id TEXT NOT NULL REFERENCES public.subprojects(id) ON DELETE CASCADE,
    ratebook_item_id TEXT NOT NULL REFERENCES public.ratebook_items(id),
    quantity NUMERIC(12, 2) NOT NULL,
    -- User-defined overrides for specific BOQ items
    total_lead_km NUMERIC(8, 2),
    total_lift_m NUMERIC(8, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.boq_items IS 'Links ratebook items to subprojects to form the BOQ.';


-- Indexes for performance
CREATE INDEX idx_ratebook_items_ratebook_id ON public.ratebook_items(ratebook_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_rate_analysis_components_analysis_id ON public.rate_analysis_components(rate_analysis_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ratebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratebook_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_analysis_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprojects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_overheads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seigniorage_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loading_unloading_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_charge_slabs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow users to manage their own ratebooks" ON public.ratebooks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow users to view public ratebooks" ON public.ratebooks FOR SELECT USING (user_id IS NULL);
CREATE POLICY "Allow view access to items based on parent ratebook" ON public.ratebook_items FOR SELECT USING ((SELECT EXISTS (SELECT 1 FROM public.ratebooks WHERE id = ratebook_id)));
CREATE POLICY "Allow access to analysis based on ratebook item" ON public.rate_analyses FOR ALL USING ((SELECT EXISTS (SELECT 1 FROM public.ratebook_items rbi JOIN public.ratebooks rb ON rbi.ratebook_id = rb.id WHERE rbi.id = ratebook_item_id AND (rb.user_id = auth.uid() OR rb.user_id IS NULL))));
CREATE POLICY "Allow access to components based on analysis" ON public.rate_analysis_components FOR ALL USING ((SELECT EXISTS (SELECT 1 FROM public.rate_analyses WHERE id = rate_analysis_id)));
CREATE POLICY "Allow users to manage their own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow access based on parent project" ON public.subprojects FOR ALL USING (((SELECT user_id FROM public.projects WHERE id = project_id) = auth.uid()));
CREATE POLICY "Allow access based on grandparent project" ON public.boq_items FOR ALL USING (((SELECT p.user_id FROM public.projects p JOIN public.subprojects sp ON p.id = sp.project_id WHERE sp.id = subproject_id) = auth.uid()));
CREATE POLICY "Allow read access to all authenticated users for charges" ON public.contractor_overheads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users for seigniorage" ON public.seigniorage_charges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users for loading" ON public.loading_unloading_charges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users for transport" ON public.transport_charge_slabs FOR SELECT USING (auth.role() = 'authenticated');

-- Function to update 'last_updated' timestamp
CREATE OR REPLACE FUNCTION public.update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_updated = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for projects table
CREATE TRIGGER update_projects_last_updated
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_last_updated_column();
`;
