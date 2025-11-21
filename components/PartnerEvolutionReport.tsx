import React, { useMemo } from 'react';
import type { DeclineReasonsData, DeclineReason } from '../types';

type AggregatedPartnerData = {
  dentistName: string;
  totalValue: number;
};

interface PartnerEvolutionReportProps {
  period1Data: AggregatedPartnerData[];
  period2Data: AggregatedPartnerData[];
  showComparison: boolean;
  declineReasons: DeclineReasonsData;
  updateDeclineReason: (key: string, reason: DeclineReason) => void;
  period1EndDate: string;
}

type ComparisonData = {
  dentistName: string;
  valueP1: number;
  valueP2: number;
  change: number;
  percentageChange: number;
};

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const RankingCard: React.FC<{ title: string; data: { name: string; value: number | string }[] }> = ({ title, data }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
            {data.length > 0 ? (
                 <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Dentista</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((item, index) => (
                                <tr key={item.name}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{item.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            ) : (
                <p className="text-center text-gray-500 py-4">Nenhum dado para exibir neste período.</p>
            )}
        </div>
    );
};

const ChangeCell: React.FC<{ value: number, isPercent?: boolean }> = ({ value, isPercent = false }) => {
    if (value === 0) return <span className="text-gray-500">{isPercent ? '0.00%' : formatCurrency(0)}</span>;
    
    const isPositive = value > 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const prefix = isPositive ? '+' : '';
    
    if (isPercent && !isFinite(value) && isPositive) {
        return <span className="font-medium text-green-600">+100.00%</span>;
    }

    const formattedValue = isPercent 
        ? `${prefix}${value.toFixed(2)}%`
        : `${prefix}${formatCurrency(Math.abs(value))}`;
    
    return <span className={`font-medium ${color}`}>{formattedValue}</span>;
};

const DECLINE_REASONS: DeclineReason[] = [
  'Concorrência',
  'Insatisfação',
  'Preço',
  'Recesso/Férias',
  'Doença/Gravidez',
  'Mudança/Aposentadoria',
  'Não sabe motivo',
];

const PartnerEvolutionReport: React.FC<PartnerEvolutionReportProps> = ({ 
    period1Data,
    period2Data,
    showComparison,
    declineReasons,
    updateDeclineReason,
    period1EndDate
}) => {

    const comparisonData = useMemo<ComparisonData[]>(() => {
        const allDentists = new Set([...period1Data.map(d => d.dentistName), ...period2Data.map(d => d.dentistName)]);
        
        return Array.from(allDentists).map(name => {
            const p1 = period1Data.find(d => d.dentistName === name)?.totalValue || 0;
            const p2 = period2Data.find(d => d.dentistName === name)?.totalValue || 0;
            const change = p1 - p2;
            const percentageChange = p2 !== 0 ? (change / p2) * 100 : (p1 > 0 ? Infinity : 0);

            return { dentistName: name, valueP1: p1, valueP2: p2, change, percentageChange };
        }).sort((a,b) => b.valueP1 - a.valueP1);

    }, [period1Data, period2Data]);

    const topGrowth = useMemo(() => {
        return comparisonData.filter(d => d.change > 0).sort((a, b) => b.change - a.change);
    }, [comparisonData]);
    
    const topDecline = useMemo(() => {
        return comparisonData.filter(d => d.change < 0).sort((a, b) => a.change - b.change);
    }, [comparisonData]);
    
    return (
        <div className="space-y-8">
            <RankingCard
                title="Ranking de Parceiros (Período de Análise)"
                data={period1Data.map(d => ({ name: d.dentistName, value: formatCurrency(d.totalValue) }))}
            />
            
            {showComparison && (
                 <>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Comparativo de Evolução</h3>
                        {comparisonData.length > 0 ? (
                            <div className="overflow-x-auto max-h-96">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Dentista</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Período Análise</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Período Comp.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variação (R$)</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variação (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {comparisonData.map(item => (
                                            <tr key={item.dentistName}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.dentistName}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{formatCurrency(item.valueP1)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">{formatCurrency(item.valueP2)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right"><ChangeCell value={item.change} /></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right"><ChangeCell value={item.percentageChange} isPercent /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                             <p className="text-center text-gray-500 py-4">Nenhum dado para comparar nestes períodos.</p>
                        )}
                    </div>
                 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Growth Table */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Ranking de Maior Crescimento</h3>
                            {topGrowth.length > 0 ? (
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dentista</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {topGrowth.map((item, index) => (
                                                <tr key={item.dentistName}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.dentistName}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right"><ChangeCell value={item.change} /></td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right"><ChangeCell value={item.percentageChange} isPercent /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (<p className="text-center text-gray-500 py-4">Nenhum parceiro apresentou crescimento.</p>)}
                        </div>

                        {/* Decline Table */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Ranking de Maior Queda</h3>
                            {topDecline.length > 0 ? (
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dentista</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {topDecline.map((item, index) => {
                                                const compositeKey = `${period1EndDate}_${item.dentistName}`;
                                                return (
                                                <tr key={item.dentistName}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.dentistName}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right"><ChangeCell value={item.change} /></td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right"><ChangeCell value={item.percentageChange} isPercent /></td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                        <select
                                                            value={declineReasons[compositeKey] || ''}
                                                            onChange={(e) => updateDeclineReason(compositeKey, e.target.value as DeclineReason)}
                                                            className="block w-full pl-2 pr-7 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                                            aria-label={`Motivo da queda de ${item.dentistName}`}
                                                        >
                                                            <option value="">Selecionar...</option>
                                                            {DECLINE_REASONS.map(reason => <option key={reason} value={reason}>{reason}</option>)}
                                                        </select>
                                                    </td>
                                                </tr>
                                            )})}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (<p className="text-center text-gray-500 py-4">Nenhum parceiro apresentou queda.</p>)}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PartnerEvolutionReport;
