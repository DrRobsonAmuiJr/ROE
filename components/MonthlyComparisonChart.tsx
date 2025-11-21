import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

interface MonthlyComparisonChartProps {
  data: { month: string; [key: string]: any }[];
  dataKeyCurrent: string;
  dataKeyPrevious: string;
  nameCurrent: string;
  namePrevious: string;
  fillColorCurrent: string;
  fillColorPrevious: string;
  format?: 'currency' | 'number';
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ 
    data, 
    dataKeyCurrent, 
    dataKeyPrevious, 
    nameCurrent,
    namePrevious,
    fillColorCurrent, 
    fillColorPrevious,
    format = 'number' 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const formatValue = (value: number) => format === 'currency'
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : value.toLocaleString('pt-BR');

      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="font-bold">{label}</p>
          {payload.map((pld: any) => (
             <p key={pld.dataKey} className="text-sm" style={{color: pld.fill}}>
               {`${pld.name}: ${formatValue(pld.value)}`}
             </p>
          ))}
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

  const formatLabelValue = (value: number) => {
    if (value === 0) return '';
    const isCurrency = format === 'currency';
    const prefix = isCurrency ? 'R$' : '';
    
    if (Math.abs(value) >= 1000000) return `${prefix}${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${prefix}${(value / 1000).toFixed(0)}k`;
    
    return isCurrency 
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
        : value.toLocaleString('pt-BR');
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
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
          <Bar dataKey={dataKeyPrevious} name={namePrevious} fill={fillColorPrevious} radius={[4, 4, 0, 0]}>
            <LabelList dataKey={dataKeyPrevious} position="top" formatter={formatLabelValue} fontSize={10} />
          </Bar>
          <Bar dataKey={dataKeyCurrent} name={nameCurrent} fill={fillColorCurrent} radius={[4, 4, 0, 0]}>
            <LabelList dataKey={dataKeyCurrent} position="top" formatter={formatLabelValue} fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyComparisonChart;