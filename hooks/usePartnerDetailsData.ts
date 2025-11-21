
import { useState, useEffect, useCallback } from 'react';
import type { PartnerDetailsData, PartnerRecord } from '../types';
import { supabase } from '../supabaseClient';

export const usePartnerDetailsData = () => {
  const [partnerDetailsData, setPartnerDetailsData] = useState<PartnerDetailsData>({});

  const fetchData = async () => {
    const { data, error } = await supabase.from('partner_details').select('*');
    if (error) {
        console.error("Failed to load partner details:", error.message);
        return;
    }

    const formatted: PartnerDetailsData = {};
    if (data) {
        data.forEach((row: any) => {
            if (!formatted[row.year]) formatted[row.year] = {};
            if (!formatted[row.year][row.month]) formatted[row.year][row.month] = [];
            formatted[row.year][row.month].push({
                dentistName: row.dentist_name,
                examValue: row.exam_value
            });
        });
    }
    setPartnerDetailsData(formatted);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addPartnerDetails = useCallback(async (year: string, month: string, data: PartnerRecord[]) => {
    // Optimistic UI update
    setPartnerDetailsData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (!newData[year]) newData[year] = {};
      newData[year][month] = data;
      return newData;
    });

    // Transaction-like behavior: Delete existing for this month/year, then insert new
    const { error: deleteError } = await supabase.from('partner_details').delete().match({ year, month });
    if (deleteError) {
        console.error("Error clearing existing partner details:", deleteError.message);
        return;
    }

    // Chunk inserts if necessary (Supabase usually handles batch well, but large excel files might need chunks)
    const rows = data.map(record => ({
        year,
        month,
        dentist_name: record.dentistName,
        exam_value: record.examValue
    }));

    const { error: insertError } = await supabase.from('partner_details').insert(rows);
    if (insertError) {
        console.error("Error inserting partner details:", insertError.message);
        fetchData(); // Revert state on error
    }
  }, []);

  const deletePartnerDetails = useCallback(async (year: string, month: string) => {
    setPartnerDetailsData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[year]?.[month]) {
        delete newData[year][month];
        if (Object.keys(newData[year]).length === 0) delete newData[year];
      }
      return newData;
    });

    const { error } = await supabase.from('partner_details').delete().match({ year, month });
    if (error) {
        console.error("Error deleting partner details:", error.message);
        fetchData();
    }
  }, []);

  return { partnerDetailsData, addPartnerDetails, deletePartnerDetails };
};
