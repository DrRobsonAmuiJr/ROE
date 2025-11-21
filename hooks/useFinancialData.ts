import { useState, useEffect, useCallback } from 'react';
import type { FinancialData, AnnualFinancials } from '../types';

const STORAGE_KEY = 'financialData';

export const useFinancialData = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({});

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setFinancialData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load financial data from localStorage", error);
    }
  }, []);

  const saveData = useCallback((data: FinancialData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setFinancialData(data);
    } catch (error) {
      console.error("Failed to save financial data to localStorage", error);
    }
  }, []);

  const updateAnnualFinancials = useCallback((year: string, data: AnnualFinancials) => {
    setFinancialData(prevData => {
      const newData = { ...prevData, [year]: data };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const deleteAnnualFinancials = useCallback((year: string) => {
    setFinancialData(prevData => {
      const newData = { ...prevData };
      delete newData[year];
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  return { financialData, updateAnnualFinancials, deleteAnnualFinancials };
};
