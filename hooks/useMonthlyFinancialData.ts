
import { useState, useEffect, useCallback } from 'react';
import type { MonthlyFinancialData, MonthlyFinancials } from '../types';
import { supabase } from '../supabaseClient';

export const useMonthlyFinancialData = () => {
  const [monthlyFinancialData, setMonthlyFinancialData] = useState<MonthlyFinancialData>({});

  const fetchData = async () => {
    const { data, error } = await supabase.from('monthly_financials').select('*');
    if (error) {
        console.error("Failed to load monthly financial data:", error.message);
        return;
    }
    
    const formatted: MonthlyFinancialData = {};
    if (data) {
        data.forEach((row: any) => {
            if (!formatted[row.year]) formatted[row.year] = {};
            formatted[row.year][row.month] = {
                monthlyRevenue: row.monthly_revenue,
                monthlyProfit: row.monthly_profit,
                dividends: row.dividends,
                monthlyReserve: row.monthly_reserve
            };
        });
    }
    setMonthlyFinancialData(formatted);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateMonthlyEntry = useCallback(async (year: string, month: string, data: MonthlyFinancials) => {
    setMonthlyFinancialData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (!newData[year]) newData[year] = {};
      newData[year][month] = data;
      return newData;
    });

    const { error } = await supabase.from('monthly_financials').upsert({
        year,
        month,
        monthly_revenue: data.monthlyRevenue,
        monthly_profit: data.monthlyProfit,
        dividends: data.dividends,
        monthly_reserve: data.monthlyReserve
    }, { onConflict: 'year,month' });

    if (error) {
        console.error('Error updating monthly entry:', error.message);
        fetchData();
    }
  }, []);

  const deleteMonthlyEntry = useCallback(async (year: string, month: string) => {
    setMonthlyFinancialData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[year]?.[month]) {
        delete newData[year][month];
        if (Object.keys(newData[year]).length === 0) delete newData[year];
      }
      return newData;
    });

    const { error } = await supabase.from('monthly_financials').delete().match({ year, month });
    if (error) {
        console.error('Error deleting monthly entry:', error.message);
        fetchData();
    }
  }, []);

  return { monthlyFinancialData, updateMonthlyEntry, deleteMonthlyEntry };
};
