import React, { useMemo, useState } from 'react';
import type { PartnersData } from '../types';

interface PartnersMovementLogProps {
    data: PartnersData;
    onDelete: (year: string, month: string) => void;
}

interface LogEntry {
    year: string;
    month: string;
    dateLabel: string;
    fileName: string;
    fileSize: number;
    uploadDate: string;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const PartnersMovementLog: React.FC<PartnersMovementLogProps> = ({ data, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const entries = useMemo(() => {
        const allEntries: LogEntry[] = [];
        Object.keys(data).forEach(year => {
            Object.keys(data[year]).forEach(month => {
                const movementData = data[year][month];
                const monthIndex = parseInt(month, 10) - 1;
                allEntries.push({
                    year,
                    month,
                    dateLabel: `${MONTH_NAMES[monthIndex]}/${year}`,
                    ...movementData
                });
            });
        });
        
        const sortedEntries = allEntries.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

        if (!searchTerm) return sortedEntries;
        
        const lowercasedSearch = searchTerm.toLowerCase();
        return sortedEntries.filter(entry => 
            entry.dateLabel.toLowerCase().includes(lowercasedSearch) ||
            entry.fileName.toLowerCase().includes(lowercasedSearch)
        );

    }, [data, searchTerm]);

    const handleDelete = (year: string, month: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o arquivo de ${MONTH_NAMES[parseInt(month)-1]}/${year}?`)) {
            onDelete(year, month);
        }
    }
    
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const ChevronUp = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
    );

    const ChevronDown = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h2 className="text-xl font-bold text-gray-800">Histórico de Movimentação de Parceiros (por valor)</h2>
                 <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    <span>{isExpanded ? 'Recolher' : 'Expandir'}</span>
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
            </div>
             <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="mb-4">
                     <input
                        type="text"
                        placeholder="Buscar por Mês/Ano ou nome do arquivo..."
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês/Ano</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Arquivo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Envio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map((entry) => (
                                    <tr key={`${entry.year}-${entry.month}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.dateLabel}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.fileName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(entry.fileSize)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.uploadDate).toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button 
                                              onClick={() => handleDelete(entry.year, entry.month)}
                                              className="text-red-600 hover:text-red-900 font-medium focus:outline-none focus:underline"
                                              aria-label={`Deletar arquivo de ${entry.dateLabel}`}
                                            >
                                              Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Nenhum arquivo de parceiros encontrado.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnersMovementLog;