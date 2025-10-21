import React from 'react';
import { Organization } from '../types';

interface AdminProps {
  org: Organization | null;
}

const Admin: React.FC<AdminProps> = ({ org }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Console</h1>
        <p className="text-slate-500 mt-1">Manage organization settings, users, and billing.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800">Organization: {org?.name}</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Plan</p>
                <p className="text-lg font-bold text-blue-600 capitalize">{org?.plan_type}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Members</p>
                <p className="text-lg font-bold text-slate-800">1 (You)</p>
            </div>
             <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">Default Region</p>
                <p className="text-lg font-bold text-slate-800">Not Set</p>
            </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800">Users & Roles</h2>
        <p className="text-slate-500 mt-2">User management is not yet implemented.</p>
      </div>
       <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800">Billing</h2>
        <p className="text-slate-500 mt-2">Billing integration is not yet implemented.</p>
      </div>
    </div>
  );
};

export default Admin;
