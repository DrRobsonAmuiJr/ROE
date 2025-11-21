import { useState, useEffect, useCallback } from 'react';
import type { MonthlyFinancialData, MonthlyFinancials } from '../types';

const STORAGE_KEY = 'monthlyFinancialData';

export const useMonthlyFinancialData = () => {
  const [monthlyFinancialData, setMonthlyFinancialData] = useState<MonthlyFinancialData>({});

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setMonthlyFinancialData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load monthly financial data from localStorage", error);
    }
  }, []);

  const saveData = useCallback((data: MonthlyFinancialData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setMonthlyFinancialData(data);
    } catch (error) {
      console.error("Failed to save monthly financial data to localStorage", error);
    }
  }, []);

  const updateMonthlyEntry = useCallback((year: string, month: string, data: MonthlyFinancials) => {
    setMonthlyFinancialData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (!newData[year]) {
        newData[year] = {};
      }
      newData[year][month] = data;
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const deleteMonthlyEntry = useCallback((year: string, month: string) => {
    setMonthlyFinancialData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[year]?.[month]) {
        delete newData[year][month];
        if (Object.keys(newData[year]).length === 0) {
          delete newData[year];
        }
      }
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  return { monthlyFinancialData, updateMonthlyEntry, deleteMonthlyEntry };
};