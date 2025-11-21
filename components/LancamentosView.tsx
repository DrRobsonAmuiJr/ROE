import React from 'react';
import DataInputForm from './DataInputForm';
import EntriesLog from './EntriesLog';
import AnnualFinancialsForm from './AnnualFinancialsForm';
import AnnualFinancialsLog from './AnnualFinancialsLog';
import MonthlyFinancialsForm from './MonthlyFinancialsForm';
import MonthlyFinancialsLog from './MonthlyFinancialsLog';
import PartnersMovementForm from './PartnersMovementForm';
import PartnersMovementLog from './PartnersMovementLog';
import PartnersMovementByExamsForm from './PartnersMovementByExamsForm';
import PartnersMovementByExamsLog from './PartnersMovementByExamsLog';
import type { BusinessData, FinancialData, AnnualFinancials, MonthlyFinancialData, MonthlyFinancials, PartnersData, PartnerRecord, PartnersDataByExams, PartnerRecordByExams } from '../types';

interface LancamentosViewProps {
    businessData: BusinessData;
    updateDailyEntry: (date: string, patients: number, revenue: number, docs: number, tomos: number) => void;
    deleteDailyEntry: (date: string) => void;
    financialData: FinancialData;
    updateAnnualFinancials: (year: string, data: AnnualFinancials) => void;
    deleteAnnualFinancials: (year: string) => void;
    monthlyFinancialData: MonthlyFinancialData;
    updateMonthlyEntry: (year: string, month: string, data: MonthlyFinancials) => void;
    deleteMonthlyEntry: (year: string, month: string) => void;
    partnersData: PartnersData;
    addPartnerMovement: (year: string, month: string, file: File) => void;
    deletePartnerMovement: (year: string, month: string) => void;
    addPartnerDetails: (year: string, month: string, data: PartnerRecord[]) => void;
    partnersDataByExams: PartnersDataByExams;
    addPartnerMovementByExams: (year: string, month: string, file: File) => void;
    deletePartnerMovementByExams: (year: string, month: string) => void;
    addPartnerDetailsByExams: (year: string, month: string, data: PartnerRecordByExams[]) => void;
}

const LancamentosView: React.FC<LancamentosViewProps> = ({
    businessData,
    updateDailyEntry,
    deleteDailyEntry,
    financialData,
    updateAnnualFinancials,
    deleteAnnualFinancials,
    monthlyFinancialData,
    updateMonthlyEntry,
    deleteMonthlyEntry,
    partnersData,
    addPartnerMovement,
    deletePartnerMovement,
    addPartnerDetails,
    partnersDataByExams,
    addPartnerMovementByExams,
    deletePartnerMovementByExams,
    addPartnerDetailsByExams,
}) => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <DataInputForm onDailySubmit={updateDailyEntry} />
                  <EntriesLog data={businessData} onDeleteEntry={deleteDailyEntry} />
                </div>
                <div className="space-y-8">
                  <MonthlyFinancialsForm onSubmit={updateMonthlyEntry} />
                  <MonthlyFinancialsLog data={monthlyFinancialData} onDelete={deleteMonthlyEntry} />
                  <AnnualFinancialsForm onSubmit={updateAnnualFinancials} />
                  <AnnualFinancialsLog data={financialData} onDelete={deleteAnnualFinancials} />
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PartnersMovementForm 
                  onAddMovement={addPartnerMovement} 
                  onAddDetails={addPartnerDetails} 
                />
                <PartnersMovementLog data={partnersData} onDelete={deletePartnerMovement} />
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PartnersMovementByExamsForm 
                  onAddMovement={addPartnerMovementByExams} 
                  onAddDetails={addPartnerDetailsByExams} 
                />
                <PartnersMovementByExamsLog data={partnersDataByExams} onDelete={deletePartnerMovementByExams} />
            </div>
        </>
    );
};

export default LancamentosView;