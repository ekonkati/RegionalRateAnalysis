
import React, { useState, useEffect, useCallback } from 'react';
import { Project, Subproject, BOQItem, RatebookDetailItem, FullCharges, ContractorOverhead, SeigniorageCharge, LoadingUnloadingCharge, TransportChargeSlab } from '../../types';
import ProjectHeader from './ProjectHeader';
import SubprojectList from './SubprojectList';
import BOQTable from './BOQTable';
import RateExplanationModal from '../RateExplanationModal';
import AddItemModal from './AddItemModal';
import { supabase } from '../../supabase/client';
import { User } from '@supabase/user-js';

interface ProjectWorkspaceProps {
  project: Project;
  onBack: () => void;
  user: User;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ project, onBack, user }) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [subprojects, setSubprojects] = useState<Subproject[]>([]);
  const [selectedSubproject, setSelectedSubproject] = useState<Subproject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [charges, setCharges] = useState<FullCharges>({ overheads: [], seigniorage: [], loadingUnloading: [], transportSlabs: [] });
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemToExplain, setItemToExplain] = useState<BOQItem | null>(null);

  const fetchProjectDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all required data in parallel
      const [subprojectsRes, overheadsRes, seigniorageRes, loadingUnloadingRes, transportSlabsRes] = await Promise.all([
        supabase
          .from('subprojects')
          .select(`*, boq_items (*, ratebook_items (*, rate_analyses (*, contractor_overheads(*), rate_analysis_components(*))))`)
          .eq('project_id', project.id),
        supabase.from('contractor_overheads').select('*').eq('region', project.region),
        supabase.from('seigniorage_charges').select('*').eq('region', project.region),
        supabase.from('loading_unloading_charges').select('*').eq('region', project.region),
        supabase.from('transport_charge_slabs').select('*').eq('region', project.region)
      ]);

      if (subprojectsRes.error) throw subprojectsRes.error;
      if (overheadsRes.error) throw overheadsRes.error;
      if (seigniorageRes.error) throw seigniorageRes.error;
      if (loadingUnloadingRes.error) throw loadingUnloadingRes.error;
      if (transportSlabsRes.error) throw transportSlabsRes.error;

      setCharges({
        overheads: overheadsRes.data as ContractorOverhead[],
        seigniorage: seigniorageRes.data as SeigniorageCharge[],
        loadingUnloading: loadingUnloadingRes.data as LoadingUnloadingCharge[],
        transportSlabs: transportSlabsRes.data as TransportChargeSlab[]
      });

      const formattedSubprojects = subprojectsRes.data.map((sp: any) => ({
        id: sp.id,
        project_id: sp.project_id,
        name: sp.name,
        items: sp.boq_items.map((bi: any) => ({
          ...bi.ratebook_items,
          rate: bi.ratebook_items.base_rate, // Use base_rate from SOR
          id: bi.id,
          ratebook_item_id: bi.ratebook_item_id,
          quantity: bi.quantity,
          total_lead_km: bi.total_lead_km,
          total_lift_m: bi.total_lift_m,
          // The 'amount' will be recalculated in BOQTable to include all charges
          amount: bi.quantity * bi.ratebook_items.base_rate, 
          rate_analyses: bi.ratebook_items.rate_analyses ? { // Restructure nested analysis data
            ...bi.ratebook_items.rate_analyses,
            contractor_overheads: bi.ratebook_items.rate_analyses.contractor_overheads,
            components: bi.ratebook_items.rate_analyses.rate_analysis_components
          } : null,
        }))
      }));

      setSubprojects(formattedSubprojects);
      if (formattedSubprojects.length > 0) {
        setSelectedSubproject(formattedSubprojects[0]);
      }

    } catch (err) {
      console.error("Failed to fetch project details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [project.id, project.region]);

  useEffect(() => {
    setCurrentProject(project);
    fetchProjectDetails();
  }, [project, fetchProjectDetails]);

  const handleSelectSubproject = (subproject: Subproject) => {
    setSelectedSubproject(subproject);
  };
  
  const handleExplainRate = (item: BOQItem) => {
    setItemToExplain(item);
    setIsExplainModalOpen(true);
  };
  
  const handleAddSubproject = async () => {
    const name = prompt("Enter new sub-project name:");
    if (name) {
      const { data, error } = await supabase
        .from('subprojects')
        .insert({ name, project_id: currentProject.id })
        .select()
        .single();
      
      if (error) {
        alert("Error adding sub-project.");
      } else {
        setSubprojects(prev => [...prev, { ...data, items: [] }]);
      }
    }
  };

  const handleAddItem = async (item: RatebookDetailItem, quantity: number) => {
    if (!selectedSubproject) return;
    
    // In a real app, you might want a modal to ask for lead/lift overrides
    const { data: newBoqItem, error } = await supabase.from('boq_items').insert({
      subproject_id: selectedSubproject.id,
      ratebook_item_id: item.id,
      quantity,
    }).select(`*, ratebook_items(*, rate_analyses(*, contractor_overheads(*), rate_analysis_components(*)))`).single();

    if (error) {
      alert("Error adding item");
      return;
    }

    const formattedItem: BOQItem = {
      ...newBoqItem.ratebook_items,
      id: newBoqItem.id,
      ratebook_item_id: newBoqItem.ratebook_item_id,
      quantity: newBoqItem.quantity,
      rate: newBoqItem.ratebook_items.base_rate,
      amount: newBoqItem.quantity * newBoqItem.ratebook_items.base_rate,
      total_lead_km: newBoqItem.total_lead_km,
      total_lift_m: newBoqItem.total_lift_m,
      rate_analyses: newBoqItem.ratebook_items.rate_analyses ? {
          ...newBoqItem.ratebook_items.rate_analyses,
          contractor_overheads: newBoqItem.ratebook_items.rate_analyses.contractor_overheads,
          components: newBoqItem.ratebook_items.rate_analyses.rate_analysis_components
      } : null,
    };
    
    const updatedSubproject = {
      ...selectedSubproject,
      items: [...selectedSubproject.items, formattedItem],
    };
    
    setSelectedSubproject(updatedSubproject);
    setSubprojects(prev => prev.map(sp => sp.id === updatedSubproject.id ? updatedSubproject : sp));
  };

  return (
    <div className="h-full flex flex-col">
      <ProjectHeader project={currentProject} onBack={onBack} />
      <div className="flex-1 flex overflow-hidden">
        <SubprojectList
          subprojects={subprojects}
          selectedSubprojectId={selectedSubproject?.id || null}
          onSelectSubproject={handleSelectSubproject}
          onAddSubproject={handleAddSubproject}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div></div>
          ) : selectedSubproject ? (
            <BOQTable 
              subproject={selectedSubproject} 
              onExplainRate={handleExplainRate} 
              onAddItemClick={() => setIsAddItemModalOpen(true)}
              charges={charges}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>This project has no sub-projects. Click 'Add Sub-Project' to get started.</p>
            </div>
          )}
        </main>
      </div>
      
      {itemToExplain && (
        <RateExplanationModal
          isOpen={isExplainModalOpen}
          onClose={() => setIsExplainModalOpen(false)}
          item={itemToExplain}
          project={currentProject}
          charges={charges}
        />
      )}

      {isAddItemModalOpen && currentProject.ratebook_id && (
        <AddItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onAddItem={handleAddItem}
          ratebookId={currentProject.ratebook_id}
        />
      )}
    </div>
  );
};

export default ProjectWorkspace;
