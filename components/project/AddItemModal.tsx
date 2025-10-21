import React, { useState, useEffect, useCallback } from 'react';
import { RatebookDetail } from '../../types';
import { ICONS } from '../../constants';
import Icon from '../Icon';
import { supabase } from '../../supabase/client';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: RatebookDetail, quantity: number) => void;
  ratebookId: string;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAddItem, ratebookId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<RatebookDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RatebookDetail | null>(null);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const searchItems = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
        setItems([]);
        return;
    }
    setIsLoading(true);
    try {
        const { data, error } = await supabase
            .from('ratebook_details')
            .select('*')
            .eq('ratebook_id', ratebookId)
            .or(`code.ilike.%${term}%,description_en.ilike.%${term}%`)
            .limit(50);
        
        if (error) throw error;
        setItems(data || []);

    } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to search for items.");
    } finally {
        setIsLoading(false);
    }
  }, [ratebookId]);

  useEffect(() => {
    const debounce = setTimeout(() => {
        searchItems(searchTerm);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, searchItems]);

  const handleAddItemClick = () => {
    if (!selectedItem) {
      setError('Please select an item from the list.');
      return;
    }
    if (quantity === '' || quantity <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }
    onAddItem(selectedItem, Number(quantity));
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setItems([]);
    setSelectedItem(null);
    setQuantity('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Add Item to Bill of Quantities</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
            <Icon path={ICONS.PLUS} className="w-6 h-6 transform rotate-45" />
          </button>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Item List */}
          <div className="w-3/5 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Icon path={ICONS.SEARCH} className="w-5 h-5 absolute text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search ratebook items (min. 2 chars)..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:bg-white" 
                />
              </div>
            </div>
            <div className="overflow-y-auto">
                {isLoading && <div className="p-4 text-center text-slate-500">Searching...</div>}
                {!isLoading && searchTerm.length > 1 && items.length === 0 && <div className="p-4 text-center text-slate-500">No items found.</div>}
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2 w-3/5">Description</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(item => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer hover:bg-slate-100 ${selectedItem?.id === item.id ? 'bg-slate-800 text-white hover:bg-slate-800' : 'text-slate-600'}`}
                    >
                      <td className="px-4 py-2 font-mono">{item.code}</td>
                      <td className="px-4 py-2">{item.description_en}</td>
                      <td className="px-4 py-2 text-right font-mono">{item.base_rate.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selection Details */}
          <div className="w-2/5 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 mb-4">Selected Item</h3>
              {selectedItem ? (
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-500">Code</p>
                    <p className="font-mono font-semibold text-slate-800">{selectedItem.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Description</p>
                    <p className="text-slate-800">{selectedItem.description_en}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Unit</p>
                      <p className="font-semibold text-slate-800">{selectedItem.uom}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Base Rate</p>
                      <p className="font-mono font-semibold text-slate-800">₹{selectedItem.base_rate.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">Select an item from the list on the left.</p>
                </div>
              )}

              <div className="mt-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input 
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder={`Enter quantity in ${selectedItem?.uom || 'units'}`}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  disabled={!selectedItem}
                />
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={handleClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200">
                  Cancel
              </button>
              <button 
                onClick={handleAddItemClick}
                disabled={!selectedItem || !quantity}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                  Add Item to BOQ
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddItemModal;
