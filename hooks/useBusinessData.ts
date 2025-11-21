import { useState, useEffect, useCallback } from 'react';
import type { BusinessData } from '../types';

const STORAGE_KEY = 'businessData';

export const useBusinessData = () => {
  const [businessData, setBusinessData] = useState<BusinessData>({});

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setBusinessData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const saveData = useCallback((data: BusinessData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setBusinessData(data);
    } catch (error)
 {
      console.error("Failed to save data to localStorage", error);
    }
  }, []);

  const updateDailyEntry = useCallback((date: string, patients: number, revenue: number, docs: number, tomos: number) => {
    const [year, month, day] = date.split('-');
    
    setBusinessData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      if (!newData[year]) newData[year] = {};
      if (!newData[year][month]) newData[year][month] = { days: {} };
      
      if (!newData[year][month]['days']) newData[year][month]['days'] = {};
      
      newData[year][month].days[day] = { patients, revenue, docs, tomos };
      
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const deleteDailyEntry = useCallback((date: string) => {
    const [year, month, day] = date.split('-');

    setBusinessData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));

      if (newData[year]?.[month]?.days?.[day]) {
        delete newData[year][month].days[day];

        if (Object.keys(newData[year][month].days).length === 0) {
          delete newData[year][month];
        }

        if (Object.keys(newData[year]).length === 0) {
          delete newData[year];
        }
      }

      saveData(newData);
      return newData;
    });
  }, [saveData]);


  return { businessData, updateDailyEntry, deleteDailyEntry };
};