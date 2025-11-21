import React, { useState, useMemo } from 'react';
// Fix: Import MonthData to correctly type data from Object.entries
import type { BusinessData, DayData, MonthData } from '../types';

interface MapeamentoProps {
    data: BusinessData;
}

const MONTH_NAMES_FULL = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

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

const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current / previous) - 1);
};

const Mapeamento: React.FC<MapeamentoProps> = ({ data }) => {
    const availableYears = useMemo(() => Object.keys(data).sort((a, b) => parseInt(b) - parseInt(a)), [data]);

    const [year1, setYear1] = useState<string>(availableYears.length > 1 ? availableYears[1] : '');
    const [year2, setYear2] = useState<string>(availableYears.length > 0 ? availableYears[0] : '');
    
    const tableData = useMemo<MapeamentoRow[]>(() => {
        if (!year1 || !year2 || !data[year1] || !data[year2]) return [];

        const getYearlyTotals = (year: string) => {
            const monthly = Array(12).fill(0);
            // Fix: Explicitly type 'monthData' as MonthData and 'day' as DayData to fix property access errors on 'unknown'.
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
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Crescimento por período</h2>
            
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
                        {tableData.map(row => (
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
    );
};

export default Mapeamento;