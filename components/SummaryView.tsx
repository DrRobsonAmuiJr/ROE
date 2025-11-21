import React, { useMemo } from 'react';
import type { BusinessData, DayData, FinancialData, MonthlyFinancialData, ProspectionsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import GoogleRatingCard from './GoogleRatingCard';


interface SummaryViewProps {
  businessData: BusinessData;
  financialData: FinancialData;
  monthlyFinancialData: MonthlyFinancialData;
  prospectionsData: ProspectionsData;
}

interface MonthlyTotals {
  patients: number;
  revenue: number;
  docs: number;
  tomos: number;
  ticketMedio: number;
}

interface MonthlyFinancialTotals {
  monthlyRevenue: number;
  monthlyProfit: number;
  dividends: number;
  monthlyReserve: number;
}

interface YearlySummary {
  [month: string]: MonthlyTotals;
  total: MonthlyTotals;
}

interface YearlyMonthlyFinancialSummary {
  [month: string]: MonthlyFinancialTotals;
  total: MonthlyFinancialTotals;
}

interface YearlyProspectionsSummary {
    [month: string]: { prospections: number };
    total: { prospections: number };
}

const MONTH_NAMES_FULL = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

const SummaryView: React.FC<SummaryViewProps> = ({ businessData, financialData, monthlyFinancialData, prospectionsData }) => {
  const summaryData = useMemo(() => {
    const summary: { [year: string]: YearlySummary } = {};

    Object.keys(businessData).forEach(year => {
      summary[year] = { total: { patients: 0, revenue: 0, docs: 0, tomos: 0, ticketMedio: 0 } };
      for (let i = 1; i <= 12; i++) {
        const month = String(i).padStart(2, '0');
        summary[year][month] = { patients: 0, revenue: 0, docs: 0, tomos: 0, ticketMedio: 0 };
      }

      Object.keys(businessData[year]).forEach(month => {
        const monthData = businessData[year][month];
        if (monthData.days) {
          Object.values(monthData.days).forEach((dayData: DayData) => {
            summary[year][month].patients += dayData.patients || 0;
            summary[year][month].revenue += dayData.revenue || 0;
            summary[year][month].docs += dayData.docs || 0;
            summary[year][month].tomos += dayData.tomos || 0;
            
            summary[year].total.patients += dayData.patients || 0;
            summary[year].total.revenue += dayData.revenue || 0;
            summary[year].total.docs += dayData.docs || 0;
            summary[year].total.tomos += dayData.tomos || 0;
          });
        }
      });
    });
    
    // Calculate Average Ticket
    Object.keys(summary).forEach(year => {
        for (let i = 1; i <= 12; i++) {
            const month = String(i).padStart(2, '0');
            const monthTotals = summary[year][month];
            monthTotals.ticketMedio = monthTotals.patients > 0 ? (monthTotals.revenue / monthTotals.patients) : 0;
        }
        const totalTotals = summary[year].total;
        totalTotals.ticketMedio = totalTotals.patients > 0 ? (totalTotals.revenue / totalTotals.patients) : 0;
    });

    return summary;
  }, [businessData]);

  const monthlySummaryData = useMemo(() => {
    const summary: { [year: string]: YearlyMonthlyFinancialSummary } = {};

    Object.keys(monthlyFinancialData).forEach(year => {
      summary[year] = { total: { monthlyRevenue: 0, monthlyProfit: 0, dividends: 0, monthlyReserve: 0 } };
      for (let i = 1; i <= 12; i++) {
        const month = String(i).padStart(2, '0');
        summary[year][month] = { monthlyRevenue: 0, monthlyProfit: 0, dividends: 0, monthlyReserve: 0 };
      }

      Object.keys(monthlyFinancialData[year]).forEach(month => {
        const monthData = monthlyFinancialData[year][month];
        summary[year][month].monthlyRevenue = monthData.monthlyRevenue || 0;
        summary[year][month].monthlyProfit = monthData.monthlyProfit || 0;
        summary[year][month].dividends = monthData.dividends || 0;
        summary[year][month].monthlyReserve = monthData.monthlyReserve || 0;

        summary[year].total.monthlyRevenue += monthData.monthlyRevenue || 0;
        summary[year].total.monthlyProfit += monthData.monthlyProfit || 0;
        summary[year].total.dividends += monthData.dividends || 0;
        summary[year].total.monthlyReserve += monthData.monthlyReserve || 0;
      });
    });
    return summary;
  }, [monthlyFinancialData]);

  const financialSummary = useMemo(() => {
    const summary: { [year: string]: any } = {};
    const sortedYears = Object.keys(financialData).sort((a, b) => a.localeCompare(b));

    sortedYears.forEach(year => {
        const annualFinancials = financialData[year];
        if (!annualFinancials) return;

        const faturamento = summaryData[year]?.total.revenue || 0;
        
        const despesas = annualFinancials.rh + annualFinancials.maintenance + annualFinancials.material + annualFinancials.marketing + annualFinancials.operational;
        const investimentos = annualFinancials.equipment;
        const impostos = annualFinancials.taxes;
        const resultadoEbitda = faturamento - despesas;
        const lucro = resultadoEbitda - annualFinancials.interest - impostos;
        const dividendos = annualFinancials.dividendsReal;
        const sobras = lucro - dividendos;
        const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;

        summary[year] = {
            despesas,
            investimentos,
            impostos,
            resultadoEbitda,
            lucro,
            dividendos,
            sobras,
            margem,
        };
    });

    return summary;
  }, [financialData, summaryData]);

  const prospectionsSummary = useMemo(() => {
    const summary: { [year: string]: YearlyProspectionsSummary } = {};

    prospectionsData.forEach(p => {
        const meetingDate = new Date(p.meetingDate + 'T00:00:00'); // Treat date as local
        const year = String(meetingDate.getFullYear());
        const month = String(meetingDate.getMonth() + 1).padStart(2, '0');

        if (!summary[year]) {
            summary[year] = { total: { prospections: 0 } };
            for (let i = 1; i <= 12; i++) {
                const m = String(i).padStart(2, '0');
                // @ts-ignore
                summary[year][m] = { prospections: 0 };
            }
        }
        
        // @ts-ignore
        summary[year][month].prospections += 1;
        summary[year].total.prospections += 1;
    });

    return summary;
  }, [prospectionsData]);


  const sortedYears = useMemo(() => {
    const allYears = new Set([...Object.keys(summaryData), ...Object.keys(monthlySummaryData), ...Object.keys(prospectionsSummary)]);
    return Array.from(allYears).sort((a, b) => a.localeCompare(b));
  }, [summaryData, monthlySummaryData, prospectionsSummary]);


  const annualChartData = useMemo(() => {
    return sortedYears.map(year => ({
      year,
      Faturamento: summaryData[year]?.total.revenue || 0,
      'Ticket Médio': summaryData[year]?.total.ticketMedio || 0,
      Pacientes: summaryData[year]?.total.patients || 0,
      Docs: summaryData[year]?.total.docs || 0,
      Tomos: summaryData[year]?.total.tomos || 0,
      'Receita (Conciliado)': monthlySummaryData[year]?.total.monthlyRevenue || 0,
      'Lucro (Conciliado)': monthlySummaryData[year]?.total.monthlyProfit || 0,
      'Dividendos': monthlySummaryData[year]?.total.dividends || 0,
      'Reserva': monthlySummaryData[year]?.total.monthlyReserve || 0,
      'Prospecções': prospectionsSummary[year]?.total.prospections || 0,
    }));
  }, [summaryData, monthlySummaryData, prospectionsSummary, sortedYears]);


  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatNumber = (value: number) => {
    return value > 0 ? value.toLocaleString('pt-BR') : '-';
  };
  
  const formatCurrencyCell = (value: number) => {
    return value > 0 ? formatCurrency(value) : 'R$ -';
  };
  
  const formatAxisTick = (tickItem: number, isCurrency = false) => {
     const prefix = isCurrency ? 'R$' : '';
     if (tickItem >= 1000000) return `${prefix}${(tickItem / 1000000).toFixed(1)}M`;
     if (tickItem >= 1000) return `${prefix}${(tickItem / 1000).toFixed(0)}k`;
     return `${prefix}${tickItem}`;
  }
  
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="font-bold">{`Ano: ${label}`}</p>
          <p className="text-sm" style={{color: payload[0].fill}}>
            {`${payload[0].name}: ${formatter(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderTable = (
    title: string, 
    dataKey: string, 
    formatter: (value: number) => string,
    dataSource: { [year: string]: any }
  ) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">ANO</th>
              {MONTH_NAMES_FULL.map(monthName => (
                <th key={monthName} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">{monthName}</th>
              ))}
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedYears.map(year => (
              <tr key={year}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">{year}</td>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = String(i + 1).padStart(2, '0');
                  const value = dataSource[year]?.[month]?.[dataKey] || 0;
                  return <td key={month} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center border-r">{formatter(value)}</td>;
                })}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-bold text-center">{formatter(dataSource[year]?.total?.[dataKey] || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const formatLabelValue = (value: number, isCurrency: boolean) => {
    if (value === 0) return '';
    const prefix = isCurrency ? 'R$' : '';
    if (Math.abs(value) >= 1000000) return `${prefix}${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${prefix}${(value / 1000).toFixed(0)}k`;
    return isCurrency ? formatCurrency(value) : formatNumber(value);
  };

  const renderAnnualChart = (
    title: string,
    dataKey: string,
    fillColor: string,
    isCurrency: boolean = false
  ) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={annualChartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(tick) => formatAxisTick(tick, isCurrency)} tick={{ fontSize: 12 }} width={80} />
            <Tooltip content={<CustomTooltip formatter={isCurrency ? formatCurrency : formatNumber} />} />
            <Legend />
            <Bar dataKey={dataKey} fill={fillColor} name={dataKey} radius={[4, 4, 0, 0]}>
              <LabelList dataKey={dataKey} position="top" formatter={(value: number) => formatLabelValue(value, isCurrency)} fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
        {/* KPIs - Qualidade */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">KPIs - Qualidade:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <GoogleRatingCard />
            </div>
        </div>

        {/* KPIs - Produtividade */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">KPIs - Produtividade:</h2>
            <div className="space-y-8">
                {renderTable('Número de Pacientes Atendidos', 'patients', formatNumber, summaryData)}
                {renderTable('Número de Docs', 'docs', formatNumber, summaryData)}
                {renderTable('Número de Tomos', 'tomos', formatNumber, summaryData)}
            </div>
        </div>

        {/* KPIs - Financeiro */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">KPIs - Financeiro:</h2>
            <div className="space-y-8">
                {renderTable('Faturamento Mensal', 'revenue', formatCurrencyCell, summaryData)}
                {renderTable('Análise de Ticket Médio', 'ticketMedio', formatCurrencyCell, summaryData)}
                {renderTable('Receita Mensal (Conciliado)', 'monthlyRevenue', formatCurrencyCell, monthlySummaryData)}
                {renderTable('Lucro Mensal (Conciliado)', 'monthlyProfit', formatCurrencyCell, monthlySummaryData)}
                {renderTable('Dividendos Dr Robson Jr (Mensal)', 'dividends', formatCurrencyCell, monthlySummaryData)}
                {renderTable('Reserva Mensal', 'monthlyReserve', formatCurrencyCell, monthlySummaryData)}

                {Object.keys(financialSummary).length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-bold mb-4 text-gray-800">Resumo Financeiro Anual</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">ANO</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Despesas</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Investimentos</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Impostos</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Resultado (Ebitda)</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Lucro</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Dividendos Dr Robson Jr</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Sobras</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Margem (%)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.keys(financialSummary).map(year => (
                                    <tr key={year}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">{year}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center border-r">{formatCurrency(financialSummary[year].despesas)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center border-r">{formatCurrency(financialSummary[year].investimentos)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center border-r">{formatCurrency(financialSummary[year].impostos)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center border-r">{formatCurrency(financialSummary[year].resultadoEbitda)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center border-r">{formatCurrency(financialSummary[year].lucro)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center border-r">{formatCurrency(financialSummary[year].dividendos)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center border-r">{formatCurrency(financialSummary[year].sobras)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{financialSummary[year].margem.toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                    </div>
                )}
            </div>
        </div>

        {/* KPIs - Comercial */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">KPIs - Comercial:</h2>
            <div className="space-y-8">
                {renderTable('Número de Prospecções', 'prospections', formatNumber, prospectionsSummary)}
            </div>
        </div>

        {annualChartData.length > 0 && (
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Evolução Anual</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {renderAnnualChart('Evolução Anual do Faturamento', 'Faturamento', '#4f46e5', true)}
                    {renderAnnualChart('Evolução Anual do Ticket Médio', 'Ticket Médio', '#818cf8', true)}
                    {renderAnnualChart('Evolução Anual de Pacientes', 'Pacientes', '#10b981', false)}
                    {renderAnnualChart('Evolução Anual de Docs', 'Docs', '#f59e0b', false)}
                    {renderAnnualChart('Evolução Anual de Tomos', 'Tomos', '#ef4444', false)}
                    {renderAnnualChart('Evolução Anual de Prospecções', 'Prospecções', '#a855f7', false)}
                    {renderAnnualChart('Evolução Anual da Receita (Conciliado)', 'Receita (Conciliado)', '#6366f1', true)}
                    {renderAnnualChart('Evolução Anual do Lucro (Conciliado)', 'Lucro (Conciliado)', '#34d399', true)}
                    {renderAnnualChart('Evolução Anual de Dividendos', 'Dividendos', '#fbbf24', true)}
                    {renderAnnualChart('Evolução Anual da Reserva', 'Reserva', '#f87171', true)}
                </div>
            </div>
        )}
    </div>
  );
};

export default SummaryView;