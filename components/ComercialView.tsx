import React, { useState, useMemo, useCallback } from 'react';
import type { PartnerDetailsData, DeclineReasonsData, DeclineReason, ProspectionsData } from '../types';
import PartnerEvolutionReport from './PartnerEvolutionReport';
import ProspectionsList from './ProspectionsList';
import DentistPerformanceChart from './DentistPerformanceChart'; // New component for individual analysis

interface ComercialViewProps {
  partnerDetailsData: PartnerDetailsData;
  declineReasons: DeclineReasonsData;
  updateDeclineReason: (key: string, reason: DeclineReason) => void;
  prospectionsData: ProspectionsData;
  addProspection: (dentistName: string, meetingDate: string) => void;
  deleteProspection: (id: number) => void;
}

type AggregatedPartnerData = {
  dentistName: string;
  totalValue: number;
};

const ComercialView: React.FC<ComercialViewProps> = ({ 
  partnerDetailsData, 
  declineReasons, 
  updateDeclineReason,
  prospectionsData,
  addProspection,
  deleteProspection
}) => {
    
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [period1Start, setPeriod1Start] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [period1End, setPeriod1End] = useState(today.toISOString().split('T')[0]);
  
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const firstDayOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const lastDayOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

  const [period2Start, setPeriod2Start] = useState(firstDayOfLastMonth.toISOString().split('T')[0]);
  const [period2End, setPeriod2End] = useState(lastDayOfLastMonth.toISOString().split('T')[0]);
  
  const [showComparison, setShowComparison] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<string | null>(null);
  const [dentistSearchTerm, setDentistSearchTerm] = useState('');

  const aggregateDataForPeriod = useCallback((start: string, end: string): AggregatedPartnerData[] => {
    const aggregated: { [key: string]: number } = {};
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T23:59:59`);


    Object.keys(partnerDetailsData).forEach(yearStr => {
      const year = parseInt(yearStr);
      Object.keys(partnerDetailsData[yearStr]).forEach(monthStr => {
        const month = parseInt(monthStr);
        // Check if the month from the data is within the selected period
        const firstDayDataMonth = new Date(year, month - 1, 1);
        const lastDayDataMonth = new Date(year, month, 0);
        
        if (firstDayDataMonth <= endDate && lastDayDataMonth >= startDate) {
           const records = partnerDetailsData[yearStr][monthStr];
           records.forEach(record => {
               const name = record.dentistName;
               if (!aggregated[name]) {
                   aggregated[name] = 0;
               }
               aggregated[name] += record.examValue;
           });
        }
      });
    });

    return Object.entries(aggregated).map(([dentistName, totalValue]) => ({
      dentistName,
      totalValue
    }));
  }, [partnerDetailsData]);

  const uniqueDentists = useMemo(() => {
    const names = new Set<string>();
    Object.values(partnerDetailsData).forEach(yearData => {
        Object.values(yearData).forEach(monthRecords => {
            monthRecords.forEach(record => names.add(record.dentistName));
        });
    });
    return Array.from(names).sort((a,b) => a.localeCompare(b));
  }, [partnerDetailsData]);

  const handleDentistSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setDentistSearchTerm(term);
    if (uniqueDentists.includes(term)) {
        setSelectedDentist(term);
    } else {
        setSelectedDentist(null);
    }
  };


  const period1Data = useMemo(() => {
      const data = aggregateDataForPeriod(period1Start, period1End);
      return data.sort((a, b) => b.totalValue - a.totalValue);
  }, [period1Start, period1End, aggregateDataForPeriod]);
  
  const period2Data = useMemo(() => {
      const data = aggregateDataForPeriod(period2Start, period2End);
      return data.sort((a, b) => b.totalValue - a.totalValue);
  }, [period2Start, period2End, aggregateDataForPeriod]);

  const hasPartnerData = useMemo(() => Object.keys(partnerDetailsData).length > 0, [partnerDetailsData]);

  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  const handleSetCurrentYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const p1Start = new Date(currentYear, 0, 1);
    setPeriod1Start(formatDate(p1Start));
    setPeriod1End(formatDate(today));

    const p2Start = new Date(currentYear - 1, 0, 1);
    const p2End = new Date(today);
    p2End.setFullYear(currentYear - 1);
    setPeriod2Start(formatDate(p2Start));
    setPeriod2End(formatDate(p2End));
  };

  const handleSetLastYear = () => {
    const today = new Date();
    const lastYear = today.getFullYear() - 1;
    
    const p1Start = new Date(lastYear, 0, 1);
    const p1End = new Date(lastYear, 11, 31);
    setPeriod1Start(formatDate(p1Start));
    setPeriod1End(formatDate(p1End));

    const yearBeforeLast = lastYear - 1;
    const p2Start = new Date(yearBeforeLast, 0, 1);
    const p2End = new Date(yearBeforeLast, 11, 31);
    setPeriod2Start(formatDate(p2Start));
    setPeriod2End(formatDate(p2End));
  };


  if (!hasPartnerData) {
     return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-gray-800">Painel Comercial</h2>
        <p className="mt-4 text-gray-500">Não há dados de parceiros disponíveis. Por favor, faça o upload de uma Relação de Dentistas na aba 'Lançamentos' para gerar os relatórios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios de Parceiros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-6 rounded-lg shadow-md">
            {/* Período 1 */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">Período de Análise</h3>
                <div className="flex items-center space-x-2 pb-2">
                    <span className="text-sm font-medium text-gray-600">Preencher com:</span>
                    <button
                        type="button"
                        onClick={handleSetCurrentYear}
                        className="px-3 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        Ano Corrente
                    </button>
                    <button
                        type="button"
                        onClick={handleSetLastYear}
                        className="px-3 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        Último Ano
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                     <div>
                        <label htmlFor="p1-start-date" className="block text-sm font-medium text-gray-700">Início</label>
                        <input type="date" id="p1-start-date" value={period1Start} onChange={e => setPeriod1Start(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="p1-end-date" className="block text-sm font-medium text-gray-700">Fim</label>
                        <input type="date" id="p1-end-date" value={period1End} onChange={e => setPeriod1End(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                </div>
            </div>

            {/* Período 2 */}
            <div className="space-y-2">
                 <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                    Período de Comparação
                    <span className="ml-2 text-xs font-normal text-gray-500">(Opcional)</span>
                 </h3>
                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                     <div>
                        <label htmlFor="p2-start-date" className="block text-sm font-medium text-gray-700">Início</label>
                        <input type="date" id="p2-start-date" value={period2Start} onChange={e => setPeriod2Start(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="p2-end-date" className="block text-sm font-medium text-gray-700">Fim</label>
                        <input type="date" id="p2-end-date" value={period2End} onChange={e => setPeriod2End(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                </div>
                 <div className="flex items-center pt-2">
                    <input
                        id="show-comparison-checkbox"
                        type="checkbox"
                        checked={showComparison}
                        onChange={(e) => setShowComparison(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="show-comparison-checkbox" className="ml-2 block text-sm text-gray-900">
                        Mostrar relatórios comparativos
                    </label>
                </div>
            </div>
        </div>
      </div>
      
      <PartnerEvolutionReport
        period1Data={period1Data}
        period2Data={period2Data}
        showComparison={showComparison}
        declineReasons={declineReasons}
        updateDeclineReason={updateDeclineReason}
        period1EndDate={period1End}
      />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Análise Individual de Parceiro</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div>
            <label htmlFor="dentist-search" className="block text-sm font-medium text-gray-700">Buscar Dentista</label>
            <input
              type="text"
              id="dentist-search"
              value={dentistSearchTerm}
              onChange={handleDentistSearchChange}
              list="dentist-suggestions"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Digite o nome de um dentista..."
            />
            <datalist id="dentist-suggestions">
              {uniqueDentists.map(name => <option key={name} value={name} />)}
            </datalist>
          </div>

          {selectedDentist ? (
            <DentistPerformanceChart 
              dentistName={selectedDentist}
              partnerDetailsData={partnerDetailsData}
              period1Start={period1Start}
              period1End={period1End}
              period2Start={period2Start}
              period2End={period2End}
            />
          ) : (
            <p className="text-center text-gray-500 mt-6">
              {dentistSearchTerm && !uniqueDentists.includes(dentistSearchTerm) 
                ? 'Nenhum dentista encontrado com este nome.' 
                : 'Digite e selecione um dentista para ver sua evolução.'}
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-300">
          <ProspectionsList 
            prospectionsData={prospectionsData}
            addProspection={addProspection}
            deleteProspection={deleteProspection}
          />
      </div>
      
    </div>
  );
};

export default ComercialView;
