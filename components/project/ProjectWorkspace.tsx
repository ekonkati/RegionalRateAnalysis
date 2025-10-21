import React, { useState, useEffect, useCallback } from 'react';
import { Project, Subproject, BOQItem, RatebookDetail, Organization, CalculationResult } from '../../types';
import ProjectHeader from './ProjectHeader';
import SubprojectList from './SubprojectList';
import BOQTable from './BOQTable';
import AddItemModal from './AddItemModal';
import { supabase } from '../../supabase/client';
import { User } from '@supabase/user-js';
import RateBreakdownDrawer from './RateBreakdownDrawer';

interface ProjectWorkspaceProps {
  project: Project;
  onBack: () => void;
  user: User;
  org: Organization;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ project, onBack, user, org }) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [subprojects, setSubprojects] = useState<Subproject[]>([]);
  const [selectedSubproject, setSelectedSubproject] = useState<Subproject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<{ item: BOQItem; result: CalculationResult } | null>(null);


  const fetchProjectDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subprojects')
        .select(`*, boq_items (*, ratebook_details (*))`)
        .eq('project_id', project.id);

      if (error) throw error;
      
      const formattedSubprojects = data.map((sp: any) => ({
        ...sp,
        items: sp.boq_items.map((bi: any) => ({
            ...bi,
            ratebook_detail: bi.ratebook_details
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
  }, [project.id]);

  useEffect(() => {
    setCurrentProject(project);
    fetchProjectDetails();
  }, [project, fetchProjectDetails]);

  const handleSelectSubproject = (subproject: Subproject) => {
    setSelectedSubproject(subproject);
  };
  
  const handleSelectItemForBreakdown = (item: BOQItem, result: CalculationResult) => {
    setBreakdownData({ item, result });
    setIsDrawerOpen(true);
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

  const handleAddItem = async (item: RatebookDetail, quantity: number) => {
    if (!selectedSubproject) return;
    
    const { data: newBoqItem, error } = await supabase.from('boq_items').insert({
      subproject_id: selectedSubproject.id,
      ratebook_detail_id: item.id,
      quantity,
    }).select(`*, ratebook_details (*)`).single();

    if (error) {
      alert("Error adding item: " + error.message);
      return;
    }

    const formattedItem: BOQItem = {
      ...newBoqItem,
      ratebook_detail: newBoqItem.ratebook_details
    };
    
    const updatedSubproject = {
      ...selectedSubproject,
      items: [...(selectedSubproject.items || []), formattedItem],
    };
    
    setSelectedSubproject(updatedSubproject);
    setSubprojects(prev => prev.map(sp => sp.id === updatedSubproject.id ? updatedSubproject : sp));
  };

  return (
    <div className="h-full flex flex-col relative">
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
              project={currentProject}
              onSelectItemForBreakdown={handleSelectItemForBreakdown}
              onAddItemClick={() => setIsAddItemModalOpen(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>This project has no sub-projects. Click 'Add Sub-Project' to get started.</p>
            </div>
          )}
        </main>
      </div>

       <RateBreakdownDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={breakdownData}
       />

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
