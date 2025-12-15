
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
  const logoUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAHSAfQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1VZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/aAAwDAQACEQMRAD8A9UooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA-";
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
          <img src={logoUrl} alt="Logo ROE" className="h-16 sm:h-24 mr-6 object-contain" />
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
              Dashboard
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
