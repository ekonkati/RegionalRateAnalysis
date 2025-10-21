import React from 'react';
import { BOQItem, CalculationResult, ItemCategory } from '../../types';
import Icon from '../Icon';
import { ICONS } from '../../constants';

interface RateBreakdownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: { item: BOQItem; result: CalculationResult } | null;
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const BreakdownRow: React.FC<{ label: string; value: string; isSubtle?: boolean; isTotal?: boolean; isFinal?: boolean }> = ({ label, value, isSubtle = false, isTotal = false, isFinal = false }) => (
  <div className={`flex justify-between items-center py-2 ${isSubtle ? '' : 'border-b border-slate-100'}`}>
    <p className={`text-sm ${isTotal || isFinal ? 'font-bold' : ''} ${isSubtle ? 'text-slate-500 pl-4' : 'text-slate-700'}`}>{label}</p>
    <p className={`font-mono text-sm ${isTotal ? 'font-bold text-slate-800' : ''} ${isFinal ? 'text-lg font-bold text-slate-900' : ''} ${isSubtle ? 'text-slate-500' : 'text-slate-800'}`}>{value}</p>
  </div>
);

const RateBreakdownDrawer: React.FC<RateBreakdownDrawerProps> = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const { item, result } = data;
  const { buckets, stages } = result;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <header className="p-4 border-b flex justify-between items-center flex-shrink-0 bg-slate-50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Rate Build-up (W→Z)</h2>
              <p className="text-sm text-slate-500 truncate">{item.ratebook_detail.code} - {item.ratebook_detail.description_en}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
              <Icon path={ICONS.PLUS} className="w-6 h-6 transform rotate-45" />
            </button>
          </header>

          <main className="p-6 overflow-y-auto flex-1">
            <div className="space-y-6">
              {/* B) Sum Buckets */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">B. Component Buckets</h3>
                {Object.entries(buckets).filter(([, value]) => value > 0).map(([key, value]) => (
                   <BreakdownRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={formatCurrency(value)} isSubtle />
                ))}
                 <BreakdownRow label="Total (W)" value={formatCurrency(stages.W)} isTotal />
              </div>

              {/* C) Special Rules - Placeholder */}
              <div>
                 <h3 className="font-semibold text-slate-800 mb-2">C. Special Rules (Credits/Deductions)</h3>
                 <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-md">No special rules applied for this item.</p>
              </div>

              {/* D) Admin Add-ons */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">D. Admin Add-ons</h3>
                <BreakdownRow label="Base Cost (W)" value={formatCurrency(stages.W)} />
                <BreakdownRow label="Add: Water (1.00%)" value={formatCurrency(stages.X)} isSubtle />
                <BreakdownRow label="Subtotal (X)" value={formatCurrency(stages.X)} isTotal />
                <BreakdownRow label="Add: GST (21.27%)" value={formatCurrency(stages.Y - stages.X)} isSubtle />
                <BreakdownRow label="Subtotal (Y)" value={formatCurrency(stages.Y)} isTotal />
                <BreakdownRow label="Add: CPOH (15.00%)" value={formatCurrency(stages.Z0 - stages.Y)} isSubtle />
                <BreakdownRow label="Subtotal (Z0)" value={formatCurrency(stages.Z0)} isTotal />
                <BreakdownRow label="Add: Cess (1.00%)" value={formatCurrency(stages.Z - stages.Z0)} isSubtle />
              </div>
            </div>
          </main>
          <footer className="p-6 border-t flex-shrink-0 bg-slate-50">
            <BreakdownRow label={`Final Rate per ${item.ratebook_detail.uom} (Z)`} value={formatCurrency(stages.Z)} isFinal />
          </footer>
        </div>
      </div>
    </>
  );
};

export default RateBreakdownDrawer;
