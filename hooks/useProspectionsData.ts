import { useState, useEffect, useCallback } from 'react';
import type { ProspectionsData, Prospection } from '../types';

const STORAGE_KEY = 'prospectionsData';

export const useProspectionsData = () => {
  const [prospectionsData, setProspectionsData] = useState<ProspectionsData>([]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setProspectionsData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load prospections data from localStorage", error);
    }
  }, []);

  const saveData = useCallback((data: ProspectionsData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setProspectionsData(data);
    } catch (error) {
      console.error("Failed to save prospections data to localStorage", error);
    }
  }, []);

  const addProspection = useCallback((dentistName: string, meetingDate: string) => {
    const newProspection: Prospection = {
      id: Date.now(),
      dentistName,
      meetingDate,
    };
    setProspectionsData(prevData => {
      const newData = [...prevData, newProspection];
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const deleteProspection = useCallback((id: number) => {
    setProspectionsData(prevData => {
      const newData = prevData.filter(p => p.id !== id);
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  return { prospectionsData, addProspection, deleteProspection };
};
