// types.ts
// Based on Design Document #1: Data Dictionary

// ---------- ENUMS ----------
export type PlanType = 'free' | 'pro' | 'enterprise';
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type RatebookSourceType = 'derived' | 'upload';
export type RatebookStatus = 'draft' | 'published' | 'archived';
export type ProjectType = 'building' | 'road' | 'drain' | 'industrial' | 'custom';
export type ProjectStatus = 'active' | 'archived';
// FIX: Add 'concrete' to ItemCategory to match schema and usage in mock data and components.
export type ItemCategory = 'labour' | 'material' | 'machinery' | 'carriage' | 'composite' | 'sundry' | 'adjustment' | 'concrete';
export type LanguageCode = 'en' | 'hi' | 'te' | 'mr';

// ---------- 1. Core Administrative Entities ----------
export interface User {
  id: string; // UUID
  email: string;
  full_name: string;
  plan_type: PlanType;
}

export interface Organization {
  id: string; // UUID
  name: string;
  domain?: string;
  region_default_id?: string;
  plan_type: PlanType;
  updated_at: string;
}

export interface UserOrg {
  id: string; // UUID
  user_id: string;
  org_id: string;
  role: UserRole;
  organizations?: Organization; // Joined data
}

export interface Subscription {
  id: string; // UUID
  org_id: string;
  plan_type: PlanType;
  is_active: boolean;
  max_projects: number;
  started_at?: string;
  expires_at?: string;
}

// ---------- 2. Regional & Ratebook Management ----------
export interface Region {
  id: string; // UUID
  name: string;
  short_code: string;
  country: string;
  base_factor_labour: number;
  base_factor_material: number;
  base_factor_machinery: number;
  base_factor_carriage: number;
  currency_symbol: string;
  locale: string;
}

export interface Ratebook {
  id: string; // UUID
  name: string;
  region_id: string;
  year: number;
  effective_date: string;
  source_type: RatebookSourceType;
  parent_ratebook_id?: string;
  status: RatebookStatus;
  items_count?: number; // Added for list view
  last_updated?: string; // Added for list view
}

export interface RatebookDetail {
  id: string; // UUID
  ratebook_id: string;
  code: string;
  description_en: string;
  description_local?: string;
  lang_code?: LanguageCode;
  uom: string;
  category: ItemCategory;
  base_rate: number;
  mapped_cpwd_code?: string;
  // FIX: Add optional properties to support component features
  rate_analyses?: any; 
  is_custom?: boolean;
  initial_lead_included_km?: number;
  total_lead_km?: number;
  initial_lift_included_m?: number;
  total_lift_m?: number;
}

export interface RegionalFactor {
    id: string; // UUID
    region_id: string;
    year: number;
    labour: number;
    material: number;
    machinery: number;
    carriage: number;
}

// ---------- 3. Project Hierarchy & BOQ Data ----------
export interface Project {
  id: string; // UUID
  org_id: string;
  name: string;
  description?: string;
  project_type: ProjectType;
  region_id: string;
  ratebook_id: string;
  water_pct: number;
  gst_factor: number;
  cpoh_pct: number;
  cess_pct: number;
  language: LanguageCode;
  status: ProjectStatus;
  last_updated: string; // For list view
  totalCost?: number; // For list view
  ratebook?: Pick<Ratebook, 'id' | 'name' | 'year'>; // Joined data
}

export interface Subproject {
  id: string; // UUID
  project_id: string;
  name: string;
  description?: string;
  items?: BOQItem[]; // Joined data
}

export interface BOQItem {
  id: string; // UUID
  subproject_id: string;
  item_code: string;
  description_en: string;
  description_local?: string;
  lang_code?: LanguageCode;
  uom: string;
  quantity: number;
  base_rate: number;
  final_rate: number;
  amount: number;
  category: ItemCategory;
  analysis_json?: AnalysisJSON;
  ratebook_detail: RatebookDetail; // Joined for full details
  // FIX: Add optional properties to support RateExplanationModal component logic
  initial_lead_included_km?: number;
  total_lead_km?: number;
  initial_lift_included_m?: number;
  total_lift_m?: number;
}

export interface AnalysisJSON {
    components: RateAnalysisComponent[];
    buckets: Record<ItemCategory, number>;
    stages: Record<string, number>; // W, X, Y, Z0, Z
    rules_applied: any;
    final_rounding_policy: any;
    // FIX: Add optional properties to support RateExplanationModal component logic
    analysis_for_quantity?: number;
    contractor_overheads?: { percentage?: number };
}

export interface RateAnalysisComponent {
    type: ItemCategory;
    code: string;
    desc: string;
    uom: string;
    qty: number;
    rate: number;
    amount: number;
    tags?: string[];
}


// ---------- 4. Glossary & Multilingual Support ----------
export interface Glossary {
  id: string; // UUID
  term: string;
  category: string;
  en: string;
  hi?: string;
  te?: string;
  mr?: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
}

// ---------- Dashboard Data ----------
export interface DashboardOverviewData {
  activeProjects: {
    count: number;
    limit: number;
  };
  latestRatebook: string;
  exportsThisWeek: number;
  plan: PlanType;
}

// FIX: Add missing type for RatebookComparison component
export interface RatebookComparisonItem {
  code: string;
  description: string;
  baseRate: number;
  targetRate: number;
  delta: number;
  deltaPercent: number;
}

// FIX: Add missing type for RateExplanationModal component
export interface FullCharges {
  seigniorage: any;
  loadingUnloading: any;
  transportSlabs: any;
}


// Calculation Engine related types
export interface CalculationInputs {
  components: RateAnalysisComponent[];
  factors: {
    water_pct: number;
    gst_factor: number;
    cpoh_pct: number;
    cess_pct: number;
  };
  mode: 'derived' | 'official';
  rules: any; // for deductions, credits etc.
  qty_item: number;
}

export interface CalculationResult {
    buckets: Record<ItemCategory, number>;
    stages: { W: number; X: number; Y: number; Z0: number; Z: number };
    final_rate: number;
    final_amount: number;
}
