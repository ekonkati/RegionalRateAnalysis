import React from 'react';

type UploadStatus = 'idle' | 'parsing' | 'uploading' | 'complete' | 'error';

interface UploadResult {
    successCount: number;
    errorCount: number;
    errors: string[];
}

interface UploadStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: UploadStatus;
  result: UploadResult;
}

const UploadStatusModal: React.FC<UploadStatusModalProps> = ({ isOpen, onClose, status, result }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        switch (status) {
            case 'parsing':
            case 'uploading':
                return (
                    <div className="flex flex-col items-center justify-center space-y-3 text-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                        <p className="text-slate-600 font-semibold">{status === 'parsing' ? 'Parsing Excel File...' : 'Uploading data to Supabase...'}</p>
                        <p className="text-sm text-slate-500">Please wait, this may take a moment.</p>
                    </div>
                );
            case 'complete':
                return (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                             <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Upload Successful</h3>
                        <div className="mt-2 px-7 py-3">
                            <p className="text-sm text-gray-500">
                                Successfully uploaded <span className="font-bold">{result.successCount}</span> items.
                                {result.errorCount > 0 && ` Failed to upload ${result.errorCount} items.`}
                            </p>
                        </div>
                        {result.errors.length > 0 && (
                            <div className="mt-4 text-left max-h-40 overflow-y-auto bg-slate-50 p-3 rounded-md">
                                <h4 className="font-semibold text-sm text-red-700">Errors:</h4>
                                <ul className="text-xs text-red-600 list-disc list-inside">
                                    {result.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                                    {result.errors.length > 10 && <li>...and {result.errors.length - 10} more.</li>}
                                </ul>
                            </div>
                        )}
                         <div className="mt-5 sm:mt-6">
                            <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-white hover:bg-slate-900 focus:outline-none"
                                onClick={onClose}
                            >
                                Go back to Ratebooks
                            </button>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                           <svg className="h-6 w-6 text-red-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Upload Failed</h3>
                        <div className="mt-2 px-7 py-3">
                            <p className="text-sm text-gray-500">
                                {result.errors[0] || 'An unknown error occurred.'}
                            </p>
                        </div>
                        <div className="mt-5 sm:mt-6">
                            <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-white hover:bg-slate-900 focus:outline-none"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            {renderContent()}
          </div>
        </div>
    );
};

export default UploadStatusModal;
