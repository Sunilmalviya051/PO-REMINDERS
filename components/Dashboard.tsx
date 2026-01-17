
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { PurchaseOrder, POStatus, POPriority } from '../types';

interface DashboardProps {
  pos: (PurchaseOrder & { age: number })[];
}

const Dashboard: React.FC<DashboardProps> = ({ pos }) => {
  const totalAmount = pos.reduce((sum, po) => sum + po.totalAmount, 0);
  const overdueCount = pos.filter(po => po.status === POStatus.OVERDUE).length;
  const highPriorityCount = pos.filter(po => po.priority === POPriority.HIGH).length;

  /**
   * Logic: Filter for Active POs (Not Delivered/Cancelled)
   * Sort by age (Descending) to find the absolute oldest.
   * Limit to exactly the top 10 items as requested.
   */
  const oldestActivePOs = pos
    .filter(po => po.status !== POStatus.DELIVERED && po.status !== POStatus.CANCELLED)
    .sort((a, b) => b.age - a.age)
    .slice(0, 10);

  const getMonthName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Returns abbreviated month name (Jan, Feb, Mar...)
      return date.toLocaleString('default', { month: 'short' });
    } catch (e) {
      return '';
    }
  };

  const statusData = Object.values(POStatus).map(status => ({
    name: status,
    value: pos.filter(po => po.status === status).length,
  })).filter(d => d.value > 0);

  const priorityData = Object.values(POPriority).map(p => ({
    name: p,
    value: pos.filter(po => po.priority === p).length,
  })).filter(d => d.value > 0);

  const STATUS_COLORS_MAP = {
    [POStatus.DRAFT]: '#94a3b8',
    [POStatus.PENDING]: '#f59e0b',
    [POStatus.APPROVED]: '#3b82f6',
    [POStatus.SHIPPED]: '#8b5cf6',
    [POStatus.DELIVERED]: '#10b981',
    [POStatus.OVERDUE]: '#ef4444',
    [POStatus.CANCELLED]: '#4b5563',
  };

  const PRIORITY_COLORS_MAP = {
    [POPriority.LOW]: '#10b981',
    [POPriority.MEDIUM]: '#f59e0b',
    [POPriority.HIGH]: '#ef4444',
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll-up {
          animation: scrollUp 15s linear infinite;
        }
        .animate-scroll-up:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Oldest PO Tracker - Auto-Scrolling Upwards */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col min-h-[160px] overflow-hidden">
          <div className="flex justify-between items-start mb-3 bg-white z-10 relative">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Top 10 Aged Orders</p>
              <p className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter">Live Sentinel Tracking</p>
            </div>
            <div className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </div>
          </div>
          
          <div className="relative flex-1 overflow-hidden">
            {oldestActivePOs.length > 0 ? (
              <div className="animate-scroll-up space-y-1 py-1">
                {/* Double the list for seamless infinite scroll appearance with 10 items */}
                {[...oldestActivePOs, ...oldestActivePOs].map((po, idx) => (
                  <div key={`${po.id}-${idx}`} className="flex justify-between items-center group py-1 border-b border-slate-50 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-black text-slate-800 truncate max-w-[110px]">
                        {po.poNumber}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {getMonthName(po.creationDate)} • {po.vendor.slice(0, 12)}...
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 block whitespace-nowrap">
                        {po.age} Days
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Operational Clear</p>
              </div>
            )}
            {/* Smooth edge gradients */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">High Priority</p>
          <p className="text-2xl font-black text-rose-600">{highPriorityCount}</p>
          <div className="mt-2 text-xs text-slate-500 font-medium uppercase tracking-tighter">Critical follow-ups</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue Orders</p>
          <p className="text-2xl font-black text-red-600">{overdueCount}</p>
          <div className="mt-2 text-xs text-slate-500 font-medium uppercase tracking-tighter">Aged 30+ days</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pipeline</p>
          <p className="text-2xl font-black text-indigo-600">${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <div className="mt-2 text-xs text-slate-500 font-medium uppercase tracking-tighter">Gross commitment</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Operational Breakdown</h3>
            <span className="text-xs text-slate-400 font-medium italic">Status volume</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS_MAP[entry.name as POStatus] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Priority Heatmap</h3>
          </div>
          <div className="h-64 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS_MAP[entry.name as POPriority]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-2">
              {priorityData.map((d, i) => (
                <div key={i} className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS_MAP[d.name as POPriority] }}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
