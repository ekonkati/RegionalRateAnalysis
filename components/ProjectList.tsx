import React from 'react';
import { Project, ProjectStatus } from '../types';
import Icon from './Icon';
import { ICONS } from '../constants';
import { supabase } from '../supabase/client';

interface ProjectListProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  isLoading: boolean;
  onRefresh: () => void;
  isStandalonePage?: boolean;
}

const getStatusChipClass = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.Active:
      return 'bg-green-100 text-green-800';
    case ProjectStatus.Archived:
      return 'bg-slate-100 text-slate-800';
    case ProjectStatus.Planning:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectSelect, isLoading, onRefresh, isStandalonePage = false }) => {
  
  const handleNewProject = async () => {
    // A real app would open a modal to get project details.
    // For now, creating a default project.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to create a project.");
      return;
    }

    const { error } = await supabase.from('projects').insert({
      name: 'New Untitled Project',
      region: 'Unspecified',
      // This is just a placeholder, in a real app user would select a ratebook
      ratebook_id: 'rb-cpwd-2025', 
      user_id: user.id
    });

    if (error) {
      alert(`Error creating project: ${error.message}`);
    } else {
      onRefresh(); // Refresh the list to show the new project
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{isStandalonePage ? 'All Projects' : 'Recent Projects'}</h2>
          <p className="text-sm text-slate-500">{isStandalonePage ? 'Manage all your projects' : 'Quick access to your latest work'}</p>
        </div>
        <button 
          onClick={handleNewProject}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors">
          <Icon path={ICONS.PLUS} className="w-4 h-4"/>
          <span>New Project</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Project Name</th>
              <th scope="col" className="px-6 py-3">Region</th>
              <th scope="col" className="px-6 py-3">Ratebook</th>
              <th scope="col" className="px-6 py-3">Last Updated</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800 mx-auto"></div>
                  <p className="mt-2 text-slate-500">Loading Projects...</p>
                </td>
              </tr>
            ) : projects.length === 0 ? (
               <tr>
                <td colSpan={6} className="text-center p-8 text-slate-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => onProjectSelect(project)}>
                  <td className="px-6 py-4 font-semibold text-slate-900">{project.name}</td>
                  <td className="px-6 py-4">{project.region}</td>
                  <td className="px-6 py-4">{project.ratebooks?.name || 'N/A'}</td>
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
