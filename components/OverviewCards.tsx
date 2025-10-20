import React from 'react';
import { OverviewData, PlanType } from '../types';
import Icon from './Icon';
import { ICONS } from '../constants';

interface OverviewCardProps {
  title: string;
  value: string;
  change?: string;
  iconPath: string;
  iconBgColor: string;
}

const Card: React.FC<OverviewCardProps> = ({ title, value, change, iconPath, iconBgColor }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
        </div>
        <div className={`p-3 rounded-full ${iconBgColor}`}>
            <Icon path={iconPath} className="w-6 h-6 text-white" />
        </div>
    </div>
);

const PlanCard: React.FC<{ plan: PlanType }> = ({ plan }) => (
    <div className="bg-slate-800 text-white p-5 rounded-xl shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-300">Plan Summary</p>
            <p className="text-2xl font-bold mt-1 capitalize">{plan}</p>
            <p className="text-xs text-slate-400 mt-1">Upgrade for more features</p>
        </div>
        <div className="p-3 rounded-full bg-slate-600">
            <Icon path={ICONS.PLAN} className="w-6 h-6 text-white" />
        </div>
    </div>
);


const OverviewCards: React.FC<{ data: OverviewData }> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
                title="Active Projects"
                value={`${data.activeProjects.count} / ${data.activeProjects.limit}`}
                change="Free Tier Limit"
                iconPath={ICONS.PROJECTS}
                iconBgColor="bg-blue-500"
            />
             <Card
                title="Latest Ratebook"
                value={data.latestRatebook}
                change="Version updated"
                iconPath={ICONS.RATEBOOKS}
                iconBgColor="bg-green-500"
            />
             <Card
                title="Exports this week"
                value={data.exportsThisWeek.toString()}
                change="Across all projects"
                iconPath={ICONS.EXPORTS}
                iconBgColor="bg-amber-500"
            />
            <PlanCard plan={data.plan} />
        </div>
    );
};

export default OverviewCards;
