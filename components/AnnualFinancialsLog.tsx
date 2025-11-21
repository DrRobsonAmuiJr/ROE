import React, { useMemo, useState } from 'react';
import type { FinancialData, AnnualFinancials } from '../types';

interface AnnualFinancialsLogProps {
    data: FinancialData;
    onDelete: (year: string) => void;
}

type LogEntry = AnnualFinancials & { year: string };

const AnnualFinancialsLog: React.FC<AnnualFinancialsLogProps> = ({ data, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const entries: LogEntry[] = useMemo(() => {
        const allEntries = Object.entries(data)
            .map(([year, values]: [string, AnnualFinancials]) => ({ year, ...values }))
            .sort((a, b) => parseInt(b.year) - parseInt(a.year));
        
        if (!searchTerm) {
            return allEntries;
        }

        return allEntries.filter(entry => entry.year.includes(searchTerm));

    }, [data, searchTerm]);


    const handleDelete = (year: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o lançamento financeiro de ${year}?`)) {
            onDelete(year);
        }
    }
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    
    const headers = [
        'Ano', 'RH', 'Manutenção', 'Material', 'Marketing', 'Operacional',
        'Equipamentos', 'Juros', 'Impostos', 'Divid. Contábeis', 'Divid. Real', 'Ações'
    ];

    const dataKeys: (keyof LogEntry)[] = [
        'year', 'rh', 'maintenance', 'material', 'marketing', 'operational', 
        'equipment', 'interest', 'taxes', 'dividendsAccounting', 'dividendsReal'
    ];

    const ChevronUp = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
    );

    const ChevronDown = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    );


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h2 className="text-xl font-bold text-gray-800">Histórico de Lançamentos Financeiros</h2>
                <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    <span>{isExpanded ? 'Recolher' : 'Expandir'}</span>
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="mb-4">
                     <input
                        type="text"
                        placeholder="Buscar por ano..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="overflow-x-auto max-h-[600px]">
                    {entries.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {headers.map(header => (
                                        <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map((entry) => (
                                    <tr key={entry.year}>
                                        {dataKeys.map(key => (
                                            <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {typeof entry[key] === 'number' ? formatCurrency(entry[key] as number) : entry[key]}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button 
                                              onClick={() => handleDelete(entry.year)}
                                              className="text-red-600 hover:text-red-900 font-medium focus:outline-none focus:underline"
                                              aria-label={`Deletar lançamento de ${entry.year}`}
                                            >
                                              Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Nenhum lançamento financeiro encontrado para a busca atual.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnualFinancialsLog;