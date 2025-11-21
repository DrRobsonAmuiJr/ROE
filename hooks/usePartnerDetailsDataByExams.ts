import { useState, useEffect, useCallback } from 'react';
import type { PartnerDetailsDataByExams, PartnerRecordByExams } from '../types';

const STORAGE_KEY = 'partnerDetailsDataByExams';

export const usePartnerDetailsDataByExams = () => {
  const [partnerDetailsData, setPartnerDetailsData] = useState<PartnerDetailsDataByExams>({});

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setPartnerDetailsData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load partner details data (by exams) from localStorage", error);
    }
  }, []);

  const saveData = useCallback((data: PartnerDetailsDataByExams) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setPartnerDetailsData(data);
    } catch (error) {
      console.error("Failed to save partner details data (by exams) to localStorage", error);
    }
  }, []);

  const addPartnerDetails = useCallback((year: string, month: string, data: PartnerRecordByExams[]) => {
    setPartnerDetailsData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (!newData[year]) {
        newData[year] = {};
      }
      newData[year][month] = data;
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const deletePartnerDetails = useCallback((year: string, month: string) => {
    setPartnerDetailsData(prevData => {
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

  return { partnerDetailsData, addPartnerDetails, deletePartnerDetails };
};
