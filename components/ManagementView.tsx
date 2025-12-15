import React, { useState, useEffect } from 'react';
import type { MonthlyFinancialData } from '../types';

interface ManagementViewProps {
  monthlyFinancialData: MonthlyFinancialData;
}

const ManagementView: React.FC<ManagementViewProps> = ({ monthlyFinancialData }) => {
  const [pageTitle, setPageTitle] = useState('Avaliação de Desempenho 2026');
  
  // Configuração Base
  const [baseConfig, setBaseConfig] = useState({
      baseSalary: '2.35',
      baseCommission: '0.5'
  });

  // Métricas de Desempenho (Programa 1 e 2)
  const [performanceMetrics, setPerformanceMetrics] = useState({
      // Programa 1
      courses: false,
      course1: '',
      course2: '',
      leadership: false,
      patientSatisfaction: 4.0,
      dentistSatisfaction: 4.0,
      // Programa 2
      resultGrowth: 0
  });

  useEffect(() => {
    // Carregar título da página
    const savedTitle = localStorage.getItem('roe_management_title');
    if (savedTitle) setPageTitle(savedTitle);
    
    // Carregar configs
    const savedConfig = localStorage.getItem('roe_management_config');
    if (savedConfig) setBaseConfig(JSON.parse(savedConfig));
    
    // Carregar metricas
    const savedMetrics = localStorage.getItem('roe_management_metrics');
    if (savedMetrics) {
        const parsed = JSON.parse(savedMetrics);
        // Mesclar com o estado inicial
        setPerformanceMetrics(prev => ({...prev, ...parsed}));
    }

  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setPageTitle(newTitle);
      localStorage.setItem('roe_management_title', newTitle);
  };

  const handleConfigChange = (field: string, value: string) => {
      const newConfig = { ...baseConfig, [field]: value };
      setBaseConfig(newConfig);
      localStorage.setItem('roe_management_config', JSON.stringify(newConfig));
  };

  const handleMetricChange = (field: string, value: any) => {
      const newMetrics = { ...performanceMetrics, [field]: value };
      setPerformanceMetrics(newMetrics);
      localStorage.setItem('roe_management_metrics', JSON.stringify(newMetrics));
  };

  const getResultReward = (growth: number) => {
      if (growth < 10) return { type: 'Nenhuma', color: 'text-gray-500' };
      if (growth < 15) return { type: 'Vale Viagem', color: 'text-blue-600' };
      if (growth < 20) return { type: '0.1% Faturamento Anual', color: 'text-green-600' };
      return { type: '0.2% Faturamento Anual', color: 'text-green-700 font-bold' };
  };

  const resultReward = getResultReward(performanceMetrics.resultGrowth);
  
  // --- Calculations for Program 1 ---
  const isPerformanceEligible = 
      performanceMetrics.courses && 
      performanceMetrics.leadership && 
      performanceMetrics.patientSatisfaction >= 4 && 
      performanceMetrics.dentistSatisfaction >= 4;


  return (
    <div className="flex flex-col space-y-8 font-sans">
      
      {/* Header Editável */}
      <div className="bg-white p-6 rounded-lg shadow-md border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-800 font-bold text-2xl w-full max-w-2xl">
              <svg className="w-8 h-8 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              <input 
                  type="text" 
                  value={pageTitle}
                  onChange={handleTitleChange}
                  className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 text-2xl font-bold text-gray-800 w-full p-1 transition-colors outline-none"
              />
          </div>
      </div>

      {/* Configuração Base */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Configuração Base (Remuneração)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salário Base (Multiplicador)</label>
                  <div className="flex items-center">
                    <input 
                        type="number" 
                        step="0.01"
                        value={baseConfig.baseSalary}
                        onChange={(e) => handleConfigChange('baseSalary', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span className="ml-2 text-gray-500 text-sm">salários</span>
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comissão Mensal (%)</label>
                  <div className="flex items-center">
                    <input 
                        type="number" 
                        step="0.01"
                        value={baseConfig.baseCommission}
                        onChange={(e) => handleConfigChange('baseCommission', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span className="ml-2 text-gray-500 text-sm">% do faturamento</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Programa 1: Avaliação de Desempenho */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
              <div className="mb-4">
                  <h3 className="text-lg font-bold text-indigo-700 flex items-center">
                      1) Avaliação de Desempenho
                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Anual</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Critérios qualitativos para bonificação extra.</p>
              </div>

              <div className="space-y-4 flex-grow">
                   <div className="flex items-start">
                        <div className="flex items-center h-5 mt-1">
                            <input
                                id="courses"
                                type="checkbox"
                                checked={performanceMetrics.courses}
                                onChange={(e) => handleMetricChange('courses', e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm w-full">
                            <label htmlFor="courses" className="font-medium text-gray-700">Cursos e Atualizações</label>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                     <span className="text-gray-500 text-xs mr-2">○ Curso 1:</span>
                                     <input 
                                        type="text"
                                        value={performanceMetrics.course1 || ''}
                                        onChange={(e) => handleMetricChange('course1', e.target.value)}
                                        className="border-b border-gray-300 focus:border-indigo-500 outline-none text-xs text-gray-700 flex-grow py-0.5 bg-transparent"
                                        placeholder=""
                                     />
                                </div>
                                 <div className="flex items-center">
                                     <span className="text-gray-500 text-xs mr-2">○ Curso 2:</span>
                                     <input 
                                        type="text"
                                        value={performanceMetrics.course2 || ''}
                                        onChange={(e) => handleMetricChange('course2', e.target.value)}
                                        className="border-b border-gray-300 focus:border-indigo-500 outline-none text-xs text-gray-700 flex-grow py-0.5 bg-transparent"
                                        placeholder=""
                                     />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="leadership"
                                type="checkbox"
                                checked={performanceMetrics.leadership}
                                onChange={(e) => handleMetricChange('leadership', e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="leadership" className="font-medium text-gray-700">Liderança</label>
                            <p className="text-gray-500">Engajamento com a equipe e melhoria de processos.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Satisfação dos Pacientes (Meta: 4 a 5)</label>
                        <input 
                            type="range" 
                            min="0" max="5" step="0.1"
                            value={performanceMetrics.patientSatisfaction}
                            onChange={(e) => handleMetricChange('patientSatisfaction', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                         <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span className={`font-bold text-lg ${performanceMetrics.patientSatisfaction >= 4 ? 'text-green-600' : 'text-red-500'}`}>{performanceMetrics.patientSatisfaction}</span>
                            <span>5</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Satisfação dos Dentistas (Meta: 4 a 5)</label>
                        <input 
                            type="range" 
                            min="0" max="5" step="0.1"
                            value={performanceMetrics.dentistSatisfaction}
                            onChange={(e) => handleMetricChange('dentistSatisfaction', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span className={`font-bold text-lg ${performanceMetrics.dentistSatisfaction >= 4 ? 'text-green-600' : 'text-red-500'}`}>{performanceMetrics.dentistSatisfaction}</span>
                            <span>5</span>
                        </div>
                    </div>
              </div>

              <div className={`mt-6 p-4 rounded-md border ${isPerformanceEligible ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Premiação Prevista</h4>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-extrabold ${isPerformanceEligible ? 'text-green-600' : 'text-gray-400'}`}>
                        {isPerformanceEligible ? '+ 0.1%' : '0%'}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">do faturamento mensal (ao ano)</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Teto acumulado: 1%</p>
              </div>
          </div>

          {/* Programa 2: Avaliação de Resultados */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
               <div className="mb-4">
                  <h3 className="text-lg font-bold text-indigo-700 flex items-center">
                      2) Avaliação de Resultados
                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Anual</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Crescimento do faturamento em relação ao último ano.</p>
              </div>
              
              <div className="flex-grow flex flex-col justify-center items-center py-6">
                  <div className="text-center w-full">
                      <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">Crescimento Calculado</p>
                      <div className="flex items-center justify-center">
                          <input 
                              type="number"
                              step="0.01"
                              value={performanceMetrics.resultGrowth}
                              onChange={(e) => handleMetricChange('resultGrowth', parseFloat(e.target.value))}
                              className={`text-4xl font-bold bg-transparent text-center border-b-2 border-dashed border-gray-300 hover:border-indigo-400 focus:border-indigo-600 focus:outline-none w-48 transition-colors ${performanceMetrics.resultGrowth >= 0 ? 'text-blue-600' : 'text-red-500'}`}
                          />
                          <span className={`text-4xl font-bold ml-1 ${performanceMetrics.resultGrowth >= 0 ? 'text-blue-600' : 'text-red-500'}`}>%</span>
                      </div>
                  </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="font-semibold text-xs uppercase text-gray-400 mb-2">Tabela de Premiação</p>
                  <div className={`flex justify-between ${performanceMetrics.resultGrowth >= 10 && performanceMetrics.resultGrowth < 15 ? 'font-bold text-blue-600' : ''}`}>
                      <span>10% a 14,99%</span>
                      <span>Vale Viagem</span>
                  </div>
                   <div className={`flex justify-between ${performanceMetrics.resultGrowth >= 15 && performanceMetrics.resultGrowth < 20 ? 'font-bold text-green-600' : ''}`}>
                      <span>15% a 19,99%</span>
                      <span>0.1% Fat. Anual</span>
                  </div>
                   <div className={`flex justify-between ${performanceMetrics.resultGrowth >= 20 ? 'font-bold text-green-700' : ''}`}>
                      <span>Acima de 20%</span>
                      <span>0.2% Fat. Anual</span>
                  </div>
              </div>

              <div className="mt-auto p-4 rounded-md border bg-indigo-50 border-indigo-200">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Premiação Alcançada</h4>
                  <div className="flex flex-col">
                    <span className={`text-xl font-bold ${resultReward.color}`}>
                        {resultReward.type}
                    </span>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default ManagementView;