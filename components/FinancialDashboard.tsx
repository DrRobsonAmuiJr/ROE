import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
// FIX: Import AnnualFinancials to properly type financial data objects.
import type { FinancialData, MonthlyFinancialData, MonthlyFinancials, AnnualFinancials } from '../types';
import StatCard from './StatCard';

interface FinancialDashboardProps {
  monthlyFinancialData: MonthlyFinancialData;
  financialData: FinancialData;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ monthlyFinancialData, financialData }) => {
  const availableYears = useMemo(() => {
    const years = new Set([...Object.keys(monthlyFinancialData), ...Object.keys(financialData)]);
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [monthlyFinancialData, financialData]);

  const [selectedYear, setSelectedYear] = useState<string>('');

  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
        setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const allYearsSummary = useMemo(() => {
    return availableYears.map(year => {
      // FIX: Explicitly type yearFinancialData as Partial<AnnualFinancials> to resolve property access errors.
      const yearFinancialData: Partial<AnnualFinancials> = financialData[year] || {};
      const yearMonthlyData = monthlyFinancialData[year] || {};

      // FIX: Explicitly type `month` as `MonthlyFinancials` to fix type inference issue with Object.entries on a union type.
      const totalRevenue = Object.entries(yearMonthlyData).reduce((acc, [, month]: [string, MonthlyFinancials]) => acc + Number(month.monthlyRevenue || 0), 0);
      const totalProfit = Object.entries(yearMonthlyData).reduce((acc, [, month]: [string, MonthlyFinancials]) => acc + Number(month.monthlyProfit || 0), 0);
      
      const totalExpenses = 
        Number(yearFinancialData.rh || 0) + 
        Number(yearFinancialData.maintenance || 0) + 
        Number(yearFinancialData.material || 0) + 
        Number(yearFinancialData.marketing || 0) + 
        Number(yearFinancialData.operational || 0);

      const dividendos = Number(yearFinancialData.dividendsReal || 0);
      const ebitda = totalRevenue - totalExpenses;
      const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const dividendPayoutRatio = totalProfit > 0 ? (dividendos / totalProfit) * 100 : 0;

      return {
        year,
        Receita: totalRevenue,
        Lucro: totalProfit,
        Despesas: totalExpenses,
        EBITDA: ebitda,
        'Margem EBITDA': ebitdaMargin,
        'Margem de Lucro': profitMargin,
        Dividendos: dividendos,
        'Dividend Payout Ratio': dividendPayoutRatio,
      };
    }).sort((a,b) => a.year.localeCompare(b.year)); // Sort ascending for charts
  }, [availableYears, financialData, monthlyFinancialData]);


  const selectedYearSummary = useMemo(() => {
    return allYearsSummary.find(d => d.year === selectedYear);
  }, [selectedYear, allYearsSummary]);
  
  const expenseBreakdownData = useMemo(() => {
    if (!selectedYear) return [];
    // FIX: Explicitly type yearData as Partial<AnnualFinancials> to resolve property access errors.
    const yearData: Partial<AnnualFinancials> = financialData[selectedYear] || {};

    return [
      { name: 'RH', value: Number(yearData.rh || 0) },
      { name: 'Manutenção', value: Number(yearData.maintenance || 0) },
      { name: 'Material', value: Number(yearData.material || 0) },
      { name: 'Marketing', value: Number(yearData.marketing || 0) },
      { name: 'Operacional', value: Number(yearData.operational || 0) },
      { name: 'Investimentos', value: Number(yearData.equipment || 0) },
    ].filter(item => item.value > 0);
  }, [selectedYear, financialData]);
  
  const monthlyChartData = useMemo(() => {
    if (!selectedYear) return [];
    const yearData = monthlyFinancialData[selectedYear] || {};

    return MONTH_NAMES.map((monthName, index) => {
      const monthKey = String(index + 1).padStart(2, '0');
      // FIX: Remove `|| {}` and use optional chaining `?.` for safe property access.
      const monthData = yearData[monthKey];
      return {
        month: monthName,
        Receita: Number(monthData?.monthlyRevenue || 0),
        Lucro: Number(monthData?.monthlyProfit || 0),
        Dividendos: Number(monthData?.dividends || 0),
        Reserva: Number(monthData?.monthlyReserve || 0),
      };
    });
  }, [selectedYear, monthlyFinancialData]);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatYAxis = (tickItem: number) => {
     if(Math.abs(tickItem) >= 1000) return `R$${(tickItem/1000).toLocaleString('pt-BR')}k`;
     return `R$${tickItem.toLocaleString('pt-BR')}`;
  }
  const formatPercentYAxis = (tickItem: number) => `${tickItem.toFixed(0)}%`;

  const formatLabel = (value: number, format: 'currency' | 'percent' | 'number') => {
    if (value === 0) return '';
    const prefix = format === 'currency' ? 'R$' : '';
    const suffix = format === 'percent' ? '%' : '';

    if (Math.abs(value) >= 1000000) {
        return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}`;
    }
    if (Math.abs(value) >= 1000) {
        return `${prefix}${(value / 1000).toFixed(0)}k${suffix}`;
    }
    return `${prefix}${value.toFixed(format === 'percent' ? 1 : 0)}${suffix}`;
  };

  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="font-bold">{label}</p>
          {payload.map((pld: any) => (
             <p key={pld.dataKey} className="text-sm" style={{color: pld.fill}}>
               {`${pld.name}: ${formatter(pld.value)}`}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (availableYears.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-gray-800">Painel Financeiro</h2>
        <p className="mt-4 text-gray-500">Não há dados financeiros disponíveis para exibir. Por favor, adicione lançamentos na aba 'Lançamentos'.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Painel Financeiro</h2>
        <div>
          <label htmlFor="financial-year-select" className="sr-only">Selecione o Ano</label>
          <select
            id="financial-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      
      {!selectedYearSummary ? (
         <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">Dados anuais e/ou mensais incompletos para o ano de {selectedYear}. Por favor, verifique os lançamentos na aba 'Lançamentos'.</p>
         </div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                <StatCard title="Receita Total" value={selectedYearSummary.Receita} format="currency" />
                <StatCard title="Lucro Total" value={selectedYearSummary.Lucro} format="currency" />
                <StatCard title="Despesas Totais" value={selectedYearSummary.Despesas} format="currency" />
                <StatCard title="Margem EBITDA" value={selectedYearSummary['Margem EBITDA']} format="percentage" />
                <StatCard title="Dividendos Pagos" value={selectedYearSummary.Dividendos} format="currency" />
                <StatCard title="Margem de Lucro" value={selectedYearSummary['Margem de Lucro']} format="percentage" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Receita vs. Lucro Mensal ({selectedYear})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyChartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} width={80} />
                            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                            <Legend />
                            <Bar dataKey="Receita" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="Receita" position="top" formatter={(v: number) => formatLabel(v, 'currency')} fontSize={10} />
                            </Bar>
                            <Bar dataKey="Lucro" fill="#10b981" radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="Lucro" position="top" formatter={(v: number) => formatLabel(v, 'currency')} fontSize={10} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribuição de Despesas ({selectedYear})</h3>
                    {expenseBreakdownData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseBreakdownData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {expenseBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Não há dados de despesas para exibir.</p>
                        </div>
                    )}
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Dividendos vs. Reserva Mensal ({selectedYear})</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyChartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} width={80} />
                        <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                        <Legend />
                        <Bar dataKey="Dividendos" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="Dividendos" position="top" formatter={(v: number) => formatLabel(v, 'currency')} fontSize={10} />
                        </Bar>
                        <Bar dataKey="Reserva" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                             <LabelList dataKey="Reserva" position="top" formatter={(v: number) => formatLabel(v, 'currency')} fontSize={10} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
      )}

      {allYearsSummary.length > 1 && (
        <div className="mt-8 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Comparativos Anuais</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo Financeiro Anual (Valores)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={allYearsSummary} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} width={80}/>
                            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                            <Legend />
                            <Bar dataKey="Receita" fill="#4f46e5">
                                <LabelList dataKey="Receita" position="top" formatter={(v: number) => formatLabel(v, 'currency')} fontSize={10} />
                            </Bar>
                            <Bar dataKey="Despesas" fill="#ef4444">
                                <LabelList dataKey="Despesas" position="top" formatter={(v: number) => formatLabel(v, 'currency')} fontSize={10} />
                            </Bar>
                            <Bar dataKey="EBITDA" fill="#f59e0b">
                                <LabelList dataKey="EBITDA" position="top" formatter={(v: number) => formatLabel(v, 'currency')} fontSize={10} />
                            </Bar>
                            <Bar dataKey="Lucro" fill="#10b981">
                                <LabelList dataKey="Lucro" position="top" formatter={(v: number) => formatLabel(v, 'currency')} fontSize={10} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo de Margens Anuais (%)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={allYearsSummary} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={formatPercentYAxis} tick={{ fontSize: 12 }} width={50} />
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                            <Legend />
                            <Bar dataKey="Margem EBITDA" fill="#f59e0b">
                                <LabelList dataKey="Margem EBITDA" position="top" formatter={(v: number) => formatLabel(v, 'percent')} fontSize={10} />
                            </Bar>
                            <Bar dataKey="Margem de Lucro" fill="#10b981">
                                <LabelList dataKey="Margem de Lucro" position="top" formatter={(v: number) => formatLabel(v, 'percent')} fontSize={10} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo Anual de Dividendos (%)</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={allYearsSummary} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                        <YAxis 
                            tickFormatter={formatPercentYAxis} 
                            tick={{ fontSize: 12 }} 
                            width={50} 
                            domain={[0, 'dataMax + 10']}
                        />
                        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                        <Legend />
                        <Bar dataKey="Dividend Payout Ratio" name="Dividendos / Lucro" fill="#8b5cf6">
                            <LabelList dataKey="Dividend Payout Ratio" position="top" formatter={(v: number) => formatLabel(v, 'percent')} fontSize={10} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;
