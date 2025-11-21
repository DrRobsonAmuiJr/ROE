import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PartnerDetailsData } from '../types';

interface DentistPerformanceChartProps {
  dentistName: string;
  partnerDetailsData: PartnerDetailsData;
  period1Start: string;
  period1End: string;
  period2Start: string;
  period2End: string;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatYAxis = (tickItem: number) => {
    if (Math.abs(tickItem) >= 1000) return `R$${(tickItem / 1000).toLocaleString('pt-BR')}k`;
    return `R$${tickItem.toLocaleString('pt-BR')}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="font-bold">{label}</p>
          {payload.map((pld: any) => (
             <p key={pld.dataKey} className="text-sm" style={{color: pld.stroke}}>
               {`${pld.name}: ${formatCurrency(pld.value)}`}
             </p>
          ))}
        </div>
      );
    }
    return null;
};


const DentistPerformanceChart: React.FC<DentistPerformanceChartProps> = ({
  dentistName,
  partnerDetailsData,
  period1Start,
  period1End,
  period2Start,
  period2End,
}) => {

  const monthlyComparisonData = useMemo(() => {
    const aggregateByMonth = (startStr: string, endStr: string) => {
        const monthlyTotals: { [month: string]: number } = {}; // key is "01", "02",... "12"
        const startDate = new Date(`${startStr}T00:00:00`);
        const endDate = new Date(`${endStr}T23:59:59`);
    
        Object.entries(partnerDetailsData).forEach(([year, monthsData]) => {
          Object.entries(monthsData).forEach(([month, records]) => {
            const recordDate = new Date(parseInt(year), parseInt(month) - 1, 15);
            if (recordDate >= startDate && recordDate <= endDate) {
              records.forEach(record => {
                if (record.dentistName === dentistName) {
                  const monthKey = month.padStart(2, '0');
                  if (!monthlyTotals[monthKey]) {
                    monthlyTotals[monthKey] = 0;
                  }
                  monthlyTotals[monthKey] += record.examValue;
                }
              });
            }
          });
        });
        return monthlyTotals;
      };

    const period1Totals = aggregateByMonth(period1Start, period1End);
    const period2Totals = aggregateByMonth(period2Start, period2End);
    
    const p1Label = 'Período 1';
    const p2Label = 'Período 2';
    
    return MONTH_NAMES.map((monthName, index) => {
        const monthKey = String(index + 1).padStart(2, '0');
        return {
            month: monthName,
            [p1Label]: period1Totals[monthKey] || 0,
            [p2Label]: period2Totals[monthKey] || 0,
        };
    });
  }, [dentistName, partnerDetailsData, period1Start, period1End, period2Start, period2End]);

  const annualEvolutionData = useMemo(() => {
    const yearlyTotals: { [year: string]: number } = {};
    Object.entries(partnerDetailsData).forEach(([year, monthsData]) => {
      let yearTotal = 0;
      Object.values(monthsData).forEach(records => {
        records.forEach(record => {
          if (record.dentistName === dentistName) {
            yearTotal += record.examValue;
          }
        });
      });
      if (yearTotal > 0) {
        yearlyTotals[year] = yearTotal;
      }
    });

    return Object.entries(yearlyTotals)
      .map(([year, total]) => ({ year, total }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [dentistName, partnerDetailsData]);
  
  const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
  }

  return (
    <div className="space-y-8 mt-8 pt-8 border-t">
      <h3 className="text-xl font-bold text-gray-800">Análise de: <span className="text-indigo-600">{dentistName}</span></h3>
      
      {/* Monthly Chart */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-700 mb-1">Comparativo Mensal</h4>
        <p className="text-sm text-gray-500 mb-4">
            Período 1 ({formatDate(period1Start)} a {formatDate(period1End)}) vs. Período 2 ({formatDate(period2Start)} a {formatDate(period2End)})
        </p>
         <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyComparisonData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Período 1" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Período 2" stroke="#a5b4fc" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Annual Chart */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Evolução Anual</h4>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={annualEvolutionData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="total" name="Faturamento Anual" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DentistPerformanceChart;