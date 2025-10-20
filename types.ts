
// Enums for status types, providing a single source of truth.
export enum ProjectStatus {
  Active = 'Active',
  Archived = 'Archived',
  Planning = 'Planning',
}

export enum RatebookSource {
  CPWD = 'CPWD',
  StatePWD = 'State PWD',
  Custom = 'Custom',
}

export enum RatebookStatus {
  Published = 'Published',
  Draft = 'Draft',
}

// Detailed Rate Analysis Component Types
export interface RateAnalysisComponent {
  id: string;
  rate_analysis_id: string;
  component_type: 'material' | 'labour' | 'machinery';
  description: string;
  quantity: number | null;
  uom: string | null;
  rate: number | null;
  // Calculated in the frontend
  amount?: number;
}

export interface RateAnalysis {
  id: string;
  ratebook_item_id: string;
  analysis_for_quantity: number;
  uom: string;
  contractor_overheads: ContractorOverhead | null;
  components: RateAnalysisComponent[];
}


// Represents a single item in a Ratebook, the source of truth for rates.
export interface RatebookDetailItem {
  id: string;
  ratebook_id: string;
  code: string;
  description: string;
  uom: string;
  base_rate: number; // This is the final rate from the SOR book.
  initial_lead_included_km: number;
  initial_lift_included_m: number;
  is_custom: boolean;
  // This is a joined field for detailed analysis.
  rate_analyses: RateAnalysis | null;
}

// Represents an item within a project's Bill of Quantities.
export interface BOQItem extends Omit<RatebookDetailItem, 'is_custom' | 'ratebook_id' | 'base_rate'> {
  id: string; // UUID for the BOQ item instance
  ratebook_item_id: string; // Foreign key to the original RatebookDetailItem
  quantity: number;
  rate: number; // Base rate from the ratebook_item
  amount: number; // This will be calculated with effective rate
  // User overrides
  total_lead_km: number | null;
  total_lift_m: number | null;
}

// A sub-section of a project, containing a list of BOQ items.
export interface Subproject {
  id: string; // UUID
  project_id: string;
  name: string;
  items: BOQItem[];
}

// Represents a construction project.
export interface Project {
  id:string; // UUID
  name: string;
  region: string;
  last_updated: string; // ISO date string
  status: ProjectStatus;
  totalCost: number;
  ratebook_id: string;
  user_id: string;
  // This is a denormalized/joined field for easier display.
  ratebooks: {
    id: string;
    name: string;
  } | null;
  subprojects?: Subproject[]; // Optional, loaded on demand.
}

// Represents a schedule of rates book.
export interface Ratebook {
  id: string; // UUID
  name: string;
  source: RatebookSource;
  year: number;
  status: RatebookStatus;
  items_count: number;
  last_updated: string; // ISO date string
  user_id?: string; // Optional: Custom ratebooks belong to a user
}

// Data for comparing two ratebooks.
export interface RatebookComparisonItem {
  code: string;
  description: string;
  uom: string;
  baseRate: number;
  targetRate: number;
  delta: number;
  deltaPercent: number;
}

// Data for the main dashboard overview.
export type PlanType = 'Free' | 'Pro' | 'Enterprise';

export interface OverviewData {
  activeProjects: {
    count: number;
    limit: number;
  };
  latestRatebook: string;
  exportsThisWeek: number;
  plan: PlanType;
}

// User Profile information
export interface UserProfile {
  id: string; /* matches auth.users.id */
  full_name: string;
  company_name: string;
  role: 'admin' | 'user';
}

// New types for enhanced rate analysis
export interface ContractorOverhead {
  id: string;
  region: string;
  percentage: number;
}

export interface SeigniorageCharge {
  id: string;
  region: string;
  material_category: string;
  rate: number;
  uom: string;
}

export interface LoadingUnloadingCharge {
  id: string;
  region: string;
  material_category: string;
  charge_type: 'loading' | 'unloading';
  method: 'manual' | 'mechanical';
  rate: number;
  uom: string;
}

export interface TransportChargeSlab {
  id: string;
  region: string;
  transport_type: 'lead' | 'lift';
  material_category: string;
  start_dist: number;
  end_dist: number;
  rate: number;
  is_fixed_rate: boolean;
}

export interface FullCharges {
  overheads: ContractorOverhead[];
  seigniorage: SeigniorageCharge[];
  loadingUnloading: LoadingUnloadingCharge[];
  transportSlabs: TransportChargeSlab[];
}
