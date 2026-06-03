'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';

interface RevenueData {
  month: string;
  posRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
}

interface Props {
  data: RevenueData[];
}

export function RevenueChart({ data }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-hairline)] p-3 rounded-lg shadow-xl">
          <p className="font-bold text-[var(--color-ink)] mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex justify-between gap-4 text-[13px] mb-1">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-semibold text-[var(--color-ink)]">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#888', fontSize: 12 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `Rp${value / 1000}K`}
            tick={{ fill: '#888', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar 
            dataKey="posRevenue" 
            name="Pendapatan Kasir" 
            stackId="a" 
            fill="#3b82f6" 
            radius={[0, 0, 4, 4]} 
          />
          <Bar 
            dataKey="subscriptionRevenue" 
            name="Pendapatan Paket" 
            stackId="a" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
          />
          <Line 
            type="monotone" 
            dataKey="totalRevenue" 
            name="Total Pendapatan" 
            stroke="#f59e0b" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#f59e0b' }} 
            activeDot={{ r: 6 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
