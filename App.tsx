import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Projects from './components/ProjectList';
import Ratebooks from './components/Ratebooks';
import Admin from './components/Admin';
import LoginPage from './components/auth/LoginPage';
import ProjectWorkspace from './components/project/ProjectWorkspace';
import { Project, Organization } from './types';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

export type View = 'Dashboard' | 'Ratebooks' | 'Projects' | 'Analytics' | 'Admin' | 'ProjectWorkspace';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // FIX: Add state for standalone projects view
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);


  const fetchAllProjects = useCallback(async () => {
      if (!currentOrg) return;
      setIsProjectsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`*, ratebook:ratebook_id ( id, name, year )`)
        .eq('org_id', currentOrg.id)
        .order('last_updated', { ascending: false });
      
      if (error) {
          console.error(error);
      } else {
          setProjects(data || []);
      }
      setIsProjectsLoading(false);
  }, [currentOrg]);

  useEffect(() => {
    if (activeView === 'Projects') {
        fetchAllProjects();
    }
  }, [activeView, fetchAllProjects]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(
        async ({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            // Fetch user's organizations and set the first one as active
            const { data: orgs, error } = await supabase
              .from('user_orgs')
              .select('organizations(*)')
              .eq('user_id', session.user.id)
              .limit(1);

            if (error) throw error;
            
            if (orgs && orgs.length > 0) {
              const activeOrg = orgs[0].organizations as Organization;
              setCurrentOrg(activeOrg);
              // Set the org context for RLS policies in the database session
              await supabase.rpc('set_config_for_org', { org_id_to_set: activeOrg.id });
            }
          }
          setIsLoading(false);
        }
      );

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
            const { data: orgs } = await supabase
              .from('user_orgs')
              .select('organizations(*)')
              .eq('user_id', session.user.id)
              .limit(1);
            if (orgs && orgs.length > 0) {
              const activeOrg = orgs[0].organizations as Organization;
              setCurrentOrg(activeOrg);
              await supabase.rpc('set_config_for_org', { org_id_to_set: activeOrg.id });
            }
        } else {
            setCurrentOrg(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveView('ProjectWorkspace');
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setActiveView('Dashboard');
  };

  const renderView = () => {
    if (!user || !currentOrg) {
        // Fallback for public/logged-out views if any
        return <Dashboard onProjectSelect={handleProjectSelect} user={null} org={null} />;
    }

    switch (activeView) {
      case 'Dashboard':
        return <Dashboard onProjectSelect={handleProjectSelect} user={user} org={currentOrg} />;
      case 'Ratebooks':
        // FIX: Pass the required 'org' prop to the Ratebooks component.
        return <Ratebooks user={user} org={currentOrg} />;
      case 'Projects':
        // FIX: Pass all required props for the standalone ProjectList view.
        return <Projects projects={projects} isLoading={isProjectsLoading} onRefresh={fetchAllProjects} onProjectSelect={handleProjectSelect} isStandalonePage={true} />;
      case 'Admin':
        return <Admin org={currentOrg} />;
      case 'ProjectWorkspace':
        if (selectedProject) {
          return <ProjectWorkspace project={selectedProject} onBack={handleBackToDashboard} user={user} org={currentOrg} />;
        }
        // Fallback to dashboard if no project is selected
        return <Dashboard onProjectSelect={handleProjectSelect} user={user} org={currentOrg} />; 
      case 'Analytics':
        return <div className="p-8"><h1 className="text-2xl font-bold">Analytics (Coming Soon)</h1></div>;
      default:
        return <Dashboard onProjectSelect={handleProjectSelect} user={user} org={currentOrg} />;
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-red-50 text-red-700 p-8 rounded-lg shadow-md">
            <h1 className="text-xl font-bold">Supabase Not Configured</h1>
            <p className="mt-2">Please add your Supabase URL and Anon Key to the <code className="bg-red-200 px-1 rounded">supabase/client.ts</code> file.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div></div>;
  }

  if (!session) {
    return <LoginPage />;
  }
  
  if (!currentOrg && !isLoading) {
     return <div className="h-screen w-full flex items-center justify-center">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
         <p className="mt-4 text-slate-600">Loading your organization...</p>
         <p className="text-sm text-slate-400">If this persists, you may not be part of an organization.</p>
       </div>
     </div>;
  }

  return (
    <I18nextProvider i18n={i18n}>
        <div className="h-screen w-full bg-slate-50 flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} onNav={() => setSelectedProject(null)} />
        <div className="flex-1 flex flex-col overflow-hidden">
            <Header user={user} org={currentOrg} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
            {renderView()}
            </main>
        </div>
        </div>
    </I18nextProvider>
  );
};

export default App;