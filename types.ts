export interface AnnualFinancials {
  rh: number;
  maintenance: number;
  material: number;
  marketing: number;
  operational: number;
  equipment: number;
  interest: number;
  taxes: number;
  dividendsAccounting: number;
  dividendsReal: number;
}

export interface FinancialData {
    [year: string]: AnnualFinancials;
}

export interface MonthlyFinancials {
  monthlyRevenue: number;
  monthlyProfit: number;
  dividends: number;
  monthlyReserve: number;
}

export interface MonthlyFinancialData {
  [year: string]: {
    [month: string]: MonthlyFinancials;
  };
}

export interface DayData {
  patients: number;
  revenue: number;
  docs: number;
  tomos: number;
}

export interface MonthData {
  days: { [day: string]: DayData };
}

export interface YearData {
  [month: string]: MonthData;
}

export interface BusinessData {
  [year: string]: YearData;
}

export interface PartnerMovement {
  fileName: string;
  uploadDate: string;
  fileSize: number;
}

export interface PartnersData {
  [year: string]: {
    [month: string]: PartnerMovement;
  };
}

export interface PartnersDataByExams {
  [year: string]: {
    [month: string]: PartnerMovement;
  };
}

// New types for detailed partner data from Excel/CSV
export interface PartnerRecord {
  dentistName: string;
  examValue: number;
}

export interface PartnerDetailsData {
  [year: string]: {
    [month: string]: PartnerRecord[];
  };
}

// New types for detailed partner data by exam count from Excel/CSV
export interface PartnerRecordByExams {
  dentistName: string;
  examCount: number;
}

export interface PartnerDetailsDataByExams {
  [year: string]: {
    [month: string]: PartnerRecordByExams[];
  };
}


// New types for decline reasons
export type DeclineReason = 'Concorrência' | 'Insatisfação' | 'Preço' | 'Recesso/Férias' | 'Doença/Gravidez' | 'Mudança/Aposentadoria' | 'Não sabe motivo' | '';

export interface DeclineReasonsData {
  [compositeKey: string]: DeclineReason;
}

// New types for Prospections
export interface Prospection {
  id: number;
  dentistName: string;
  meetingDate: string;
}

export type ProspectionsData = Prospection[];