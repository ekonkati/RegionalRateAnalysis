import React, { useState } from 'react';
// FIX: Removed import for 'setSupabaseCredentials' as it's no longer exported from supabase/client.ts.
// The configuration is now hardcoded, making this component's credential-setting functionality obsolete.
import Icon from '../Icon';
import { ICONS } from '../../constants';

interface SupabaseConfigProps {
  error?: string | null;
}

const SupabaseConfig: React.FC<SupabaseConfigProps> = ({ error: initialError }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [error, setError] = useState(initialError || '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear previous error on new submission
    
    if (!url || !anonKey) {
      setError('Both fields are required.');
      return;
    }
    try {
        // Validate URL format
        new URL(url);
    } catch (_) {
        setError('Please enter a valid Supabase URL.');
        return;
    }

    // FIX: The 'setSupabaseCredentials' function is obsolete, so this call has been removed.
    // setSupabaseCredentials(url, anonKey);
    // Reload the page to re-initialize the Supabase client
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-xl p-8 space-y-6">
         <div className="flex flex-col items-center">
          <Icon path={ICONS.ADMIN} className="h-12 w-12 text-slate-400" />
          <h1 className="text-2xl font-bold mt-2 text-slate-800">Connect to Supabase</h1>
          <p className="text-slate-500 text-center">Enter your project credentials to get started.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          <div>
            <label htmlFor="supabase-url" className="text-sm font-medium text-slate-700">Project URL</label>
            <input
              id="supabase-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://<your-project-ref>.supabase.co"
              required
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="supabase-key" className="text-sm font-medium text-slate-700">Anon Public Key</label>
            <input
              id="supabase-key"
              type="text"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              required
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900"
          >
            Save and Connect
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-4 border-t">
            Find these keys in your Supabase Dashboard under <span className="font-mono bg-slate-200 px-1 rounded">Settings &gt; API</span>. 
            Your keys are stored only in your browser's local storage.
        </div>
      </div>
    </div>
  );
};

export default SupabaseConfig;