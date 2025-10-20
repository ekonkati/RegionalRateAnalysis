import React from 'react';
import { RatebookComparisonItem } from '../types';
import { MOCK_COMPARISON_DATA, ICONS, MOCK_FULL_RATEBOOKS } from '../constants';
import Icon from './Icon';

const RatebookComparison: React.FC<{onBack: () => void}> = ({ onBack }) => {

    const topChanges = MOCK_COMPARISON_DATA.slice()
        .sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent))
        .slice(0, 10);
    
    const maxDelta = Math.max(...topChanges.map(item => Math.abs(item.deltaPercent)));

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
                 <div>
                    <h2 className="text-lg font-bold text-slate-800">Compare Ratebooks</h2>
                    <p className="text-sm text-slate-500">Year-over-Year (YoY) analysis for CPWD</p>
                </div>
                 <button onClick={onBack} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                    Back to List
                </button>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Top 10 Changes by %</h3>
                    <div className="space-y-3">
                        {topChanges.map(item => (
                            <div key={item.code}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 truncate">{item.description}</span>
                                    <span className={`font-semibold ${item.deltaPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.deltaPercent.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full">
                                    <div 
                                        className={`h-2 rounded-full ${item.deltaPercent > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${(Math.abs(item.deltaPercent) / maxDelta) * 100}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                     <div className="p-4 border-b flex justify-between items-center">
                         <div className="flex items-center space-x-4">
                            <select defaultValue="cpwd2024" className="text-sm font-semibold bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white">
                                <option value="cpwd2024">CPWD 2024</option>
                            </select>
                            <span className="text-slate-400">vs</span>
                             <select defaultValue="cpwd2025" className="text-sm font-semibold bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white">
                                <option value="cpwd2025">CPWD 2025</option>
                            </select>
                        </div>
                        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                            <Icon path={ICONS.EXPORTS} className="w-4 h-4"/>
                            <span>Export</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-[60vh]">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Code</th>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3 text-right">2024 Rate</th>
                                    <th scope="col" className="px-6 py-3 text-right">2025 Rate</th>
                                    <th scope="col" className="px-6 py-3 text-right">Δ</th>
                                    <th scope="col" className="px-6 py-3 text-right">Δ%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_COMPARISON_DATA.map((item) => (
                                    <tr key={item.code} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-slate-700">{item.code}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{item.description}</td>
                                        <td className="px-6 py-4 text-right font-mono">{item.baseRate.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900">{item.targetRate.toFixed(2)}</td>
                                        <td className={`px-6 py-4 text-right font-mono font-semibold ${item.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.delta.toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-mono font-semibold ${item.deltaPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.deltaPercent.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatebookComparison;
