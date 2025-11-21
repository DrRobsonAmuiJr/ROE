
import { useState, useEffect, useCallback } from 'react';
import type { FinancialData, AnnualFinancials } from '../types';
import { supabase } from '../supabaseClient';

export const useFinancialData = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({});

  const fetchData = async () => {
    const { data, error } = await supabase.from('annual_financials').select('*');
    if (error) {
      console.error("Failed to load financial data from Supabase:", error.message);
      return;
    }

    const formattedData: FinancialData = {};
    if (data) {
        data.forEach((row: any) => {
            formattedData[row.year] = {
                rh: row.rh,
                maintenance: row.maintenance,
                material: row.material,
                marketing: row.marketing,
                operational: row.operational,
                equipment: row.equipment,
                interest: row.interest,
                taxes: row.taxes,
                dividendsAccounting: row.dividends_accounting,
                dividendsReal: row.dividends_real,
            };
        });
    }
    setFinancialData(formattedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateAnnualFinancials = useCallback(async (year: string, data: AnnualFinancials) => {
    setFinancialData(prevData => ({ ...prevData, [year]: data }));

    const { error } = await supabase.from('annual_financials').upsert({
        year,
        rh: data.rh,
        maintenance: data.maintenance,
        material: data.material,
        marketing: data.marketing,
        operational: data.operational,
        equipment: data.equipment,
        interest: data.interest,
        taxes: data.taxes,
        dividends_accounting: data.dividendsAccounting,
        dividends_real: data.dividendsReal
    }, { onConflict: 'year' });

    if (error) {
        console.error('Error saving annual financials:', error.message);
        fetchData();
    }
  }, []);

  const deleteAnnualFinancials = useCallback(async (year: string) => {
    setFinancialData(prevData => {
      const newData = { ...prevData };
      delete newData[year];
      return newData;
    });

    const { error } = await supabase.from('annual_financials').delete().eq('year', year);
    if (error) {
        console.error('Error deleting annual financials:', error.message);
        fetchData();
    }
  }, []);

  return { financialData, updateAnnualFinancials, deleteAnnualFinancials };
};
