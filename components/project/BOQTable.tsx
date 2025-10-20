
import React, { useMemo } from 'react';
import { Subproject, BOQItem, FullCharges } from '../../types';
import Icon from '../Icon';
import { ICONS } from '../../constants';

interface BOQTableProps {
  subproject: Subproject;
  charges: FullCharges;
  onExplainRate: (item: BOQItem) => void;
  onAddItemClick: () => void;
}

const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Main calculation engine
const calculateEffectiveRate = (item: BOQItem, charges: FullCharges): number => {
    const desc = item.description.toLowerCase();
    
    // --- 1. Base Cost Calculation (Materials + Labour + Machinery + Overheads) ---
    // If a detailed analysis exists, use it. Otherwise, use the SOR base rate.
    let baseCostWithOverhead = item.rate; // Fallback to the SOR rate

    if (item.rate_analyses && item.rate_analyses.components.length > 0) {
        const analysis = item.rate_analyses;
        const baseCost = analysis.components.reduce((sum, comp) => {
            const amount = (comp.quantity || 0) * (comp.rate || 0);
            return sum + amount;
        }, 0);
        
        const baseRatePerUnit = baseCost / analysis.analysis_for_quantity;
        
        const overhead = analysis.contractor_overheads;
        const overheadPercentage = overhead ? overhead.percentage : 0;
        const overheadAmount = baseRatePerUnit * (overheadPercentage / 100);
        
        baseCostWithOverhead = baseRatePerUnit + overheadAmount;
    }

    let finalRate = baseCostWithOverhead;

    // --- 2. Identify Primary Material for charge lookups ---
    let materialCategory = 'default';
    if (desc.includes('stone') || desc.includes('aggregate') || desc.includes('rubble') || desc.includes('rock')) {
        materialCategory = 'rubble_stone_aggregate';
    } else if (desc.includes('sand') || desc.includes('earth') || desc.includes('murrum')) {
        materialCategory = 'earth_sand_murrum';
    }

    // --- 3. Add Seigniorage Charges ---
    const seigniorageCharge = charges.seigniorage.find(c => c.material_category === materialCategory);
    if (seigniorageCharge) {
        finalRate += seigniorageCharge.rate;
    }

    // --- 4. Add Loading & Unloading Charges (if applicable) ---
    // Simple heuristic: add if it's a bulk material item. Exclude pure labor items.
    if (materialCategory !== 'default') {
        const loading = charges.loadingUnloading.find(c => c.material_category === materialCategory && c.charge_type === 'loading');
        const unloading = charges.loadingUnloading.find(c => c.material_category === materialCategory && c.charge_type === 'unloading');
        if (loading) finalRate += loading.rate;
        if (unloading) finalRate += unloading.rate;
    }

    // --- 5. Calculate and Add Additional Lead Charges ---
    const totalLead = item.total_lead_km ?? 5; // Use override or default to 5km
    const initialLead = item.initial_lead_included_km;
    const additionalLead = Math.max(0, totalLead - initialLead);

    if (additionalLead > 0) {
        const leadSlabs = charges.transportSlabs.filter(s => s.transport_type === 'lead' && s.material_category === materialCategory).sort((a,b) => a.start_dist - b.start_dist);
        let leadCost = 0;
        let lastSlabEnd = initialLead;

        // Use fixed rates for slabs up to the total lead distance
        const fixedSlabs = leadSlabs.filter(s => s.is_fixed_rate && s.end_dist <= totalLead && s.end_dist > initialLead);
        if (fixedSlabs.length > 0) {
            const highestApplicableSlab = fixedSlabs[fixedSlabs.length - 1];
            // The rate is the total cost up to that point. We need to subtract the cost up to the initial lead.
            const costAtInitial = leadSlabs.find(s => initialLead <= s.end_dist)?.rate || 0;
            leadCost = highestApplicableSlab.rate - costAtInitial;
            lastSlabEnd = highestApplicableSlab.end_dist;
        }

        // Apply per-km rate for remaining distance
        const remainingDistance = totalLead - lastSlabEnd;
        if (remainingDistance > 0) {
            const perKmSlab = leadSlabs.find(s => !s.is_fixed_rate && remainingDistance > 0 && totalLead > s.start_dist);
            if (perKmSlab) {
                leadCost += remainingDistance * perKmSlab.rate;
            }
        }
        finalRate += leadCost;
    }
    
    // --- 6. Calculate and Add Additional Lift Charges ---
    const totalLift = item.total_lift_m ?? 6; // Use override or default to 6m
    const initialLift = item.initial_lift_included_m;
    const additionalLift = Math.max(0, totalLift - initialLift);

    if (additionalLift > 0) {
        const liftSlab = charges.transportSlabs.find(s => s.transport_type === 'lift' && s.material_category === materialCategory && !s.is_fixed_rate);
        if (liftSlab) {
            finalRate += additionalLift * liftSlab.rate;
        }
    }
    
    return finalRate;
};


const BOQTable: React.FC<BOQTableProps> = ({ subproject, charges, onExplainRate, onAddItemClick }) => {
    
    const itemsWithEffectiveRates = useMemo(() => {
        return subproject.items.map(item => {
            const effectiveRate = calculateEffectiveRate(item, charges);
            return {
                ...item,
                effectiveRate,
                amount: item.quantity * effectiveRate,
            };
        });
    }, [subproject.items, charges]);

    const totalAmount = useMemo(() => 
        itemsWithEffectiveRates.reduce((sum, item) => sum + item.amount, 0),
    [itemsWithEffectiveRates]);

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{subproject.name} - Bill of Quantities</h2>
                    <p className="text-sm text-slate-500">{subproject.items.length} items</p>
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
                            <th scope="col" className="px-6 py-3 text-right">Effective Rate</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {itemsWithEffectiveRates.map((item) => (
                            <tr key={item.id} className="bg-white hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-slate-700">{item.code}</td>
                                <td className="px-6 py-4 font-medium text-slate-800 whitespace-normal">{item.description}</td>
                                <td className="px-6 py-4 text-right font-mono">{item.quantity.toFixed(2)}</td>
                                <td className="px-6 py-4">{item.uom}</td>
                                <td 
                                    className="px-6 py-4 text-right font-mono text-blue-600 hover:underline cursor-pointer"
                                    onClick={() => onExplainRate(item)}
                                >
                                    {formatCurrency((item as any).effectiveRate)}
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900">{formatCurrency(item.amount)}</td>
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
