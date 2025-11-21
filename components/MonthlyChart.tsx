
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyChartProps {
  data: { month: string; [key: string]: any }[];
  dataKey: string;
  fillColor: string;
  format?: 'currency' | 'number';
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data, dataKey, fillColor, format = 'number' }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = format === 'currency'
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : value.toLocaleString('pt-BR');
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="font-bold">{`${label}`}</p>
          <p className="text-sm" style={{color: fillColor}}>{`${payload[0].name}: ${formattedValue}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const formatYAxis = (tickItem: number) => {
     if (format === 'currency') {
         if(tickItem >= 1000) return `R$${(tickItem/1000).toLocaleString('pt-BR')}k`;
         return `R$${tickItem.toLocaleString('pt-BR')}`;
     }
     if(tickItem >= 1000) return `${(tickItem/1000).toLocaleString('pt-BR')}k`;
     return tickItem.toLocaleString('pt-BR');
  }

  const legendName = dataKey.charAt(0).toUpperCase() + dataKey.slice(1);


  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={dataKey} name={legendName} fill={fillColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
