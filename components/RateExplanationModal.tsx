

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
// FIX: Import 'FullCharges' type which was added to types.ts
import { BOQItem, Project, FullCharges } from '../types';
import Icon from './Icon';
import { ICONS } from '../constants';

interface RateExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BOQItem;
  project: Project;
  charges: FullCharges;
}

const RateExplanationModal: React.FC<RateExplanationModalProps> = ({ isOpen, onClose, item, project, charges }) => {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      generateExplanation();
    } else {
      setExplanation('');
      setIsLoading(false);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, item]);

  const generateExplanation = async () => {
    setIsLoading(true);
    setError(null);
    setExplanation('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // --- CONSTRUCT THE DETAILED PROMPT ---
    
    // FIX: Use 'base_rate' instead of non-existent 'rate' property.
    let analysisText = `The base rate from the schedule of rates is ₹${item.base_rate.toFixed(2)} per ${item.uom}. This rate already includes material, labor, machinery, and contractor's overheads.`;

    // FIX: Use 'analysis_json' instead of 'rate_analyses'. Use 'type' instead of 'component_type'.
    if(item.analysis_json && item.analysis_json.components.length > 0) {
        const analysis = item.analysis_json;
        const materials = analysis.components.filter(c => c.type === 'material');
        const labour = analysis.components.filter(c => c.type === 'labour');
        const machinery = analysis.components.filter(c => c.type === 'machinery');

        analysisText = `
        The base rate is derived from a detailed analysis for a quantity of ${analysis.analysis_for_quantity || 1} ${item.uom}:
        
        A. MATERIALS:
        ${materials.map(c => `- ${c.desc}: ${c.qty} ${c.uom} @ ₹${c.rate?.toFixed(2)}`).join('\n') || '- NIL'}
        
        B. LABOUR:
        ${labour.map(c => `- ${c.desc}: ${c.qty} ${c.uom} @ ₹${c.rate?.toFixed(2)}`).join('\n') || '- NIL'}
        
        C. MACHINERY:
        ${machinery.map(c => `- ${c.desc}: ${c.qty} ${c.uom} @ ₹${c.rate?.toFixed(2)}`).join('\n') || '- NIL'}
        
        D. CONTRACTOR'S PROFIT & OVERHEADS:
        - A charge of ${analysis.contractor_overheads?.percentage || 0}% is applied to the sum of Materials, Labour, and Machinery.
        `;
    }

    // FIX: Use optional properties added to BOQItem for lead/lift.
    const leadText = `Initial lead included in the base rate: ${item.initial_lead_included_km || 1} km. Assume a total required lead of ${item.total_lead_km || 5} km.`;
    const liftText = `Initial lift included in the base rate: ${item.initial_lift_included_m || 3} m. Assume a total required lift of ${item.total_lift_m || 6} m.`;

    const prompt = `
      You are an expert quantity surveyor. Your task is to provide a detailed, step-by-step rate analysis for a construction item, mimicking the format of an official public works department (PWD) document.

      **ITEM DETAILS:**
      - **Description:** ${item.description_en}
      - **Code:** ${item.item_code}
      - **Unit of Measurement (UOM):** ${item.uom}
      - **Project Region:** ${project.region_id}

      **BASE RATE DERIVATION:**
      ${analysisText}

      **ADDITIONAL CHARGES & CONDITIONS for ${project.region_id}:**
      1.  **Lead & Lift:**
          ${leadText}
          ${liftText}
      2.  **Charges Tables:** You must use the following tables to calculate additional costs.
          - Seigniorage Charges: ${JSON.stringify(charges.seigniorage)}
          - Loading/Unloading Charges: ${JSON.stringify(charges.loadingUnloading)}
          - Transport Slabs (Lead/Lift): ${JSON.stringify(charges.transportSlabs)}

      **YOUR TASK:**
      Create a final rate analysis breakdown in well-formatted markdown. Follow this exact structure:

      1.  **Start with the Base Rate:** State the base rate per ${item.uom} as derived from the analysis (or the given SOR rate).
      2.  **Calculate & Add Seigniorage:** Identify the primary material from the item description. Look up its seigniorage charge from the table and add it. Show the calculation.
      3.  **Calculate & Add Loading/Unloading:** If applicable, find the mechanical loading and unloading charges for the material and add them. Show the calculation.
      4.  **Calculate & Add Additional Lead:** 
          - Calculate Additional Lead = (Total Lead - Initial Lead).
          - If Additional Lead > 0, use the Transport Slabs table to calculate the cost. Be precise with tiered rates. Show the calculation.
      5.  **Calculate & Add Additional Lift:** 
          - Calculate Additional Lift = (Total Lift - Initial Lift).
          - If Additional Lift > 0, calculate the cost using the per-meter rate from the Transport Slabs table. Show the calculation.
      6.  **Summarize:** Create a final summary table:
          - Base Rate per ${item.uom}
          - Add: Seigniorage Charges
          - Add: Loading/Unloading Charges
          - Add: Additional Lead Charges
          - Add: Additional Lift Charges
      7.  **Conclude:** State the final "Total Effective Rate per ${item.uom}" by summing up all the components. Be clear, concise, and professional.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setExplanation(response.text);
    } catch (e) {
      console.error("Error generating explanation:", e);
      setError('Failed to generate explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">AI-Powered Rate Explanation</h2>
            {/* FIX: Use 'item_code' and 'description_en' properties. */}
            <p className="text-sm text-slate-500">{item.item_code} - {item.description_en.substring(0, 50)}...</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
            <Icon path={ICONS.PLUS} className="w-6 h-6 transform rotate-45" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-3 text-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
              <p className="text-slate-600 font-semibold">Generating detailed analysis...</p>
              <p className="text-sm text-slate-500">Our AI is building the rate from the ground up, including all regional charges. This may take a moment.</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
              <p className="font-semibold">An Error Occurred</p>
              <p className="text-sm">{error}</p>
              <button onClick={generateExplanation} className="mt-2 px-3 py-1 text-sm bg-red-200 rounded-md">Retry</button>
            </div>
          )}
          {explanation && (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }}>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RateExplanationModal;
