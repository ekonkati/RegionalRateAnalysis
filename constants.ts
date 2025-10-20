
import {
  ProjectStatus,
  BOQItem,
  Subproject,
  Project,
  RatebookComparisonItem,
  RatebookDetailItem,
  Ratebook,
  RatebookSource,
  RatebookStatus,
  SeigniorageCharge,
  ContractorOverhead,
  LoadingUnloadingCharge,
  TransportChargeSlab,
  RateAnalysisComponent,
} from './types';

// SVG Icons
export const ICONS = {
  DASHBOARD: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  RATEBOOKS: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  PROJECTS: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z',
  ANALYTICS: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V7h2v10zm-4 0H8V10h2v7zm8-4h-2v-3h2v3z',
  ADMIN: 'M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l-.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l-.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z',
  LOGO: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z',
  SEARCH: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  CHEVRON_DOWN: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  BELL: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  PLAN: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  EXPORTS: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  PLUS: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  DOTS_VERTICAL: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  SNAPSHOT: 'M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2 14H5V6h14v12zM7 10h2v5H7zm4 0h2v5h-2zm4 0h2v5h-2z',
  SEED: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 12.17l6.59-6.59L18 7l-8 8z'
};

// --- Mock data below is for seeding the database via supabase/seedingClientLogic.ts ---

export const MOCK_OVERVIEW_DATA = {
  activeProjects: { count: 0, limit: 5 },
  latestRatebook: 'CPWD DSR 2025',
  exportsThisWeek: 0,
  plan: 'Free' as const,
};

export const MOCK_PROJECTS: Omit<Project, 'id' | 'user_id' | 'ratebooks' | 'last_updated'>[] = [
  {
    name: 'Apollo Hospital, Delhi',
    region: 'Delhi',
    status: ProjectStatus.Active,
    totalCost: 125000000,
    ratebook_id: 'rb-cpwd-2025',
  },
  {
    name: 'Highway NH-44 Expansion',
    region: 'Maharashtra',
    status: ProjectStatus.Active,
    totalCost: 850000000,
    ratebook_id: 'rb-pwd-mh-2024',
  },
];


export const MOCK_FULL_RATEBOOKS: Omit<Ratebook, 'last_updated' | 'created_at'>[] = [
  {
    id: 'rb-cpwd-2025',
    name: 'CPWD Delhi Schedule of Rates 2025',
    source: RatebookSource.CPWD,
    year: 2025,
    status: RatebookStatus.Published,
    items_count: 2,
  },
  {
    id: 'rb-pwd-mh-2024',
    name: 'Maharashtra PWD DSR 2024',
    source: RatebookSource.StatePWD,
    year: 2024,
    status: RatebookStatus.Published,
    items_count: 0,
  },
];

export const MOCK_RATEBOOK_ITEMS: Omit<RatebookDetailItem, 'created_at' | 'rate_analyses'>[] = [
    {
        id: 'rbi-excavation-soil',
        ratebook_id: 'rb-cpwd-2025',
        code: 'IRR-CAW-1-2',
        description: 'Excavation in all kinds of soil including boulders upto 0.30 m dia for field channels, seating of embankment for field channels etc., including dressing of bed and sides to required profile, cost of all materials, machinery, labour, placing the excavated stuff for formation of service road / embankment as directed etc., complete with lead upto 10 m and lift upto 3 m.',
        uom: 'cum',
        base_rate: 74.01,
        initial_lead_included_km: 0.01, // 10m
        initial_lift_included_m: 3.0,
        is_custom: false,
    },
    {
        id: 'rbi-excavation-rock',
        ratebook_id: 'rb-cpwd-2025',
        code: 'IRR-CAW-1-6',
        description: 'Excavation in hard rock of all toughness by blasting including boulders above 1.2 m dia. for canals, seating of embankment, filter drain / catch water drains etc., including levelling the bed by removing all projections by hammering / chiselling, cost of all materials, machinery, labour, placing the excavated rock neatly in approved dump area and levelling the same as directed etc., complete with initial lead upto 1 km and all lifts.',
        uom: 'cum',
        base_rate: 238.70,
        initial_lead_included_km: 1.0,
        initial_lift_included_m: 999, // "all lifts"
        is_custom: false,
    }
];

