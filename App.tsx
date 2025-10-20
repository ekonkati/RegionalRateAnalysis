import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Projects from './components/ProjectList';
import Ratebooks from './components/Ratebooks';
import Admin from './components/Admin';
import LoginPage from './components/auth/LoginPage';
import ProjectWorkspace from './components/project/ProjectWorkspace';
import { Project } from './types';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { Session, User } from '@supabase/supabase-js';
import SupabaseConfig from './components/auth/SupabaseConfig';

export type View = 'Dashboard' | 'Ratebooks' | 'Projects' | 'Analytics' | 'Admin' | 'ProjectWorkspace';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(
        ({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        },
        (error) => {
          console.error("Failed to get Supabase session:", error);
          setConfigError("Connection failed. Please double-check your Supabase URL and Anon Key.");
          setIsLoading(false);
        }
      );

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // If auth state changes, it means connection is working, so clear any config error.
        if (configError) setConfigError(null);
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [configError]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveView('ProjectWorkspace');
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setActiveView('Dashboard');
  };

  const renderView = () => {
    if (!user) return <Dashboard onProjectSelect={handleProjectSelect} user={null} />;

    switch (activeView) {
      case 'Dashboard':
        return <Dashboard onProjectSelect={handleProjectSelect} user={user} />;
      case 'Ratebooks':
        return <Ratebooks user={user} />;
      case 'Projects':
        // This view should probably fetch its own projects list
        return <Projects onProjectSelect={handleProjectSelect} isStandalonePage={true} projects={[]} isLoading={false} onRefresh={() => {}} />;
      case 'Admin':
        return <Admin />;
      case 'ProjectWorkspace':
        if (selectedProject) {
          return <ProjectWorkspace project={selectedProject} onBack={handleBackToDashboard} user={user} />;
        }
        return <Dashboard onProjectSelect={handleProjectSelect} user={user} />; 
      case 'Analytics':
        return <div className="p-8"><h1 className="text-2xl font-bold">Analytics (Coming Soon)</h1></div>;
      default:
        return <Dashboard onProjectSelect={handleProjectSelect} user={user} />;
    }
  };

  if (!isSupabaseConfigured || configError) {
    return <SupabaseConfig error={configError} />;
  }

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div></div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onNav={() => setSelectedProject(null)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
