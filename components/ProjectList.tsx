import React from 'react';
import { Project, ProjectStatus } from '../types';
import Icon from './Icon';
import { ICONS } from '../constants';
import { supabase } from '../supabase/client';
import { useTranslation } from 'react-i18next';

interface ProjectListProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  isLoading: boolean;
  onRefresh: () => void;
  isStandalonePage?: boolean;
}

const getStatusChipClass = (status: ProjectStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'archived':
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectSelect, isLoading, onRefresh, isStandalonePage = false }) => {
  const { t } = useTranslation();
  
  const handleNewProject = async () => {
    // In a real app, this would open a multi-step wizard (as per Design Doc #6).
    // For now, creating a default project in the current org.
    alert("This would open the 'New Project' wizard.");
    // The wizard would then collect details and call the insert method.
    // The RLS policy ensures it's created in the correct org.
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{isStandalonePage ? `All ${t('projects')}` : `Recent ${t('projects')}`}</h2>
          <p className="text-sm text-slate-500">{isStandalonePage ? 'Manage all your projects' : 'Quick access to your latest work'}</p>
        </div>
        <button 
          onClick={handleNewProject}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors">
          <Icon path={ICONS.PLUS} className="w-4 h-4"/>
          <span>{t('new_project')}</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Project Name</th>
              <th scope="col" className="px-6 py-3">Ratebook</th>
              <th scope="col" className="px-6 py-3">Last Updated</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800 mx-auto"></div>
                  <p className="mt-2 text-slate-500">Loading Projects...</p>
                </td>
              </tr>
            ) : projects.length === 0 ? (
               <tr>
                <td colSpan={5} className="text-center p-8 text-slate-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => onProjectSelect(project)}>
                  <td className="px-6 py-4 font-semibold text-slate-900">{project.name}</td>
                  <td className="px-6 py-4">{project.ratebook?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{new Date(project.last_updated).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChipClass(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); /* handle action */ }} className="p-2 rounded-full hover:bg-slate-200">
                      <Icon path={ICONS.DOTS_VERTICAL} className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;
