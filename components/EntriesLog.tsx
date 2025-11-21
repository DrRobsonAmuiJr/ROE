import React, { useMemo, useState } from 'react';
import type { BusinessData } from '../types';

interface Entry {
    date: string;
    patients: number;
    revenue: number;
    docs: number;
    tomos: number;
}

interface EntriesLogProps {
    data: BusinessData;
    onDeleteEntry: (date: string) => void;
}

const EntriesLog: React.FC<EntriesLogProps> = ({ data, onDeleteEntry }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const entries = useMemo(() => {
        const allEntries: Entry[] = [];
        Object.keys(data).forEach(year => {
            Object.keys(data[year]).forEach(month => {
                const monthData = data[year][month];
                if (monthData.days) {
                    Object.keys(monthData.days).forEach(day => {
                        const dayData = monthData.days[day];
                        allEntries.push({
                            date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
                            patients: dayData.patients,
                            revenue: dayData.revenue || 0,
                            docs: dayData.docs || 0,
                            tomos: dayData.tomos || 0,
                        });
                    });
                }
            });
        });
        
        const sortedEntries = allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (!searchTerm) {
            return sortedEntries;
        }

        const normalizedSearch = searchTerm.replace(/\//g, '-');
        
        return sortedEntries.filter(entry => {
             const formattedDate = entry.date.split('-').reverse().join('/');
             return entry.date.includes(normalizedSearch) || formattedDate.includes(searchTerm);
        });

    }, [data, searchTerm]);

    const handleDelete = (date: string) => {
        if (window.confirm('Tem certeza que deseja deletar este lançamento?')) {
            onDeleteEntry(date);
        }
    }

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    
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
                <h2 className="text-xl font-bold text-gray-800">Histórico de Lançamentos Diários</h2>
                <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    <span>{isExpanded ? 'Recolher' : 'Expandir'}</span>
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por data (DD/MM/AAAA)..."
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pacientes
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Faturamento
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Docs
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tomos
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map((entry) => (
                                    <tr key={entry.date}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatDate(entry.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {entry.patients}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatCurrency(entry.revenue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {entry.docs}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {entry.tomos}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button 
                                              onClick={() => handleDelete(entry.date)}
                                              className="text-red-600 hover:text-red-900 font-medium focus:outline-none focus:underline"
                                              aria-label={`Deletar lançamento de ${formatDate(entry.date)}`}
                                            >
                                              Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Nenhum lançamento encontrado para a busca atual.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EntriesLog;