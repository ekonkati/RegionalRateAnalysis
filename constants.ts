
import {
  Project,
  Ratebook,
  RatebookDetail,
  Glossary,
  Subproject,
  BOQItem,
  DashboardOverviewData,
  Region,
  Organization,
  UserOrg,
  Subscription,
  // FIX: Import RatebookComparisonItem for mock data typing
  RatebookComparisonItem
} from './types';

// SVG Icons (unchanged, but kept for use)
export const ICONS = {
  DASHBOARD: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  RATEBOOKS: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  PROJECTS: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z',
  ANALYTICS: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V7h2v10zm-4 0H8V10h2v7zm8-4h-2v-3h2v3z',
  ADMIN: 'M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61-.22l2.49-1c.52.4 1.08.73 1.69.98l-.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l-.38-2.65c.61-.25 1.17-.59-1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z',
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

// --- Mock Data for Seeding ---

export const MOCK_REGIONS: Omit<Region, 'id'>[] = [
  { name: 'CPWD Base', short_code: 'CPWD', country: 'India', base_factor_labour: 1.0, base_factor_material: 1.0, base_factor_machinery: 1.0, base_factor_carriage: 1.0, currency_symbol: '₹', locale: 'en-IN' },
  { name: 'Maharashtra', short_code: 'MH', country: 'India', base_factor_labour: 1.1, base_factor_material: 1.05, base_factor_machinery: 1.08, base_factor_carriage: 1.12, currency_symbol: '₹', locale: 'mr-IN' },
  { name: 'Telangana', short_code: 'TG', country: 'India', base_factor_labour: 1.08, base_factor_material: 1.03, base_factor_machinery: 1.06, base_factor_carriage: 1.10, currency_symbol: '₹', locale: 'te-IN' },
];

export const MOCK_RATEBOOKS: Omit<Ratebook, 'id' | 'region_id'>[] = [
  {
    name: 'CPWD Schedule of Rates 2024',
    year: 2024,
    effective_date: '2024-04-01',
    source_type: 'upload',
    status: 'published'
  }
];

export const MOCK_RATEBOOK_DETAILS: Omit<RatebookDetail, 'id' | 'ratebook_id'>[] = [
    {
        code: '0114',
        description_en: 'Earthwork excavation up to 3 m depth in all soil.',
        description_local: 'मिट्टी की खुदाई',
        lang_code: 'hi',
        uom: 'cum',
        category: 'composite',
        base_rate: 138.07,
        mapped_cpwd_code: '0114'
    },
    {
        code: '0221',
        description_en: 'Providing and laying in position plain cement concrete of specified grade excluding the cost of centering and shuttering - All work up to plinth level.',
        description_local: 'सादा सीमेंट कंक्रीट',
        lang_code: 'hi',
        uom: 'cum',
        // FIX: The type 'concrete' was added to ItemCategory in types.ts
        category: 'concrete',
        base_rate: 8339.85,
        mapped_cpwd_code: '0221'
    }
];

export const MOCK_PROJECTS: Omit<Project, 'id' | 'org_id' | 'region_id' | 'ratebook_id' | 'last_updated'>[] = [
  {
    name: 'Metro Building Phase 1',
    description: 'Commercial building construction in Mumbai.',
    project_type: 'building',
    water_pct: 1.0,
    gst_factor: 0.2127,
    cpoh_pct: 15.0,
    cess_pct: 1.0,
    language: 'mr',
    status: 'active'
  }
];

export const MOCK_SUBPROJECTS: Omit<Subproject, 'id' | 'project_id'>[] = [
    { name: 'Foundation Works' },
    { name: 'Superstructure Works' }
];

export const MOCK_GLOSSARY: Omit<Glossary, 'id'>[] = [
    {
        term: 'Earthwork',
        category: 'Civil',
        en: 'Earthwork',
        hi: 'मिट्टी का काम',
        te: 'మట్టిపని',
        mr: 'मातीकाम'
    },
    {
        term: 'Excavation',
        category: 'Civil',
        en: 'Excavation',
        hi: 'खुदाई',
        te: 'తవ్వకం',
        mr: 'उत्खनन'
    }
];

export const MOCK_DASHBOARD_DATA: DashboardOverviewData = {
  activeProjects: { count: 1, limit: 5 },
  latestRatebook: 'CPWD DSR 2024',
  exportsThisWeek: 3,
  plan: 'free',
};

// FIX: Add missing mock data for RatebookComparison component
export const MOCK_COMPARISON_DATA: RatebookComparisonItem[] = [
  { code: '0114', description: 'Earthwork excavation up to 3 m depth in all soil.', baseRate: 138.07, targetRate: 145.50, delta: 7.43, deltaPercent: 5.38 },
  { code: '0221', description: 'Providing and laying in position plain cement concrete...', baseRate: 8339.85, targetRate: 8100.00, delta: -239.85, deltaPercent: -2.88 },
  { code: '0432', description: 'Reinforcement for R.C.C. work including straightening, cutting...', baseRate: 9850.00, targetRate: 10200.00, delta: 350.00, deltaPercent: 3.55 },
  { code: '1120', description: '12 mm cement plaster of mix 1:6 (1 cement: 6 coarse sand)', baseRate: 230.15, targetRate: 240.00, delta: 9.85, deltaPercent: 4.28 },
];
