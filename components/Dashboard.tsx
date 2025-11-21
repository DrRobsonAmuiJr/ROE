import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { BusinessData, DayData, MonthData } from '../types';
import StatCard from './StatCard';
import ComparisonCard from './ComparisonCard';
import MonthlyComparisonChart from './MonthlyComparisonChart';

interface DashboardProps {
  data: BusinessData;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MONTH_NAMES_FULL = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];


// Mapeamento Types
interface MapeamentoRow {
    monthIndex: number;
    monthName: string;
    year1Revenue: number;
    year2Revenue: number;
    monthlyChange?: number;
    quarterlyChange?: number;
    semesterlyChange?: number;
    annualChange?: number;
}

// Mapeamento Helper Function
const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current / previous) - 1);
};


const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const currentJsDate = new Date();
  const currentYear = currentJsDate.getFullYear();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- Mapeamento State and Logic ---
  const availableYears = useMemo(() => Object.keys(data).sort((a, b) => parseInt(b) - parseInt(a)), [data]);
  const [year1, setYear1] = useState<string>(availableYears.length > 1 ? availableYears[1] : '');
  const [year2, setYear2] = useState<string>(availableYears.length > 0 ? availableYears[0] : '');

   useEffect(() => {
    // Set initial years for Mapeamento when data becomes available
    if (availableYears.length > 0 && !year2) {
      setYear2(availableYears[0]);
    }
    if (availableYears.length > 1 && !year1) {
      setYear1(availableYears[1]);
    }
  }, [availableYears, year1, year2]);


  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const calculateTotalsForPeriod = useCallback((start: string, end: string) => {
    let totalRevenue = 0;
    let totalPatients = 0;
    if (!start || !end) return { revenue: 0, patients: 0 };
    
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T23:59:59`);

    Object.keys(data).forEach(yearStr => {
      const year = parseInt(yearStr);
      Object.keys(data[yearStr]).forEach(monthStr => {
        const month = parseInt(monthStr);
        const monthData = data[yearStr][monthStr];
        if (monthData.days) {
          Object.keys(monthData.days).forEach(dayStr => {
            const day = parseInt(dayStr);
            const currentDate = new Date(year, month - 1, day);
            if (currentDate >= startDate && currentDate <= endDate) {
              totalRevenue += monthData.days[dayStr].revenue || 0;
              totalPatients += monthData.days[dayStr].patients || 0;
            }
          });
        }
      });
    });
    return { revenue: totalRevenue, patients: totalPatients };
  }, [data]);
  
  const currentMonthTotals = useMemo(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const start = firstDay.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    return calculateTotalsForPeriod(start, end);
  }, [calculateTotalsForPeriod]);
  
  const previousYearCurrentMonthTotals = useMemo(() => {
    const today = new Date();
    const todayLastYear = new Date(today);
    todayLastYear.setFullYear(today.getFullYear() - 1);
    
    const firstDayLastYear = new Date(todayLastYear.getFullYear(), todayLastYear.getMonth(), 1);

    const start = firstDayLastYear.toISOString().split('T')[0];
    const end = todayLastYear.toISOString().split('T')[0];
    
    return calculateTotalsForPeriod(start, end);
  }, [calculateTotalsForPeriod]);

  const yearToDateTotals = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const currentYTD = calculateTotalsForPeriod(
      startOfYear.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );

    const prevYear = currentYear - 1;
    const startOfPrevYear = new Date(prevYear, 0, 1);
    const todayLastYear = new Date(today);
    todayLastYear.setFullYear(prevYear);

    const previousYTD = calculateTotalsForPeriod(
      startOfPrevYear.toISOString().split('T')[0],
      todayLastYear.toISOString().split('T')[0]
    );

    const ticketMedioAtual = currentYTD.patients > 0 ? currentYTD.revenue / currentYTD.patients : 0;
    const ticketMedioAnterior = previousYTD.patients > 0 ? previousYTD.revenue / previousYTD.patients : 0;

    return { ticketMedioAtual, ticketMedioAnterior };
  }, [calculateTotalsForPeriod]);

  const periodComparisonData = useMemo(() => {
    if (!startDate || !endDate) return { current: { revenue: 0, patients: 0}, previous: { revenue: 0, patients: 0} };

    const currentPeriodTotals = calculateTotalsForPeriod(startDate, endDate);

    const prevStartDate = new Date(startDate);
    prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
    const prevEndDate = new Date(endDate);
    prevEndDate.setFullYear(prevEndDate.getFullYear() - 1);

    const previousPeriodTotals = calculateTotalsForPeriod(
      prevStartDate.toISOString().split('T')[0],
      prevEndDate.toISOString().split('T')[0]
    );

    return { current: currentPeriodTotals, previous: previousPeriodTotals };
  }, [startDate, endDate, calculateTotalsForPeriod]);

  const comparisonChartData = useMemo(() => {
    const chartData = [];
    const previousYear = currentYear - 1;

    for (let i = 1; i <= 12; i++) {
        const monthStr = String(i).padStart(2, '0');
        
        const calculateMonthTotal = (year: number, month: string) => {
            let revenue = 0;
            let patients = 0;
            const monthData = data[year]?.[month];
            if (monthData?.days) {
                Object.values(monthData.days).forEach((dayData: DayData) => {
                    revenue += dayData.revenue;
                    patients += dayData.patients;
                });
            }
            return { revenue, patients };
        };

        const currentYearTotals = calculateMonthTotal(currentYear, monthStr);
        const previousYearTotals = calculateMonthTotal(previousYear, monthStr);
        
        chartData.push({
            month: MONTH_NAMES[i - 1],
            revenueCurrent: currentYearTotals.revenue,
            revenuePrevious: previousYearTotals.revenue,
            patientsCurrent: currentYearTotals.patients,
            patientsPrevious: previousYearTotals.patients,
        });
    }
    return chartData;
  }, [data, currentYear]);

  const mapeamentoTableData = useMemo<MapeamentoRow[]>(() => {
      if (!year1 || !year2 || !data[year1] || !data[year2]) return [];

      const getYearlyTotals = (year: string) => {
          const monthly = Array(12).fill(0);
          Object.entries(data[year] || {}).forEach(([month, monthData]: [string, MonthData]) => {
              const monthIndex = parseInt(month) - 1;
              if (monthIndex >= 0 && monthIndex < 12) {
                  monthly[monthIndex] = Object.values(monthData.days || {}).reduce((acc, day: DayData) => acc + (day.revenue || 0), 0);
              }
          });

          const quarterly = [
              monthly.slice(0, 3).reduce((a, b) => a + b, 0),
              monthly.slice(3, 6).reduce((a, b) => a + b, 0),
              monthly.slice(6, 9).reduce((a, b) => a + b, 0),
              monthly.slice(9, 12).reduce((a, b) => a + b, 0),
          ];

          const semesterly = [
              quarterly.slice(0, 2).reduce((a, b) => a + b, 0),
              quarterly.slice(2, 4).reduce((a, b) => a + b, 0),
          ];

          const annual = semesterly.reduce((a, b) => a + b, 0);

          return { monthly, quarterly, semesterly, annual };
      };

      const totals1 = getYearlyTotals(year1);
      const totals2 = getYearlyTotals(year2);

      const annualChange = calculatePercentageChange(totals2.annual, totals1.annual);

      return MONTH_NAMES_FULL.map((monthName, i) => {
          const row: MapeamentoRow = {
              monthIndex: i,
              monthName,
              year1Revenue: totals1.monthly[i],
              year2Revenue: totals2.monthly[i],
              monthlyChange: calculatePercentageChange(totals2.monthly[i], totals1.monthly[i]),
          };
          if (i % 3 === 0) {
              const qIndex = Math.floor(i / 3);
              row.quarterlyChange = calculatePercentageChange(totals2.quarterly[qIndex], totals1.quarterly[qIndex]);
          }
          if (i % 6 === 0) {
              const sIndex = Math.floor(i / 6);
              row.semesterlyChange = calculatePercentageChange(totals2.semesterly[sIndex], totals1.semesterly[sIndex]);
          }
          if (i === 0) {
              row.annualChange = annualChange;
          }
          return row;
      });

  }, [data, year1, year2]);
    
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const PercentageCell: React.FC<{ value?: number }> = ({ value }) => {
      if (value === undefined || value === null || !isFinite(value)) {
          return <span className="text-gray-500">-</span>;
      }
      const isPositive = value >= 0;
      const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
      return <span className={`font-bold ${colorClass}`}>{(value * 100).toFixed(2)}%</span>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumo Mensal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Faturamento (Mês Atual)" 
            value={currentMonthTotals.revenue} 
            previousValue={previousYearCurrentMonthTotals.revenue}
            format="currency" 
          />
          <StatCard 
            title="Pacientes (Mês Atual)" 
            value={currentMonthTotals.patients} 
            previousValue={previousYearCurrentMonthTotals.patients}
          />
          <StatCard 
            title="Ticket Médio (Acumulado Ano)" 
            value={yearToDateTotals.ticketMedioAtual} 
            previousValue={yearToDateTotals.ticketMedioAnterior}
            format="currency" 
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Comparativo por período</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Faturamento por Período</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Início</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Fim</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                </div>
                 <ComparisonCard title="Comparativo do Período Selecionado" currentValue={periodComparisonData.current.revenue} previousValue={periodComparisonData.previous.revenue} format="currency" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold text-gray-700 mb-4">Nº de Pacientes Atendido por Período</h3>
                 <ComparisonCard title="Comparativo do Período Selecionado" currentValue={periodComparisonData.current.patients} previousValue={periodComparisonData.previous.patients} format="number" />
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Mapa Comparativo</h2>
            
            <div className="flex items-center space-x-4 mb-6">
                <label className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Comparar:</span>
                    <select value={year1} onChange={e => setYear1(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </label>
                 <label className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Com:</span>
                    <select value={year2} onChange={e => setYear2(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </label>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r align-bottom">Mês</th>
                            <th scope="col" colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Anual</th>
                            <th scope="col" colSpan={4} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mapeamento</th>
                        </tr>
                        <tr>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-gray-100">{year1 || 'Ano 1'}</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-gray-100">{year2 || 'Ano 2'}</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-red-100">Mensal</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-red-100">Trimestral</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r bg-red-100">Semestral</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-100">Anual</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mapeamentoTableData.map(row => (
                            <tr key={row.monthIndex}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 border-r">{row.monthName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right border-r">{formatCurrency(row.year1Revenue)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right border-r">{formatCurrency(row.year2Revenue)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center border-r">
                                    <PercentageCell value={row.monthlyChange} />
                                </td>
                                {row.quarterlyChange !== undefined && (
                                    <td rowSpan={3} className="px-4 py-3 whitespace-nowrap text-sm text-center border-r align-middle">
                                        <PercentageCell value={row.quarterlyChange} />
                                    </td>
                                )}
                                {row.semesterlyChange !== undefined && (
                                    <td rowSpan={6} className="px-4 py-3 whitespace-nowrap text-sm text-center border-r align-middle bg-gray-50">
                                         <PercentageCell value={row.semesterlyChange} />
                                    </td>
                                )}
                                 {row.annualChange !== undefined && (
                                    <td rowSpan={12} className="px-4 py-3 whitespace-nowrap text-sm text-center align-middle bg-gray-100">
                                         <PercentageCell value={row.annualChange} />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Gráficos Comparativos Anuais ({currentYear} vs {currentYear - 1})</h2>
          <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Faturamento Mensal (Ano Atual vs Ano Anterior)</h3>
                  <MonthlyComparisonChart 
                    data={comparisonChartData}
                    dataKeyCurrent="revenueCurrent"
                    dataKeyPrevious="revenuePrevious"
                    nameCurrent={String(currentYear)}
                    namePrevious={String(currentYear - 1)}
                    fillColorCurrent="#4f46e5"
                    fillColorPrevious="#a5b4fc"
                    format="currency"
                  />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                   <h3 className="text-lg font-semibold text-gray-700 mb-4">Pacientes Atendidos (Ano Atual vs Ano Anterior)</h3>
                   <MonthlyComparisonChart 
                    data={comparisonChartData}
                    dataKeyCurrent="patientsCurrent"
                    dataKeyPrevious="patientsPrevious"
                    nameCurrent={String(currentYear)}
                    namePrevious={String(currentYear - 1)}
                    fillColorCurrent="#10b981"
                    fillColorPrevious="#a7f3d0"
                  />
              </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;