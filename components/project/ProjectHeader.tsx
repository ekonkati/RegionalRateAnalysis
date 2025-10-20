import React from 'react';
import { Project } from '../../types';
import Icon from '../Icon';
import { ICONS } from '../../constants';

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBack }) => {
  return (
    <header className="h-20 bg-white items-center border-b flex-shrink-0 px-4 md:px-6 lg:px-8 flex justify-between">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800">
          &larr; Back
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{project.name}</h1>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>{project.region}</span>
            <span className="text-slate-300">|</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{project.ratebooks?.name || '...'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
          <Icon path={ICONS.EXPORTS} className="w-4 h-4" />
          <span>Export</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors">
          <Icon path={ICONS.SNAPSHOT} className="w-4 h-4" />
          <span>Snapshot</span>
        </button>
      </div>
    </header>
  );
};

export default ProjectHeader;
