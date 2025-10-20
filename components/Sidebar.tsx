import React from 'react';
import Icon from './Icon';
import { ICONS } from '../constants';
import { View } from '../App';

const NAV_ITEMS: { name: View; icon: string }[] = [
  { name: 'Dashboard', icon: ICONS.DASHBOARD },
  { name: 'Ratebooks', icon: ICONS.RATEBOOKS },
  { name: 'Projects', icon: ICONS.PROJECTS },
  { name: 'Analytics', icon: ICONS.ANALYTICS },
  { name: 'Admin', icon: ICONS.ADMIN },
];

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    onNav: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onNav }) => {

  const handleNavClick = (view: View) => {
    setActiveView(view);
    onNav();
  }

  return (
    <div className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-center h-20 border-b">
            <Icon path={ICONS.LOGO} className="h-8 w-8 text-slate-800" />
            <h1 className="text-xl font-bold ml-2 text-slate-800">RateMaster</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            {NAV_ITEMS.map((item) => (
            <button
                key={item.name}
                onClick={() => handleNavClick(item.name)}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${
                activeView === item.name
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
                <Icon path={item.icon} className="w-5 h-5 mr-3" />
                {item.name}
            </button>
            ))}
      </nav>
      <div className="p-4 border-t">
        <div className="p-4 bg-slate-100 rounded-lg text-center">
            <h3 className="font-bold text-slate-800">Upgrade to Pro</h3>
            <p className="text-xs text-slate-500 mt-1">Unlock analytics, unlimited projects & bilingual exports.</p>
            <button className="mt-4 w-full bg-slate-800 text-white text-sm py-2 rounded-lg hover:bg-slate-900 transition-colors">
                Upgrade Now
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;