export const MOCK_RATE_ANALYSES = [
    {
        id: 'ra-excavation-soil',
        ratebook_item_id: 'rbi-excavation-soil',
        contractor_overhead_id: 'co-delhi',
        analysis_for_quantity: 440,
        uom: 'cum',
    },
    {
        id: 'ra-excavation-rock',
        ratebook_item_id: 'rbi-excavation-rock',
        contractor_overhead_id: 'co-delhi',
        analysis_for_quantity: 68,
        uom: 'cum',
    }
];

export const MOCK_RATE_ANALYSIS_COMPONENTS: Omit<RateAnalysisComponent, 'id'>[] = [
    // Components for rbi-excavation-soil
    { rate_analysis_id: 'ra-excavation-soil', component_type: 'machinery', description: 'Shovel 0.50 cum capacity', quantity: 8, uom: 'Hour', rate: 1048.36 },
    { rate_analysis_id: 'ra-excavation-soil', component_type: 'machinery', description: 'Fuel / Energy charges', quantity: 8, uom: 'Hour', rate: 803.71 },
    { rate_analysis_id: 'ra-excavation-soil', component_type: 'labour', description: 'Crew for Shovel', quantity: 8, uom: 'Hour', rate: 369.20 },
    { rate_analysis_id: 'ra-excavation-soil', component_type: 'labour', description: 'work inspector', quantity: 1, uom: 'Day', rate: 775.00 },
    { rate_analysis_id: 'ra-excavation-soil', component_type: 'labour', description: 'mazdoor', quantity: 17, uom: 'Day', rate: 595.00 },
    // Components for rbi-excavation-rock
    { rate_analysis_id: 'ra-excavation-rock', component_type: 'material', description: 'Explosive gel catg (kelvex-220)', quantity: 21.5, uom: 'Kg', rate: 180.00 },
    { rate_analysis_id: 'ra-excavation-rock', component_type: 'material', description: 'Ordinary detonators', quantity: 4, uom: 'Nos', rate: 9.00 },
    { rate_analysis_id: 'ra-excavation-rock', component_type: 'machinery', description: 'Shovel 0.85 cum capacity', quantity: 1.1, uom: 'Hour', rate: 1751.36 },
    { rate_analysis_id: 'ra-excavation-rock', component_type: 'machinery', description: 'Air compressor 8.5 cmm (diesel)', quantity: 6.5, uom: 'Hour', rate: 280.01 },
    { rate_analysis_id: 'ra-excavation-rock', component_type: 'labour', description: 'Crew for Shovel', quantity: 1.1, uom: 'Hour', rate: 369.20 },
    { rate_analysis_id: 'ra-excavation-rock', component_type: 'labour', description: 'Blaster', quantity: 1, uom: 'Day', rate: 780.00 },
    { rate_analysis_id: 'ra-excavation-rock', component_type: 'labour', description: 'mazdoor', quantity: 2, uom: 'Day', rate: 595.00 },
];


export const MOCK_PROJECT_DETAIL: { subprojects: Omit<Subproject, 'id' | 'project_id' | 'items'>[] } = {
    subprojects: [
        { name: 'Foundation Works' },
        { name: 'Canal Excavation' },
    ],
};

// FIX: Add MOCK_COMPARISON_DATA to resolve import error in RatebookComparison component.
export const MOCK_COMPARISON_DATA: RatebookComparisonItem[] = [
  {
    code: 'IRR-CAW-1-2',
    description: 'Excavation in all kinds of soil...',
    uom: 'cum',
    baseRate: 68.50, // Mocked 2024 rate
    targetRate: 74.01, // From MOCK_RATEBOOK_ITEMS
    delta: 5.51,
    deltaPercent: 8.04
  },
  {
    code: 'IRR-CAW-1-6',
    description: 'Excavation in hard rock of all toughness by blasting...',
    uom: 'cum',
    baseRate: 245.20, // Mocked 2024 rate
    targetRate: 238.70, // From MOCK_RATEBOOK_ITEMS
    delta: -6.50,
    deltaPercent: -2.65
  },
  {
      code: 'GEN-MTL-1-1',
      description: 'Structural Steel Supply',
      uom: 'tonne',
      baseRate: 85000.00,
      targetRate: 88500.00,
      delta: 3500,
      deltaPercent: 4.12
  },
  {
      code: 'CON-CST-3-2',
      description: 'Reinforced Cement Concrete M25',
      uom: 'cum',
      baseRate: 6200.00,
      targetRate: 6550.00,
      delta: 350.00,
      deltaPercent: 5.65
  }
];

