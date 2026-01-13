
import React, { useState, useMemo, useEffect } from 'react';
import { PurchaseOrder, POStatus, POAppNotification } from './types';
import { MOCK_POS, STATUS_COLORS, URGENCY_LABELS, URGENCY_COLORS } from './constants';
import Dashboard from './components/Dashboard';
import POForm from './components/POForm';
import AIAssistant from './components/AIAssistant';
import ImportZone from './components/ImportZone';
import NotificationPanel from './components/NotificationPanel';
import ReminderModal from './components/ReminderModal';

type DateFilterTarget = 'creationDate' | 'approveDate' | 'deliveryDate';

const App: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('sentinel_pos');
    return saved ? JSON.parse(saved) : MOCK_POS;
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPo, setEditingPo] = useState<PurchaseOrder | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<POStatus | 'All'>('All');
  const [filterUrgency, setFilterUrgency] = useState<string | 'All'>('All');
  const [filterItemCode, setFilterItemCode] = useState<string | 'All'>('All');
  
  // Reminder States
  const [isReminderDue, setIsReminderDue] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [lastReminderDate, setLastReminderDate] = useState<string>(() => localStorage.getItem('last_reminder_date') || '');

  // Notification States
  const [notifications, setNotifications] = useState<POAppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasNotifPermission, setHasNotifPermission] = useState(false);

  // Date Range Filter States
  const [dateFilterType, setDateFilterType] = useState<DateFilterTarget>('creationDate');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Persist data
  useEffect(() => {
    localStorage.setItem('sentinel_pos', JSON.stringify(pos));
  }, [pos]);

  // Automated Reminder Logic: Mon-Sat, after 9:30 AM
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun, 1=Mon...6=Sat
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];

      const isWorkingDay = day >= 1 && day <= 6; // Mon-Sat
      const isAfterTime = (hours > 9) || (hours === 9 && minutes >= 30);
      const notSentToday = lastReminderDate !== todayStr;

      if (isWorkingDay && isAfterTime && notSentToday) {
        setIsReminderDue(true);
      } else {
        setIsReminderDue(false);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastReminderDate]);

  const markReminderAsSent = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('last_reminder_date', todayStr);
    setLastReminderDate(todayStr);
    setIsReminderDue(false);
    setIsReminderModalOpen(false);
  };

  // Browser Notification Request
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setHasNotifPermission(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          setHasNotifPermission(permission === "granted");
        });
      }
    }
  }, []);

  const formatDisplayDate = (dateInput: any) => {
    if (dateInput === undefined || dateInput === null || String(dateInput).trim() === '') return '-';
    let date: Date;
    try {
      const dateStr = String(dateInput).trim();
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            const [y, m, d] = parts;
            return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
          }
          if (parts[2].length === 2) {
            const [d, m, y] = parts;
            return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-20${y}`;
          }
        }
      }
      if (!isNaN(Number(dateStr)) && Number(dateStr) > 25569) {
        date = new Date((Number(dateStr) - 25569) * 86400 * 1000);
      } else {
        date = new Date(dateStr);
      }
      if (isNaN(date.getTime())) return dateStr;
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    } catch (e) {
      return String(dateInput);
    }
  };

  const getCalculatedPO = (po: PurchaseOrder) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(po.creationDate);
    orderDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - orderDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let urgency = URGENCY_LABELS.NEW;
    let status = po.status;

    if (diffDays >= 365) urgency = URGENCY_LABELS.PO_1Y_DUE;
    else if (diffDays >= 240) urgency = URGENCY_LABELS.PO_8M_DUE;
    else if (diffDays >= 180) urgency = URGENCY_LABELS.PO_6M_DUE;
    else if (diffDays >= 120) urgency = URGENCY_LABELS.PO_4M_DUE_ACTIONS;
    else if (diffDays >= 90) urgency = URGENCY_LABELS.PO_3M_DUE_ACTION;
    else if (diffDays >= 45) urgency = URGENCY_LABELS.PO_1_5M_DUE_ACTION_MEDIUM;
    else if (diffDays > 30) urgency = URGENCY_LABELS.OVERDUE;
    else if (diffDays >= 21) urgency = URGENCY_LABELS.DUE;
    else if (diffDays >= 11) urgency = URGENCY_LABELS.MEDIUM_DUE;
    else if (diffDays >= 9) urgency = URGENCY_LABELS.LATEST;
    else urgency = URGENCY_LABELS.NEW;

    if (diffDays > 30 && status !== POStatus.DELIVERED && status !== POStatus.CANCELLED) {
      status = POStatus.OVERDUE;
    }

    return { ...po, status, calculatedUrgency: urgency, age: diffDays };
  };

  const processedPOs = useMemo(() => pos.map(getCalculatedPO), [pos]);

  const uniqueItemCodes = useMemo(() => {
    const codes = new Set<string>();
    pos.forEach(po => { if (po.itemCode) codes.add(po.itemCode); });
    return Array.from(codes).sort();
  }, [pos]);

  useEffect(() => {
    const newNotifications: POAppNotification[] = [];
    processedPOs.forEach(po => {
      const isCritical = [
        URGENCY_LABELS.PO_1Y_DUE, 
        URGENCY_LABELS.PO_8M_DUE, 
        URGENCY_LABELS.PO_6M_DUE, 
        URGENCY_LABELS.PO_4M_DUE_ACTIONS, 
        URGENCY_LABELS.PO_3M_DUE_ACTION
      ].includes(po.calculatedUrgency);
      
      if (po.status === POStatus.OVERDUE || isCritical) {
        newNotifications.push({
          id: `${po.calculatedUrgency}-${po.id}`,
          poId: po.id,
          poNumber: po.poNumber,
          title: `Critical Alert: ${po.calculatedUrgency}`,
          message: `${po.vendor}'s order age is ${po.age} days.`,
          type: 'critical',
          timestamp: Date.now(),
          isRead: false
        });
      }
    });

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));
      if (filteredNew.length === 0) return prev;
      return [...filteredNew, ...prev].slice(0, 50);
    });
  }, [processedPOs]);

  const filteredPOs = useMemo(() => {
    return processedPOs.filter(po => {
      const matchesSearch = po.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (po.itemCode && po.itemCode.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'All' || po.status === filterStatus;
      const matchesUrgency = filterUrgency === 'All' || po.calculatedUrgency === filterUrgency;
      const matchesItemCode = filterItemCode === 'All' || po.itemCode === filterItemCode;
      
      let matchesDateRange = true;
      const targetDateStr = po[dateFilterType];
      if (startDate || endDate) {
        if (!targetDateStr) {
          matchesDateRange = false;
        } else {
          const targetDate = new Date(targetDateStr).getTime();
          if (startDate) {
            const start = new Date(startDate).getTime();
            if (targetDate < start) matchesDateRange = false;
          }
          if (endDate) {
            const end = new Date(endDate).getTime();
            const endInclusive = end + (24 * 60 * 60 * 1000) - 1;
            if (targetDate > endInclusive) matchesDateRange = false;
          }
        }
      }
      return matchesSearch && matchesStatus && matchesUrgency && matchesItemCode && matchesDateRange;
    }).sort((a, b) => b.age - a.age);
  }, [processedPOs, searchTerm, filterStatus, filterUrgency, filterItemCode, dateFilterType, startDate, endDate]);

  const handleSavePO = (data: Omit<PurchaseOrder, 'id'>) => {
    if (editingPo) {
      setPos(prev => prev.map(p => p.id === editingPo.id ? { ...data, id: editingPo.id } : p));
    } else {
      const newPO: PurchaseOrder = { ...data, id: Math.random().toString(36).substr(2, 9) };
      setPos(prev => [newPO, ...prev]);
    }
    setIsFormOpen(false);
    setEditingPo(undefined);
  };

  const handleImport = (newPOs: Omit<PurchaseOrder, 'id'>[]) => {
    const formattedPOs = newPOs.map(po => ({ ...po, id: Math.random().toString(36).substr(2, 9) }));
    setPos(prev => [...formattedPOs, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this purchase order?')) {
      setPos(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleReset = () => {
    if (window.confirm('WARNING: Permanent system reset. Proceed?')) {
      setPos([]);
      localStorage.removeItem('sentinel_pos');
      window.location.reload(); 
    }
  };

  const clearDateFilters = () => { setStartDate(''); setEndDate(''); };
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">Purchase order</h1>
              <span className="text-lg font-black text-indigo-600 uppercase tracking-tight">REMINDER</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ImportZone onImport={handleImport} />
            
            {/* Reminder Pulsing Button */}
            <button 
              onClick={() => setIsReminderModalOpen(true)}
              className={`relative p-2 rounded-xl transition-all ${isReminderDue ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-500 ring-offset-2 animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
              title="Daily Reminder Service"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              {isReminderDue && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>}
            </button>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            
            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
              </button>
              {isNotifOpen && (
                <NotificationPanel 
                  notifications={notifications}
                  onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
                  onClearAll={() => setNotifications([])}
                  onClose={() => setIsNotifOpen(false)}
                />
              )}
            </div>
            <button onClick={() => { setEditingPo(undefined); setIsFormOpen(true); }} className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm shadow-md transition-all active:scale-95 ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Add PO</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Dashboard pos={processedPOs} />
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Pipeline Management</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Age calculation from Order Date</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-3 py-2 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 font-bold text-[11px] uppercase tracking-wider transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  <span>Purge Data</span>
                </button>
                <div className="h-6 w-px bg-slate-100 mx-1"></div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </span>
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none text-sm w-full md:w-64 transition-all" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4 px-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgency:</span>
                    <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                      <option value="All">All Tiers</option>
                      {Object.values(URGENCY_LABELS).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                      <option value="All">All Status</option>
                      {Object.values(POStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Code:</span>
                    <select value={filterItemCode} onChange={e => setFilterItemCode(e.target.value)} className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 max-w-[150px]">
                      <option value="All">All Codes</option>
                      {uniqueItemCodes.map(code => <option key={code} value={code}>{code}</option>)}
                    </select>
                  </div>
               </div>
               <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <select value={dateFilterType} onChange={e => setDateFilterType(e.target.value as DateFilterTarget)} className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700">
                    <option value="creationDate">Order Date</option>
                    <option value="deliveryDate">Due Date</option>
                  </select>
                  <div className="flex items-center space-x-1">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-700" />
                    <span className="text-slate-300">-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-700" />
                  </div>
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] sticky top-0">
                <tr>
                  <th className="px-6 py-4">PO Number</th>
                  <th className="px-6 py-4">Urgency</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4">Item Code</th>
                  <th className="px-6 py-4 text-right">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPOs.length > 0 ? filteredPOs.map((po) => (
                  <tr key={po.id} className={`hover:bg-slate-50/30 transition-colors group ${po.status === POStatus.OVERDUE ? 'bg-rose-50/50' : ''}`}>
                    <td className="px-6 py-4"><div className="text-sm font-black text-slate-800">{po.poNumber}</div></td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase border shadow-sm ${URGENCY_COLORS[po.calculatedUrgency]}`}>{po.calculatedUrgency}</span></td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_COLORS[po.status]}`}>{po.status}</span></td>
                    <td className="px-6 py-4"><div className="text-xs font-bold text-slate-600">{formatDisplayDate(po.creationDate)}</div></td>
                    <td className="px-6 py-4"><div className="text-xs font-black text-indigo-600">{formatDisplayDate(po.deliveryDate)}</div></td>
                    <td className="px-6 py-4"><div className="text-sm font-bold text-slate-700">{po.vendor}</div></td>
                    <td className="px-6 py-4"><div className="text-xs font-mono text-slate-500">{po.itemCode || '-'}</div></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingPo(po); setIsFormOpen(true); }} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                        <button onClick={() => handleDelete(po.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="px-6 py-20 text-center"><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {isFormOpen && (<POForm onSave={handleSavePO} onCancel={() => setIsFormOpen(false)} initialData={editingPo} />)}
      {isReminderModalOpen && (<ReminderModal pos={processedPOs} onSent={markReminderAsSent} onCancel={() => setIsReminderModalOpen(false)} />)}
      
      <AIAssistant pos={processedPOs} />
      <footer className="mt-auto py-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Purchase order REMINDER OS v2.0</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
