
import React, { useMemo } from 'react';
import { Subproject, BOQItem, Project, CalculationResult, RateAnalysisComponent, ItemCategory } from '../../types';
import Icon from '../Icon';
import { ICONS } from '../../constants';

interface BOQTableProps {
  subproject: Subproject;
  project: Project;
  onSelectItemForBreakdown: (item: BOQItem, result: CalculationResult) => void;
  onAddItemClick: () => void;
}

const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Main calculation engine based on Design Document #7: Calculation Flowchart (W->Z)
export const calculateRateWZ = (item: BOQItem, project: Project): CalculationResult => {
    // A) Prepare Components & Sum Buckets
    // FIX: The 'concrete' key is now valid as 'ItemCategory' type was updated in types.ts.
    const buckets: Record<ItemCategory, number> = {
        material: 0, labour: 0, machinery: 0, carriage: 0, sundry: 0, adjustment: 0, composite: 0, concrete: 0
    };

    // For this implementation, we simplify: if there's no detailed analysis_json,
    // we treat the base_rate as a composite bucket.
    // A full implementation would fetch/use analysis_json here.
    const hasAnalysis = item.analysis_json && item.analysis_json.components;
    if (hasAnalysis) {
        item.analysis_json.components.forEach((c: RateAnalysisComponent) => {
            buckets[c.type] += c.amount;
        });
    } else {
        // Fallback: use base_rate and assign to its category
        buckets[item.ratebook_detail.category] = item.ratebook_detail.base_rate;
    }

    // B) Sum Buckets to get W
    const W = Object.values(buckets).reduce((sum, val) => sum + val, 0);

    // C) Apply Special Rules (pre-admin) - STUBBED FOR NOW
    // e.g., reuse credits, deductions. W_adjusted = W - credit;
    const W_adjusted = W;
    
    // D) Admin Add-ons
    // Order: Water -> GST -> CPOH -> Cess
    const X = W_adjusted * (1 + project.water_pct / 100);
    const Y = X * (1 + project.gst_factor); // gst_factor is multiplicative (e.g., 0.2127)
    const Z0 = Y * (1 + project.cpoh_pct / 100);
    const Z = Z0 * (1 + project.cess_pct / 100);
    
    // E) Rounding & "Say"
    // For now, simple rounding. A full implementation would use project-level policy.
    const final_rate = Math.round(Z * 100) / 100;
    
    // F) Extended Calculations
    const final_amount = final_rate * item.quantity;

    return {
        buckets,
        stages: { W: W, X, Y, Z0, Z },
        final_rate,
        final_amount,
    };
};


const BOQTable: React.FC<BOQTableProps> = ({ subproject, project, onSelectItemForBreakdown, onAddItemClick }) => {
    
    const itemsWithCalculatedRates = useMemo(() => {
        return (subproject.items || []).map(item => {
            const calculationResult = calculateRateWZ(item, project);
            return {
                ...item,
                ...calculationResult,
            };
        });
    }, [subproject.items, project]);

    const totalAmount = useMemo(() => 
        itemsWithCalculatedRates.reduce((sum, item) => sum + item.final_amount, 0),
    [itemsWithCalculatedRates]);

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{subproject.name} - Bill of Quantities</h2>
                    <p className="text-sm text-slate-500">{(subproject.items || []).length} items</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Icon path={ICONS.SEARCH} className="w-5 h-5 absolute text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Search items..." className="pl-10 pr-4 py-2 w-64 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white" />
                    </div>
                    <button onClick={onAddItemClick} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors">
                        <Icon path={ICONS.PLUS} className="w-4 h-4"/>
                        <span>Add Item</span>
                    </button>
                </div>
            </div>
            <div className="overflow-y-auto flex-1">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3">Code</th>
                            <th scope="col" className="px-6 py-3 w-2/5">Description</th>
                            <th scope="col" className="px-6 py-3 text-right">Quantity</th>
                            <th scope="col" className="px-6 py-3">UOM</th>
                            <th scope="col" className="px-6 py-3 text-right">Final Rate</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {itemsWithCalculatedRates.map((item) => (
                            <tr key={item.id} className="bg-white hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-slate-700">{item.ratebook_detail.code}</td>
                                <td className="px-6 py-4 font-medium text-slate-800 whitespace-normal">{item.ratebook_detail.description_en}</td>
                                <td className="px-6 py-4 text-right font-mono">{item.quantity.toFixed(2)}</td>
                                <td className="px-6 py-4">{item.ratebook_detail.uom}</td>
                                <td 
                                    className="px-6 py-4 text-right font-mono text-blue-600 hover:underline cursor-pointer"
                                    onClick={() => onSelectItemForBreakdown(item, item)}
                                >
                                    {formatCurrency(item.final_rate)}
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.final_amount)}</td>
                                <td className="px-6 py-4 text-center">
                                    <button className="p-2 rounded-full hover:bg-slate-200">
                                        <Icon path={ICONS.DOTS_VERTICAL} className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end items-center flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-slate-600">Sub-Project Total:</span>
                    <span className="text-xl font-bold font-mono text-slate-800">{formatCurrency(totalAmount)}</span>
                </div>
            </div>
        </div>
    );
};

export default BOQTable;
