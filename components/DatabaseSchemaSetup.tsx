import React from 'react';
import { schema } from '../supabase/schema';
import Icon from './Icon';
import { ICONS } from '../constants';

const DatabaseSchemaSetup: React.FC = () => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(schema);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
            <div className="text-center">
                <Icon path={ICONS.ADMIN} className="w-12 h-12 mx-auto text-amber-500" />
                <h2 className="mt-4 text-2xl font-bold text-slate-800">Database Setup Required</h2>
                <p className="mt-2 text-slate-500">
                    It looks like the necessary database tables are missing in your Supabase project.
                    <br />
                    Please run the setup script below to create them.
                </p>
            </div>

            <div className="mt-8 space-y-4">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Copy the SQL Schema</h3>
                        <p className="text-sm text-slate-500">Click the button below to copy the entire database setup script to your clipboard.</p>
                    </div>
                </div>
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Paste in Supabase SQL Editor</h3>
                        <p className="text-sm text-slate-500">
                            Go to your project's <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a>, navigate to the <span className="font-mono bg-slate-200 px-1 rounded">SQL Editor</span>, and paste the script into a new query.
                        </p>
                    </div>
                </div>
                 <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Run the Script &amp; Refresh</h3>
                        <p className="text-sm text-slate-500">Click the "RUN" button in Supabase. Once it finishes, come back here and click the refresh button below.</p>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <pre className="bg-slate-50 text-slate-600 text-xs p-4 rounded-md max-h-48 overflow-auto font-mono">
                    <code>{schema.substring(0, 500)}...</code>
                </pre>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                 <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors"
                >
                    <Icon path={ICONS.SEED} className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy SQL Schema'}</span>
                </button>
                 <button
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                >
                    <span>I've run the script, Refresh App</span>
                </button>
            </div>
        </div>
    );
};

export default DatabaseSchemaSetup;
