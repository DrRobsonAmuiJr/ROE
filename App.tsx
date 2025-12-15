import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import SummaryView from './components/SummaryView';
import LancamentosView from './components/LancamentosView';
import FinancialDashboard from './components/FinancialDashboard';
import ComercialView from './components/ComercialView'; // Importa a nova view
import StrategicPlanningView from './components/StrategicPlanningView'; // Importa a view de Planejamento
import ManagementView from './components/ManagementView'; // Importa a nova view de Gerência
import NotificationBanner from './components/NotificationBanner';
import { useBusinessData } from './hooks/useBusinessData';
import { useFinancialData } from './hooks/useFinancialData';
import { useMonthlyFinancialData } from './hooks/useMonthlyFinancialData';
import { usePartnersData } from './hooks/usePartnersData';
import { usePartnerDetailsData } from './hooks/usePartnerDetailsData'; // Importa o novo hook
import { usePartnersDataByExams } from './hooks/usePartnersDataByExams';
import { usePartnerDetailsDataByExams } from './hooks/usePartnerDetailsDataByExams';
import { useDeclineReasons } from './hooks/useDeclineReasons';
import { useMonthlyNotifier } from './hooks/useMonthlyNotifier';
import { useProspectionsData } from './hooks/useProspectionsData';

const App: React.FC = () => {
  const { businessData, updateDailyEntry, deleteDailyEntry } = useBusinessData();
  const { financialData, updateAnnualFinancials, deleteAnnualFinancials } = useFinancialData();
  const { monthlyFinancialData, updateMonthlyEntry, deleteMonthlyEntry } = useMonthlyFinancialData();
  const { partnersData, addPartnerMovement, deletePartnerMovement } = usePartnersData();
  const { partnerDetailsData, addPartnerDetails, deletePartnerDetails } = usePartnerDetailsData(); // Usa o novo hook
  const { 
    partnersData: partnersDataByExams, 
    addPartnerMovement: addPartnerMovementByExams, 
    deletePartnerMovement: deletePartnerMovementByExams 
  } = usePartnersDataByExams();
  const { 
    partnerDetailsData: partnerDetailsDataByExams, 
    addPartnerDetails: addPartnerDetailsByExams, 
    deletePartnerDetails: deletePartnerDetailsByExams 
  } = usePartnerDetailsDataByExams();
  const { declineReasons, updateDeclineReason } = useDeclineReasons();
  const { showNotification, notificationHandled } = useMonthlyNotifier();
  const { prospectionsData, addProspection, deleteProspection } = useProspectionsData();
  const [activeView, setActiveView] = useState('dashboard');

  const navButtonClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors whitespace-nowrap";
  const activeNavButtonClasses = "bg-indigo-600 text-white";
  const inactiveNavButtonClasses = "text-gray-600 bg-gray-200 hover:bg-gray-300";

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          {/* Logo Gráfico SVG Inline */}
          <div className="mr-6 flex-shrink-0">
             <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#4F46E5"/>
                <path d="M50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25ZM50 68.75C39.6447 68.75 31.25 60.3553 31.25 50C31.25 39.6447 39.6447 31.25 50 31.25C60.3553 31.25 68.75 39.6447 68.75 50C68.75 60.3553 60.3553 68.75 50 68.75Z" fill="white"/>
                <path d="M50 35V45M50 55V65M35 50H45M55 50H65" stroke="white" strokeWidth="4" strokeLinecap="round"/>
             </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão ROE</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showNotification && <NotificationBanner onClose={notificationHandled} />}
        <div className="mb-6">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2" aria-label="Tabs">
            <button
              onClick={() => setActiveView('lancamentos')}
              className={`${navButtonClasses} ${activeView === 'lancamentos' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              Lançamentos
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`${navButtonClasses} ${activeView === 'dashboard' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              Painel
            </button>
            <button
              onClick={() => setActiveView('kpis')}
              className={`${navButtonClasses} ${activeView === 'kpis' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              KPIs
            </button>
            <button
              onClick={() => setActiveView('financeiro')}
              className={`${navButtonClasses} ${activeView === 'financeiro' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              Financeiro
            </button>
             <button
              onClick={() => setActiveView('comercial')}
              className={`${navButtonClasses} ${activeView === 'comercial' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              Comercial
            </button>
             <button
              onClick={() => setActiveView('planejamento')}
              className={`${navButtonClasses} ${activeView === 'planejamento' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              Planejamento
            </button>
             <button
              onClick={() => setActiveView('gerencia')}
              className={`${navButtonClasses} ${activeView === 'gerencia' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              Gerência
            </button>
          </nav>
        </div>

        {activeView === 'dashboard' && <Dashboard data={businessData} />}
        
        {activeView === 'lancamentos' && (
          <LancamentosView 
            businessData={businessData}
            updateDailyEntry={updateDailyEntry}
            deleteDailyEntry={deleteDailyEntry}
            financialData={financialData}
            updateAnnualFinancials={updateAnnualFinancials}
            deleteAnnualFinancials={deleteAnnualFinancials}
            monthlyFinancialData={monthlyFinancialData}
            updateMonthlyEntry={updateMonthlyEntry}
            deleteMonthlyEntry={deleteMonthlyEntry}
            partnersData={partnersData}
            addPartnerMovement={addPartnerMovement}
            deletePartnerMovement={(year, month) => {
              deletePartnerMovement(year, month);
              deletePartnerDetails(year, month); // Também deleta os detalhes
            }}
            addPartnerDetails={addPartnerDetails}
            partnersDataByExams={partnersDataByExams}
            addPartnerMovementByExams={addPartnerMovementByExams}
            deletePartnerMovementByExams={(year, month) => {
              deletePartnerMovementByExams(year, month);
              deletePartnerDetailsByExams(year, month);
            }}
            addPartnerDetailsByExams={addPartnerDetailsByExams}
          />
        )}
        
        {activeView === 'kpis' && <SummaryView businessData={businessData} financialData={financialData} monthlyFinancialData={monthlyFinancialData} prospectionsData={prospectionsData} />}
        
        {activeView === 'financeiro' && <FinancialDashboard monthlyFinancialData={monthlyFinancialData} financialData={financialData} />}
        
        {activeView === 'comercial' && <ComercialView
            partnerDetailsData={partnerDetailsData}
            declineReasons={declineReasons}
            updateDeclineReason={updateDeclineReason}
            prospectionsData={prospectionsData}
            addProspection={addProspection}
            deleteProspection={deleteProspection}
          />}
          
        {activeView === 'planejamento' && <StrategicPlanningView />}
        
        {activeView === 'gerencia' && <ManagementView monthlyFinancialData={monthlyFinancialData} />}

      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Desenvolvido com React, TypeScript & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;