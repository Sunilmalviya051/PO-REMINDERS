
import React, { useState, useEffect } from 'react';
import { PurchaseOrder, POStatus, POPriority } from '../types';

interface POFormProps {
  onSave: (po: Omit<PurchaseOrder, 'id'>) => void;
  onCancel: () => void;
  initialData?: PurchaseOrder;
}

const POForm: React.FC<POFormProps> = ({ onSave, onCancel, initialData }) => {
  const [vendor, setVendor] = useState(initialData?.vendor || '');
  const [poNumber, setPoNumber] = useState(initialData?.poNumber || '');
  const [creationDate, setCreationDate] = useState(initialData?.creationDate || new Date().toISOString().split('T')[0]);
  const [approveDate, setApproveDate] = useState(initialData?.approveDate || '');
  const [deliveryDate, setDeliveryDate] = useState(initialData?.deliveryDate || '');
  const [status, setStatus] = useState<POStatus>(initialData?.status || POStatus.PENDING);
  const [priority, setPriority] = useState<POPriority>(initialData?.priority || POPriority.MEDIUM);
  const [amount, setAmount] = useState(initialData?.totalAmount || 0);

  // Auto-calculate Due Date (Delivery Date) when PO Date changes (Default +45 days lead time)
  useEffect(() => {
    if (creationDate && !initialData) {
      const date = new Date(creationDate);
      date.setDate(date.getDate() + 45);
      setDeliveryDate(date.toISOString().split('T')[0]);
    }
  }, [creationDate, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      vendor,
      poNumber,
      creationDate,
      approveDate,
      deliveryDate,
      status,
      priority,
      totalAmount: amount,
      items: [], 
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-slate-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-600">
          <h3 className="text-lg font-bold text-white">{initialData ? 'Edit Order' : 'New Purchase Order'}</h3>
          <button onClick={onCancel} className="text-indigo-100 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">PO Number</label>
            <input 
              required
              value={poNumber}
              onChange={e => setPoNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-shadow" 
              placeholder="PO-2024-XXXX"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vendor / Supplier</label>
            <input 
              required
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              placeholder="Company Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">PO Date</label>
              <input 
                type="date"
                required
                value={creationDate}
                onChange={e => setCreationDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Approve Date</label>
              <input 
                type="date"
                value={approveDate}
                onChange={e => setApproveDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Due Date (Auto)</label>
              <input 
                type="date"
                required
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              />
            </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value as POStatus)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                >
                  {Object.values(POStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Price</label>
              <input 
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as POPriority)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
              >
                {Object.values(POPriority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm shadow-md transition-all active:scale-95"
            >
              Save Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POForm;
