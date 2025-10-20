
import React from 'react';

const Admin: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage users, settings, and system configurations.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800">System Status</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Database Connection</p>
                <p className="text-lg font-bold text-green-600">Connected</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">AI API Status</p>
                <p className="text-lg font-bold text-green-600">Operational</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Active Users</p>
                <p className="text-lg font-bold text-slate-800">1 (Admin)</p>
            </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800">Users</h2>
        <p className="text-slate-500 mt-2">User management is not yet implemented.</p>
      </div>
    </div>
  );
};

export default Admin;
