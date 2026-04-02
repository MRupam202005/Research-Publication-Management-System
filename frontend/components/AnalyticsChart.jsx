import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const SimpleBarChart = ({ data, xKey, yKey, color = '#3b82f6', title }) => {
  const gradientId = `colorUv-${title?.replace(/\s+/g, '')}`;
  
  return (
    <div className="card-surface p-5 flex flex-col h-[350px] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6 tracking-wide">{title}</h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                <stop offset="95%" stopColor={color} stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#475569" opacity={0.1} vertical={false}/>
            <XAxis dataKey={xKey} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} dy={10} />
            <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip 
              cursor={{fill: 'rgba(148, 163, 184, 0.05)'}}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                color: '#f8fafc', 
                fontSize: '13px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{color: '#f1f5f9', fontWeight: 600}}
            />
            <Bar dataKey={yKey} fill={`url(#${gradientId})`} radius={[6, 6, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SimpleLineChart = ({ data, xKey, yKey, color = '#10b981', title }) => {
  const gradientId = `colorLine-${title?.replace(/\s+/g, '')}`;

  return (
    <div className="card-surface p-5 flex flex-col h-[350px] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6 tracking-wide">{title}</h3>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#475569" opacity={0.1} vertical={false}/>
            <XAxis dataKey={xKey} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} dy={10} />
            <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                color: '#f8fafc', 
                fontSize: '13px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{color: '#f1f5f9', fontWeight: 600}}
            />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={color} 
              strokeWidth={4} 
              dot={{r: 4, fill: '#fff', stroke: color, strokeWidth: 2}} 
              activeDot={{r: 7, fill: color, stroke: '#fff', strokeWidth: 3}} 
              style={{ filter: `drop-shadow(0px 8px 10px ${color}33)` }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
