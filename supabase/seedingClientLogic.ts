
// This script provides client-side logic to seed sample data for the logged-in user.
// It respects Row Level Security policies and does not require a service key.

import { User } from '@supabase/supabase-js';
import { supabase } from './client';
import { 
  MOCK_FULL_RATEBOOKS, 
  MOCK_RATEBOOK_ITEMS,
  MOCK_RATE_ANALYSES,
  MOCK_RATE_ANALYSIS_COMPONENTS,
  MOCK_PROJECTS, 
  MOCK_PROJECT_DETAIL,
  MOCK_SEIGNIORAGE_CHARGES,
  MOCK_OVERHEADS,
  MOCK_LOADING_UNLOADING,
  MOCK_TRANSPORT_SLABS
} from '../constants';

export async function seedSampleData(user: User) {
  if (!user) throw new Error("User must be logged in to seed data.");

  console.log('Starting to seed sample data for user:', user.id);

  try {
    // 1. Seed Public Charge Data (idempotent using upsert)
    const { error: ohError } = await supabase.from('contractor_overheads').upsert(MOCK_OVERHEADS.map(o => ({...o, id: `co-${o.region.toLowerCase()}`})), { onConflict: 'region' });
    if (ohError) throw new Error(`Overhead seeding failed: ${ohError.message}`);

    const { error: sgError } = await supabase.from('seigniorage_charges').upsert(MOCK_SEIGNIORAGE_CHARGES, { onConflict: 'region,material_category' });
    if (sgError) throw new Error(`Seigniorage charge seeding failed: ${sgError.message}`);

    const { error: luError } = await supabase.from('loading_unloading_charges').upsert(MOCK_LOADING_UNLOADING, { onConflict: 'region,material_category,charge_type,method' });
    if (luError) throw new Error(`Loading/Unloading charge seeding failed: ${luError.message}`);

    const { error: tsError } = await supabase.from('transport_charge_slabs').upsert(MOCK_TRANSPORT_SLABS);
    if (tsError) throw new Error(`Transport slab seeding failed: ${tsError.message}`);
    console.log('Public charges and slabs seeded.');
    
    // 2. Seed Public Ratebooks (if they don't exist)
    const { error: rbError } = await supabase.from('ratebooks').upsert(
      MOCK_FULL_RATEBOOKS.map(rb => ({ ...rb, user_id: null })),
      { onConflict: 'id' }
    );
    if (rbError) throw new Error(`Ratebook seeding failed: ${rbError.message}`);
    console.log(`${MOCK_FULL_RATEBOOKS.length} public ratebooks seeded.`);

    // 3. Seed Public Ratebook Items, Analyses, and Components
    const { error: rbItemsError } = await supabase.from('ratebook_items').upsert(MOCK_RATEBOOK_ITEMS, { onConflict: 'id' });
    if (rbItemsError) throw new Error(`Ratebook item seeding failed: ${rbItemsError.message}`);

    const { error: raError } = await supabase.from('rate_analyses').upsert(MOCK_RATE_ANALYSES, { onConflict: 'ratebook_item_id' });
    if (raError) throw new Error(`Rate analysis seeding failed: ${raError.message}`);
    
    // We delete and re-insert components to ensure consistency with analysis headers
    await supabase.from('rate_analysis_components').delete().in('rate_analysis_id', MOCK_RATE_ANALYSES.map(ra => ra.id));
    const { error: racError } = await supabase.from('rate_analysis_components').insert(MOCK_RATE_ANALYSIS_COMPONENTS);
    if (racError) throw new Error(`Rate analysis component seeding failed: ${racError.message}`);
    console.log('Ratebook items and detailed analyses seeded.');

    // 4. Seed User-Specific Projects
    const projectsToInsert = MOCK_PROJECTS.map(p => ({
      name: p.name,
      region: p.region,
      status: p.status,
      total_cost: p.totalCost,
      ratebook_id: p.ratebook_id,
      user_id: user.id,
    }));
    const { data: seededProjects, error: projectsError } = await supabase.from('projects').insert(projectsToInsert).select();
    if (projectsError) throw new Error(`Project seeding failed: ${projectsError.message}`);
    console.log(`${seededProjects?.length} projects seeded.`);
    
    // 5. Seed Subprojects and BOQ Items for the first project
    const mainProject = seededProjects[0];
    if (mainProject && MOCK_PROJECT_DETAIL.subprojects) {
        for (const sp of MOCK_PROJECT_DETAIL.subprojects) {
            const { data: seededSubproject, error: spError } = await supabase
                .from('subprojects')
                .insert({ name: sp.name, project_id: mainProject.id })
                .select()
                .single();
            if (spError) throw spError;

            // Add a sample BOQ item to the subproject
             if (sp.name.includes("Excavation")) {
                const boqItemsToInsert = [
                    { subproject_id: seededSubproject.id, ratebook_item_id: 'rbi-excavation-soil', quantity: 2500, total_lead_km: 5, total_lift_m: 6 },
                    { subproject_id: seededSubproject.id, ratebook_item_id: 'rbi-excavation-rock', quantity: 800, total_lead_km: 5, total_lift_m: 6 },
                ];
                const { error: boqError } = await supabase.from('boq_items').insert(boqItemsToInsert);
                if (boqError) throw boqError;
             }
        }
        console.log(`Subprojects and BOQ items for '${mainProject.name}' seeded.`);
    }

    console.log('Sample data seeding complete!');

  } catch (error) {
    console.error("Client-side seeding failed:", error);
    throw error;
  }
}
