



import React, { useMemo } from 'react';
// FIX: Use the correct 'RatebookDetail' type.
import { RatebookDetail } from '../../types';
import Icon from '../Icon';
import { ICONS } from '../../constants';

interface RatebookItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RatebookDetail;
}

const AnalysisBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="font-medium text-slate-600 capitalize">{label}</span>
      <span className="font-semibold text-slate-800">{value.toFixed(2)}%</span>
    </div>
    <div className="h-2.5 bg-slate-200 rounded-full">
      <div 
        className={`h-2.5 rounded-full ${color}`}
        style={{ width: `${value}%`}}
      ></div>
    </div>
  </div>
);

const RatebookItemModal: React.FC<RatebookItemModalProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen) {
    return null;
  }

  // FIX: Destructure correct properties 'base_rate', 'description_en', and optional 'rate_analyses' from item.
  const { code, description_en: description, uom, base_rate, rate_analyses, is_custom } = item;

  // FIX: Calculate analysis breakdown from the available `rate_analyses` data.
  const analysisBreakdown = useMemo(() => {
    // FIX: Check for optional 'rate_analyses' and its 'components' property.
    if (!rate_analyses || !rate_analyses.components || rate_analyses.components.length === 0) {
        return null;
    }

    const totals = {
        material: 0,
        labour: 0,
        machinery: 0,
    };

    let totalCost = 0;

    for (const component of rate_analyses.components) {
        const componentCost = (component.quantity || 0) * (component.rate || 0);
        // FIX: Check for 'component_type' which might exist on the 'any' type.
        if (component.component_type === 'material') {
            totals.material += componentCost;
        } else if (component.component_type === 'labour') {
            totals.labour += componentCost;
        } else if (component.component_type === 'machinery') {
            totals.machinery += componentCost;
        }
        totalCost += componentCost;
    }

    if (totalCost === 0) {
        return {
            materials: 0,
            labor: 0,
            equipment: 0,
        };
    }
    
    return {
        materials: (totals.material / totalCost) * 100,
        labor: (totals.labour / totalCost) * 100,
        equipment: (totals.machinery / totalCost) * 100,
    };
  }, [rate_analyses]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-800">Item Details</h2>
              {is_custom && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">Custom</span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-mono">{code}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
            <Icon path={ICONS.PLUS} className="w-6 h-6 transform rotate-45" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="font-semibold text-slate-800">Description</h3>
            <p className="mt-1 text-slate-600">{description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500">Rate</p>
              {/* FIX: Use `base_rate` instead of `rate`. */}
              <p className="text-lg font-bold text-slate-800 font-mono">₹{base_rate.toFixed(2)}</p>
            </div>
             <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500">Unit</p>
              <p className="text-lg font-bold text-slate-800">{uom}</p>
            </div>
             <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500">Type</p>
              <p className="text-lg font-bold text-slate-800">{is_custom ? 'Custom' : 'Standard'}</p>
            </div>
          </div>
          
          {/* FIX: Use the calculated `analysisBreakdown` to display data. */}
          {analysisBreakdown ? (
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Rate Analysis Breakdown</h3>
              <div className="space-y-4">
                <AnalysisBar label="materials" value={analysisBreakdown.materials} color="bg-blue-500" />
                <AnalysisBar label="labor" value={analysisBreakdown.labor} color="bg-green-500" />
                <AnalysisBar label="equipment" value={analysisBreakdown.equipment} color="bg-amber-500" />
              </div>
            </div>
          ) : (
            <div className="p-4 text-center bg-slate-50 rounded-lg">
              <p className="text-slate-500">No rate analysis data available for this item.</p>
            </div>
          )}
        </main>
         <footer className="p-4 border-t flex-shrink-0 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200">
                Close
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900">
                Edit Item
            </button>
        </footer>
      </div>
    </div>
  );
};

export default RatebookItemModal;
