import { useState, useEffect, useCallback } from 'react';
import type { PartnersDataByExams, PartnerMovement } from '../types';

const STORAGE_KEY = 'partnersDataByExams';

export const usePartnersDataByExams = () => {
  const [partnersData, setPartnersData] = useState<PartnersDataByExams>({});

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setPartnersData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load partners data (by exams) from localStorage", error);
    }
  }, []);

  const saveData = useCallback((data: PartnersDataByExams) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setPartnersData(data);
    } catch (error) {
      console.error("Failed to save partners data (by exams) to localStorage", error);
    }
  }, []);

  const addPartnerMovement = useCallback((year: string, month: string, file: File) => {
    const newMovement: PartnerMovement = {
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
    };

    setPartnersData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (!newData[year]) {
        newData[year] = {};
      }
      newData[year][month] = newMovement;
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const deletePartnerMovement = useCallback((year: string, month: string) => {
    setPartnersData(prevData => {
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

  return { partnersData, addPartnerMovement, deletePartnerMovement };
};
