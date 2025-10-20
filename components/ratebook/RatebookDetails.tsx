

import React, { useState, useEffect } from 'react';
import { Ratebook, RatebookDetailItem } from '../../types';
import { ICONS } from '../../constants';
import Icon from '../Icon';
import RatebookItemModal from './RatebookItemModal';
import { supabase } from '../../supabase/client';

interface RatebookDetailsProps {
  ratebook: Ratebook;
  onBack: () => void;
}

const RatebookDetails: React.FC<RatebookDetailsProps> = ({ ratebook, onBack }) => {
  const [items, setItems] = useState<RatebookDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<RatebookDetailItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      if (!ratebook) return;
      setIsLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('ratebook_items')
          .select('*, rate_analyses(*, contractor_overheads(*), rate_analysis_components(*))')
          .eq('ratebook_id', ratebook.id)
          .limit(100); // Add pagination for performance

        if (searchTerm) {
          query = query.or(`code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query;

        if (error) throw error;
        setItems(data || []);

      } catch (err: any) {
        setError(`Failed to fetch items: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
        fetchItems();
    }, 300); // Debounce search to avoid excessive API calls

    return () => clearTimeout(debounceFetch);
  }, [ratebook, searchTerm]);


  const handleViewItem = (item: RatebookDetailItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{ratebook.name}</h2>
          <p className="text-sm text-slate-500">{ratebook.items_count.toLocaleString()} items</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
          &larr; Back to List
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <div className="relative">
            <Icon path={ICONS.SEARCH} className="w-5 h-5 absolute text-slate-400 left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by code or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white" 
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors">
            <Icon path={ICONS.PLUS} className="w-4 h-4"/>
            <span>Add Item</span>
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {error && <div className="p-4 bg-red-50 text-red-700 m-4 rounded-lg">{error}</div>}
          {isLoading ? (
             <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
             </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3">Code</th>
                  <th scope="col" className="px-6 py-3 w-3/5">Description</th>
                  <th scope="col" className="px-6 py-3">UOM</th>
                  <th scope="col" className="px-6 py-3 text-right">Rate (₹)</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-700">{item.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 whitespace-normal">{item.description}</td>
                    <td className="px-6 py-4">{item.uom}</td>
                    {/* FIX: Use `base_rate` instead of the non-existent `rate` property. */}
                    <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900">{item.base_rate.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleViewItem(item)} className="p-2 rounded-full hover:bg-slate-200">
                        <Icon path={ICONS.DOTS_VERTICAL} className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {selectedItem && (
        <RatebookItemModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedItem}
        />
      )}
    </div>
  );
};

export default RatebookDetails;
