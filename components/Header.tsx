import React from 'react';
import Icon from './Icon';
import { ICONS } from '../constants';
import { supabase } from '../supabase/client';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <header className="h-20 bg-white border-b flex-shrink-0 px-4 md:px-6 lg:px-8 flex justify-between items-center">
      {/* Search Bar */}
      <div className="relative">
        <Icon path={ICONS.SEARCH} className="w-5 h-5 absolute text-slate-400 left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search projects, ratebooks..."
          className="pl-12 pr-4 py-2.5 w-full md:w-80 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white"
        />
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
          <Icon path={ICONS.BELL} className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
            {userInitial}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">{user?.email}</p>
            <p className="text-xs text-slate-500">User</p>
          </div>
          <button onClick={handleSignOut} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="Sign Out">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 101.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
