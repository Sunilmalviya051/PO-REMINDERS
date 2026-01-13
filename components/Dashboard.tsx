
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { PurchaseOrder, POStatus, POPriority } from '../types';

interface DashboardProps {
  pos: PurchaseOrder[];
}

const Dashboard: React.FC<DashboardProps> = ({ pos }) => {
  const totalAmount = pos.reduce((sum, po) => sum + po.totalAmount, 0);
  const overdueCount = pos.filter(po => po.status === POStatus.OVERDUE).length;
  const highPriorityCount = pos.filter(po => po.priority === POPriority.HIGH).length;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pipeline</p>
          <p className="text-2xl font-black text-slate-800">${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <div className="mt-2 text-xs text-slate-500 flex items-center">
            <span className="text-emerald-500 font-bold mr-1">↑ 12%</span> vs last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">High Priority</p>
          <p className="text-2xl font-black text-rose-600">{highPriorityCount}</p>
          <div className="mt-2 text-xs text-slate-500">Requires immediate attention</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue Orders</p>
          <p className="text-2xl font-black text-red-600">{overdueCount}</p>
          <div className="mt-2 text-xs text-slate-500">Action required</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Volume</p>
          <p className="text-2xl font-black text-indigo-600">{pos.length}</p>
          <div className="mt-2 text-xs text-slate-500">Total Purchase Orders</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Operational Breakdown</h3>
            <span className="text-xs text-slate-400 font-medium italic">PO Count by Status</span>
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
