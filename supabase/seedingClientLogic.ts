// This script provides client-side logic to seed sample data for the logged-in user.
// It respects Row Level Security policies and does not require a service key.

import { User } from '@supabase/supabase-js';
import { supabase } from './client';
import { 
  MOCK_REGIONS,
  MOCK_RATEBOOKS,
  MOCK_RATEBOOK_DETAILS,
  MOCK_PROJECTS,
  MOCK_SUBPROJECTS,
  MOCK_GLOSSARY
} from '../constants';
import { Organization, Region, Ratebook, RatebookDetail, Subproject } from '../types';

export async function seedSampleData(user: User, org: Organization) {
  if (!user || !org) throw new Error("User and Organization must be available to seed data.");

  console.log(`Starting to seed sample data for org: ${org.id}`);

  try {
    // 1. Seed Public/Base Regions (idempotent using upsert)
    const { data: regions, error: regionError } = await supabase.from('regions').upsert(MOCK_REGIONS).select();
    if (regionError) throw new Error(`Region seeding failed: ${regionError.message}`);
    const cpwdRegion = regions.find(r => r.short_code === 'CPWD') as Region;
    console.log(`${regions.length} regions seeded.`);

    // 2. Seed Public CPWD Ratebook (if it doesn't exist)
    const { data: ratebook, error: rbError } = await supabase.from('ratebooks').upsert({
        ...MOCK_RATEBOOKS[0],
        region_id: cpwdRegion.id,
    }).select().single();
    if (rbError) throw new Error(`Ratebook seeding failed: ${rbError.message}`);
    console.log(`'${ratebook.name}' seeded.`);

    // 3. Seed Public Ratebook Details
    const detailsToInsert = MOCK_RATEBOOK_DETAILS.map(d => ({...d, ratebook_id: ratebook.id}));
    const { data: details, error: rbDetailsError } = await supabase.from('ratebook_details').upsert(detailsToInsert, { onConflict: 'ratebook_id,code' }).select();
    if (rbDetailsError) throw new Error(`Ratebook details seeding failed: ${rbDetailsError.message}`);
    console.log(`${details.length} ratebook details seeded.`);

    // 4. Seed Public Glossary
    const { error: glossaryError } = await supabase.from('glossary').upsert(MOCK_GLOSSARY, { onConflict: 'org_id,term' });
    if (glossaryError) throw new Error(`Glossary seeding failed: ${glossaryError.message}`);
    console.log('Glossary seeded.');

    // 5. Seed User's First Project
    const mhRegion = regions.find(r => r.short_code === 'MH') as Region;
    const projectToInsert = {
        ...MOCK_PROJECTS[0],
        org_id: org.id,
        region_id: mhRegion.id,
        ratebook_id: ratebook.id
    };
    const { data: seededProject, error: projectError } = await supabase.from('projects').insert(projectToInsert).select().single();
    if (projectError) throw new Error(`Project seeding failed: ${projectError.message}`);
    console.log(`Project '${seededProject.name}' seeded.`);

    // 6. Seed Subprojects for the new project
    const subprojectsToInsert = MOCK_SUBPROJECTS.map(sp => ({ ...sp, project_id: seededProject.id }));
    const { data: seededSubprojects, error: spError } = await supabase.from('subprojects').insert(subprojectsToInsert).select();
    if (spError) throw new Error(`Subproject seeding failed: ${spError.message}`);
    console.log(`${seededSubprojects.length} subprojects seeded.`);

    // 7. Seed BOQ items for the first subproject
    const firstSubproject = seededSubprojects[0] as Subproject;
    const earthworkDetail = details.find(d => d.code === '0114') as RatebookDetail;
    const concreteDetail = details.find(d => d.code === '0221') as RatebookDetail;

    if(firstSubproject && earthworkDetail && concreteDetail) {
      const boqItemsToInsert = [
        { subproject_id: firstSubproject.id, ratebook_detail_id: earthworkDetail.id, quantity: 1500 },
        { subproject_id: firstSubproject.id, ratebook_detail_id: concreteDetail.id, quantity: 350 },
      ];
      const { error: boqError } = await supabase.from('boq_items').insert(boqItemsToInsert);
      if (boqError) throw new Error(`BOQ item seeding failed: ${boqError.message}`);
      console.log('BOQ items seeded.');
    }
    
    console.log('Sample data seeding complete!');

  } catch (error) {
    console.error("Client-side seeding failed:", error);
    throw error;
  }
}
