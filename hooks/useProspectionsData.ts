
import { useState, useEffect, useCallback } from 'react';
import type { ProspectionsData, Prospection } from '../types';
import { supabase } from '../supabaseClient';

export const useProspectionsData = () => {
  const [prospectionsData, setProspectionsData] = useState<ProspectionsData>([]);

  const fetchData = async () => {
    const { data, error } = await supabase.from('prospections').select('*');
    if (error) {
        console.error("Failed to load prospections:", error.message);
        return;
    }
    if (data) {
        const formatted = data.map((row: any) => ({
            id: row.id,
            dentistName: row.dentist_name,
            meetingDate: row.meeting_date
        }));
        setProspectionsData(formatted);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addProspection = useCallback(async (dentistName: string, meetingDate: string) => {
    // For optimistic update we need a temp ID, but since we are inserting, we can just wait or fetch.
    // To keep it snappy, let's insert and refresh.
    const { error } = await supabase.from('prospections').insert({
        dentist_name: dentistName,
        meeting_date: meetingDate
    });

    if (error) {
        console.error('Error adding prospection:', error.message);
    } else {
        fetchData();
    }
  }, []);

  const deleteProspection = useCallback(async (id: number) => {
    setProspectionsData(prevData => prevData.filter(p => p.id !== id));

    const { error } = await supabase.from('prospections').delete().eq('id', id);
    if (error) {
        console.error('Error deleting prospection:', error.message);
        fetchData();
    }
  }, []);

  return { prospectionsData, addProspection, deleteProspection };
};
