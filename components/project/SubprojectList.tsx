import React from 'react';
import { Subproject } from '../../types';
import Icon from '../Icon';
import { ICONS } from '../../constants';

interface SubprojectListProps {
  subprojects: Subproject[];
  selectedSubprojectId: string | null;
  onSelectSubproject: (subproject: Subproject) => void;
  onAddSubproject: () => void;
}

const SubprojectList: React.FC<SubprojectListProps> = ({ subprojects, selectedSubprojectId, onSelectSubproject, onAddSubproject }) => {
  return (
    <div className="w-72 bg-white border-r flex-shrink-0 flex flex-col">
      <div className="h-20 flex items-center justify-between px-4 border-b">
        <h2 className="text-md font-bold text-slate-800">Sub-Projects</h2>
        <button onClick={onAddSubproject} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <Icon path={ICONS.PLUS} className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {subprojects.map((subproject) => (
          <button
            key={subproject.id}
            onClick={() => onSelectSubproject(subproject)}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              selectedSubprojectId === subproject.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {subproject.name}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t text-center">
        <p className="text-xs text-slate-400">
            {subprojects.length} sub-projects loaded.
        </p>
      </div>
    </div>
  );
};

export default SubprojectList;