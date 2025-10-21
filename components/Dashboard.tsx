import React, { useState, useEffect, useCallback } from 'react';
import OverviewCards from './OverviewCards';
import ProjectList from './ProjectList';
import { MOCK_DASHBOARD_DATA } from '../constants';
import { DashboardOverviewData, Project, Organization } from '../types';
import { supabase } from '../supabase/client';
import { User } from '@supabase/supabase-js';
import { seedSampleData } from '../supabase/seedingClientLogic';
import Icon from './Icon';
import { ICONS } from '../constants';
import DatabaseSchemaSetup from './DatabaseSchemaSetup';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
  user: User | null;
  org: Organization | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onProjectSelect, user, org }) => {
  const { t } = useTranslation();
  const [overviewData, setOverviewData] = useState<DashboardOverviewData>(MOCK_DASHBOARD_DATA);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaNeeded, setSchemaNeeded] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user || !org) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          ratebook:ratebook_id ( id, name, year )
        `)
        .eq('org_id', org.id)
        .order('last_updated', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setProjects(data || []);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      if (err.code === '42P01') {
          setSchemaNeeded(true);
      } else {
          setError("Could not load your projects. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, org]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSeedData = async () => {
    if (!user || !org) return;
    setIsSeeding(true);
    setError(null);
    try {
      await seedSampleData(user, org);
      await fetchProjects(); // Refresh the project list after seeding
    } catch (err: any) {
        setError(`Failed to seed data: ${err.message}`);
    } finally {
        setIsSeeding(false);
    }
  }

  if (schemaNeeded) {
    return <DatabaseSchemaSetup />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{t('dashboard')}</h1>
        <p className="text-slate-500 mt-1">{t('welcome_back')}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-semibold">An Error Occurred</p>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && projects.length === 0 && !schemaNeeded && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Icon path={ICONS.PROJECTS} className="w-12 h-12 mx-auto text-slate-300" />
            <h2 className="mt-4 text-xl font-bold text-slate-800">Your workspace is empty</h2>
            <p className="mt-1 text-slate-500">Get started by creating a new project or seeding your workspace with sample data.</p>
            <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="mt-4 flex items-center justify-center mx-auto space-x-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 disabled:bg-slate-400 transition-colors"
            >
                {isSeeding ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                    <Icon path={ICONS.SEED} className="w-4 h-4"/>
                )}
                <span>{isSeeding ? 'Seeding...' : 'Seed Sample Data'}</span>
            </button>
        </div>
      )}

      <OverviewCards data={overviewData} />
      
      <ProjectList 
        projects={projects}
        onProjectSelect={onProjectSelect}
        isLoading={isLoading}
        isStandalonePage={false} 
        onRefresh={fetchProjects}
      />
    </div>
  );
};

export default Dashboard;
