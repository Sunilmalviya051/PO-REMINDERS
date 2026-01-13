
import React, { useState, useEffect } from 'react';
import { PurchaseOrder, POStatus } from '../types';
import { GoogleGenAI } from "@google/genai";
import { URGENCY_LABELS } from '../constants';

interface ReminderModalProps {
  pos: (PurchaseOrder & { age: number; calculatedUrgency: string })[];
  onSent: () => void;
  onCancel: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ pos, onSent, onCancel }) => {
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateDraft = async () => {
      setLoading(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Filter for critical items only
      const criticalTiers = [
        URGENCY_LABELS.PO_1Y_DUE,
        URGENCY_LABELS.PO_8M_DUE,
        URGENCY_LABELS.PO_6M_DUE,
        URGENCY_LABELS.PO_4M_DUE_ACTIONS,
        URGENCY_LABELS.PO_3M_DUE_ACTION,
        URGENCY_LABELS.PO_1_5M_DUE_ACTION_MEDIUM,
        URGENCY_LABELS.OVERDUE
      ];

      const criticalItems = pos
        .filter(p => criticalTiers.includes(p.calculatedUrgency) && p.status !== POStatus.DELIVERED)
        .slice(0, 15); // Limit for mailto character constraints

      const context = criticalItems.map(p => ({
        po: p.poNumber,
        vendor: p.vendor,
        age: p.age,
        tier: p.calculatedUrgency,
        status: p.status
      }));

      const prompt = `
        Draft a highly professional business email report for Sunil Malviya.
        Recipient: Sunil Malviya (Sunil.Malviya@mswil.motherson.com)
        Context: A list of aged and critical Purchase Orders that require immediate attention.
        
        Purchase Order Data (JSON): ${JSON.stringify(context)}
        
        Requirements:
        1. Subject Line: Start with [URGENT PO REPORT] and include today's date.
        2. Greeting: "Dear Sunil,"
        3. Content: A concise, bulleted summary of the most critical orders by age tier.
        4. Tone: Collaborative yet urgent.
        5. Closing: "Best regards, Procurement Intelligence Sentinel"
        
        Output format:
        SUBJECT: [The subject line]
        BODY: [The email content]
      `;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        
        const text = response.text || "";
        const subjectMatch = text.match(/SUBJECT:\s*(.*)/i);
        const bodyMatch = text.match(/BODY:\s*([\s\S]*)/i);

        setDraft({
          subject: subjectMatch ? subjectMatch[1].trim() : `Daily PO Urgency Report - ${new Date().toLocaleDateString()}`,
          body: bodyMatch ? bodyMatch[1].trim() : text
        });
      } catch (e) {
        console.error(e);
        setDraft({
          subject: `Daily PO Urgency Report - ${new Date().toLocaleDateString()}`,
          body: "Please find attached the list of aged purchase orders requiring your review."
        });
      } finally {
        setLoading(false);
      }
    };

    generateDraft();
  }, [pos]);

  const handleSend = () => {
    if (!draft) return;
    const recipient = "Sunil.Malviya@mswil.motherson.com";
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.location.href = mailtoLink;
    onSent();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in border border-slate-200">
        <div className="px-6 py-4 bg-indigo-600 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Email Dispatcher</h3>
          </div>
          <button onClick={onCancel} className="text-indigo-100 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">AI Generating Report...</p>
            </div>
          ) : draft ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase w-20">Recipient:</span>
                  <span className="text-sm font-bold text-indigo-600">Sunil.Malviya@mswil.motherson.com</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase w-20">Subject:</span>
                  <span className="text-sm font-bold text-slate-800">{draft.subject}</span>
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 h-64 overflow-y-auto font-mono text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {draft.body}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
                >
                  Edit Later
                </button>
                <button 
                  onClick={handleSend}
                  className="flex-[2] py-3 px-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Send to Sunil
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-rose-500 font-bold">Failed to generate draft. Please try again.</p>
              <button onClick={onCancel} className="mt-4 text-indigo-600 font-bold underline">Close</button>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase text-center leading-tight">
            Reminders are scheduled Mon-Sat at 09:30 AM.<br/> dispatch requires manual confirmation due to security protocols.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
