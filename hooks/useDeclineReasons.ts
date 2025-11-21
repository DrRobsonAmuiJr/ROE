import { useState, useEffect, useCallback } from 'react';
import type { DeclineReasonsData, DeclineReason } from '../types';

const STORAGE_KEY = 'declineReasonsData';

export const useDeclineReasons = () => {
  const [declineReasons, setDeclineReasons] = useState<DeclineReasonsData>({});

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setDeclineReasons(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load decline reasons data from localStorage", error);
    }
  }, []);

  const saveData = useCallback((data: DeclineReasonsData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setDeclineReasons(data);
    } catch (error) {
      console.error("Failed to save decline reasons data to localStorage", error);
    }
  }, []);

  const updateDeclineReason = useCallback((key: string, reason: DeclineReason) => {
    setDeclineReasons(prevData => {
      const newData = { ...prevData };
      if (reason === '') {
        delete newData[key];
      } else {
        newData[key] = reason;
      }
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  return { declineReasons, updateDeclineReason };
};
