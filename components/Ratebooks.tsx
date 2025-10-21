
import React, { useState, useEffect, useRef } from 'react';
// FIX: Add Organization to props to be used in upload logic
import { Ratebook, Organization } from '../types';
import Icon from './Icon';
import { ICONS } from '../constants';
import RatebookDetails from './ratebook/RatebookDetails';
import RatebookComparison from './RatebookComparison';
import { supabase } from '../supabase/client';
import UploadStatusModal from './UploadStatusModal';
import * as XLSX from 'xlsx';
import { User } from '@supabase/supabase-js';

interface RatebooksProps {
  user: User;
  org: Organization;
}

type RatebookView = 'list' | 'details' | 'compare';
type UploadStatus = 'idle' | 'parsing' | 'uploading' | 'complete' | 'error';
interface UploadResult { successCount: number; errorCount: number; errors: string[]; }

const Ratebooks: React.FC<RatebooksProps> = ({ user, org }) => {
    const [ratebooks, setRatebooks] = useState<Ratebook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<RatebookView>('list');
    const [selectedRatebook, setSelectedRatebook] = useState<Ratebook | null>(null);
    
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadResult, setUploadResult] = useState<UploadResult>({ successCount: 0, errorCount: 0, errors: [] });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRatebooks = async () => {
        setIsLoading(true);
        try {
            // Fetch public ratebooks (org_id is null) AND user's org ratebooks
            const { data, error } = await supabase
                .from('ratebooks')
                .select('*')
                .or(`org_id.eq.${org.id},org_id.is.null`);

            if (error) throw error;
            setRatebooks(data || []);
        } catch (err) {
            console.error("Failed to fetch ratebooks", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchRatebooks();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, user, org]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadStatus('parsing');
        setUploadResult({ successCount: 0, errorCount: 0, errors: [] });

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // FIX: Use Uint8Array instead of the non-existent UintArray.
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);
                
                setUploadStatus('uploading');
                
                // 1. Create the new custom ratebook for the user's org
                const newRatebookName = file.name.replace(/\.(xlsx|xls)$/, '');
                // FIX: Insert into ratebooks with correct properties (org_id, source_type, status)
                const { data: newRatebook, error: rbError } = await supabase.from('ratebooks').insert({
                    name: newRatebookName,
                    source_type: 'upload',
                    year: new Date().getFullYear(),
                    status: 'draft',
                    org_id: org.id,
                    // Note: region_id is required, using org default or first available as fallback
                    region_id: org.region_default_id || '00000000-0000-0000-0000-000000000000' // Placeholder
                }).select().single();

                if (rbError) throw rbError;

                // 2. Prepare and insert ratebook items
                // FIX: Map to correct column names for 'ratebook_details' table
                const itemsToInsert = json.map(row => ({
                    ratebook_id: newRatebook.id,
                    code: row.code || 'N/A',
                    description_en: row.description || 'No description',
                    uom: row.uom || 'unit',
                    base_rate: parseFloat(row.rate) || 0,
                    is_custom: true,
                    category: row.category || 'composite' // Add required category
                }));

                // FIX: Insert into 'ratebook_details' table instead of 'ratebook_items'
                const { error: itemsError } = await supabase.from('ratebook_details').insert(itemsToInsert);
                if(itemsError) throw itemsError;

                setUploadResult({ successCount: json.length, errorCount: 0, errors: [] });
                setUploadStatus('complete');
                await fetchRatebooks();
                
            } catch (error: any) {
                setUploadResult({ successCount: 0, errorCount: 0, errors: [error.message] });
                setUploadStatus('error');
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleViewDetails = (ratebook: Ratebook) => {
        setSelectedRatebook(ratebook);
        setView('details');
    };

    const handleViewComparison = () => {
        setView('compare');
    };
    
    const handleBack = () => {
        setSelectedRatebook(null);
        setView('list');
    };

    const renderListView = () => (
        <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">All Ratebooks</h2>
                    <p className="text-sm text-slate-500">Manage your rate schedules</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleViewComparison} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200">
                        Compare YoY
                    </button>
                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-900">
                        <Icon path={ICONS.PLUS} className="w-4 h-4" />
                        <span>Import Ratebook</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Source</th>
                            <th scope="col" className="px-6 py-3">Year</th>
                            <th scope="col" className="px-6 py-3 text-right">Items Count</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Last Updated</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="text-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800 mx-auto"></div></td></tr>
                        ) : ratebooks.map(rb => (
                            <tr key={rb.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => handleViewDetails(rb)}>
                                <td className="px-6 py-4 font-semibold text-slate-900">{rb.name}</td>
                                {/* FIX: Use 'source_type' instead of non-existent 'source' property. */}
                                <td className="px-6 py-4">{rb.source_type}</td>
                                <td className="px-6 py-4">{rb.year}</td>
                                <td className="px-6 py-4 text-right font-mono">{(rb.items_count || 0).toLocaleString()}</td>
                                {/* FIX: Use lowercase 'published' for status comparison. */}
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${rb.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{rb.status}</span></td>
                                <td className="px-6 py-4">{rb.last_updated ? new Date(rb.last_updated).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-full hover:bg-slate-200">
                                        <Icon path={ICONS.DOTS_VERTICAL} className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <UploadStatusModal 
                isOpen={uploadStatus !== 'idle'} 
                onClose={() => setUploadStatus('idle')}
                status={uploadStatus}
                result={uploadResult}
            />
        </div>
    );

    if (view === 'details' && selectedRatebook) {
        return <RatebookDetails ratebook={selectedRatebook} onBack={handleBack} />;
    }

    if (view === 'compare') {
        return <RatebookComparison onBack={handleBack} />;
    }

    return renderListView();
};

export default Ratebooks;