// New Mock Data for Enhanced Analysis (based on user docs)
export const MOCK_OVERHEADS: Omit<ContractorOverhead, 'id'>[] = [
    { region: 'Delhi', percentage: 13.615 },
    { region: 'Maharashtra', percentage: 15.000 },
];

export const MOCK_SEIGNIORAGE_CHARGES: Omit<SeigniorageCharge, 'id'>[] = [
    { region: 'Delhi', material_category: 'stone', rate: 120, uom: 'cum' },
    { region: 'Delhi', material_category: 'sand', rate: 80, uom: 'cum' },
    { region: 'Delhi', material_category: 'earth', rate: 50, uom: 'cum' },
    { region: 'Maharashtra', material_category: 'stone', rate: 150, uom: 'cum' },
    { region: 'Maharashtra', material_category: 'sand', rate: 100, uom: 'cum' },
    { region: 'Maharashtra', material_category: 'earth', rate: 60, uom: 'cum' },
];

export const MOCK_LOADING_UNLOADING: Omit<LoadingUnloadingCharge, 'id'>[] = [
    // Mechanical
    { region: 'Delhi', material_category: 'earth_sand_murrum', charge_type: 'loading', method: 'mechanical', rate: 60.12, uom: 'cum' },
    { region: 'Delhi', material_category: 'earth_sand_murrum', charge_type: 'unloading', method: 'mechanical', rate: 19.19, uom: 'cum' },
    { region: 'Delhi', material_category: 'rubble_stone_aggregate', charge_type: 'loading', method: 'mechanical', rate: 119.48, uom: 'cum' },
    { region: 'Delhi', material_category: 'rubble_stone_aggregate', charge_type: 'unloading', method: 'mechanical', rate: 19.19, uom: 'cum' },
];

export const MOCK_TRANSPORT_SLABS: Omit<TransportChargeSlab, 'id'>[] = [
    // Lead by Tipper (COM-LDLFT-2) - Earth/Sand
    { region: 'Delhi', transport_type: 'lead', material_category: 'earth_sand_murrum', start_dist: 0, end_dist: 1, rate: 38.00, is_fixed_rate: true },
    { region: 'Delhi', transport_type: 'lead', material_category: 'earth_sand_murrum', start_dist: 1, end_dist: 2, rate: 53.20, is_fixed_rate: true }, // 53.20 - 38.00 = 15.20 for the km
    { region: 'Delhi', transport_type: 'lead', material_category: 'earth_sand_murrum', start_dist: 2, end_dist: 3, rate: 70.93, is_fixed_rate: true },
    { region: 'Delhi', transport_type: 'lead', material_category: 'earth_sand_murrum', start_dist: 3, end_dist: 4, rate: 86.13, is_fixed_rate: true },
    { region: 'Delhi', transport_type: 'lead', material_category: 'earth_sand_murrum', start_dist: 4, end_dist: 5, rate: 101.33, is_fixed_rate: true },
    { region: 'Delhi', transport_type: 'lead', material_category: 'earth_sand_murrum', start_dist: 5, end_dist: 30, rate: 15.20, is_fixed_rate: false }, // For every km beyond 5
    { region: 'Delhi', transport_type: 'lead', material_category: 'earth_sand_murrum', start_dist: 30, end_dist: 999, rate: 12.67, is_fixed_rate: false }, // For every km beyond 30

    // Lift by Head Load (COM-LDLFT-6) - Earth/Sand
    { region: 'Delhi', transport_type: 'lift', material_category: 'earth_sand_murrum', start_dist: 0, end_dist: 3, rate: 0, is_fixed_rate: true }, // Initial lift covered
    { region: 'Delhi', transport_type: 'lift', material_category: 'earth_sand_murrum', start_dist: 3, end_dist: 999, rate: 9.92, is_fixed_rate: false }, // For every 1.00m beyond
];
