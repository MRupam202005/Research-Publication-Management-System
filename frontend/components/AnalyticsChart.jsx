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

export const SimpleBarChart = ({ data, xKey, yKey, color = '#3b82f6', title }) => (
  <div className="card-surface p-4 flex flex-col h-[350px]">
    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{title}</h3>
    <div className="flex-1 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false}/>
          <XAxis dataKey={xKey} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{fill: 'rgba(148, 163, 184, 0.05)'}}
            contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '13px'}}
            itemStyle={{color: color}}
          />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const SimpleLineChart = ({ data, xKey, yKey, color = '#10b981', title }) => (
  <div className="card-surface p-4 flex flex-col h-[350px]">
    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{title}</h3>
    <div className="flex-1 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false}/>
          <XAxis dataKey={xKey} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '13px'}}
            itemStyle={{color: color}}
          />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={{r: 4, fill: color, strokeWidth: 0}} activeDot={{r: 6}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);
