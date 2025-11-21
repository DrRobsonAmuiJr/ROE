
import { useState, useEffect, useCallback } from 'react';
import type { BusinessData } from '../types';
import { supabase } from '../supabaseClient';

export const useBusinessData = () => {
  const [businessData, setBusinessData] = useState<BusinessData>({});

  const fetchData = async () => {
    const { data, error } = await supabase.from('daily_entries').select('*');
    if (error) {
      console.error("Failed to load business data from Supabase:", error.message);
      return;
    }

    const formattedData: BusinessData = {};
    if (data) {
        data.forEach((row: any) => {
            const [year, month, day] = row.date.split('-');
            
            if (!formattedData[year]) formattedData[year] = {};
            if (!formattedData[year][month]) formattedData[year][month] = { days: {} };
            if (!formattedData[year][month]['days']) formattedData[year][month]['days'] = {};
            
            formattedData[year][month].days[day] = { 
                patients: row.patients, 
                revenue: row.revenue, 
                docs: row.docs, 
                tomos: row.tomos 
            };
        });
    }
    setBusinessData(formattedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateDailyEntry = useCallback(async (date: string, patients: number, revenue: number, docs: number, tomos: number) => {
    // Optimistic Update
    setBusinessData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const [year, month, day] = date.split('-');
      
      if (!newData[year]) newData[year] = {};
      if (!newData[year][month]) newData[year][month] = { days: {} };
      if (!newData[year][month]['days']) newData[year][month]['days'] = {};
      
      newData[year][month].days[day] = { patients, revenue, docs, tomos };
      return newData;
    });

    // Supabase Sync
    const { error } = await supabase.from('daily_entries').upsert({
        date,
        patients,
        revenue,
        docs,
        tomos
    }, { onConflict: 'date' });

    if (error) {
        console.error('Error updating daily entry in Supabase:', error.message);
        // Revert or re-fetch could happen here
        fetchData();
    }
  }, []);

  const deleteDailyEntry = useCallback(async (date: string) => {
    // Optimistic Update
    setBusinessData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const [year, month, day] = date.split('-');

      if (newData[year]?.[month]?.days?.[day]) {
        delete newData[year][month].days[day];
        if (Object.keys(newData[year][month].days).length === 0) delete newData[year][month];
        if (Object.keys(newData[year]).length === 0) delete newData[year];
      }
      return newData;
    });

    // Supabase Sync
    const { error } = await supabase.from('daily_entries').delete().eq('date', date);

    if (error) {
        console.error('Error deleting daily entry in Supabase:', error.message);
        fetchData();
    }
  }, []);


  return { businessData, updateDailyEntry, deleteDailyEntry };
};
