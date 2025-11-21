
import { useState, useEffect, useCallback } from 'react';
import type { PartnerDetailsDataByExams, PartnerRecordByExams } from '../types';
import { supabase } from '../supabaseClient';

export const usePartnerDetailsDataByExams = () => {
  const [partnerDetailsData, setPartnerDetailsData] = useState<PartnerDetailsDataByExams>({});

  const fetchData = async () => {
    const { data, error } = await supabase.from('partner_details_by_exams').select('*');
    if (error) {
        console.error("Failed to load partner details by exams:", error.message);
        return;
    }

    const formatted: PartnerDetailsDataByExams = {};
    if (data) {
        data.forEach((row: any) => {
            if (!formatted[row.year]) formatted[row.year] = {};
            if (!formatted[row.year][row.month]) formatted[row.year][row.month] = [];
            formatted[row.year][row.month].push({
                dentistName: row.dentist_name,
                examCount: row.exam_count
            });
        });
    }
    setPartnerDetailsData(formatted);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addPartnerDetails = useCallback(async (year: string, month: string, data: PartnerRecordByExams[]) => {
    setPartnerDetailsData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (!newData[year]) newData[year] = {};
      newData[year][month] = data;
      return newData;
    });

    const { error: deleteError } = await supabase.from('partner_details_by_exams').delete().match({ year, month });
    if (deleteError) {
        console.error("Error clearing details:", deleteError.message);
        return;
    }

    const rows = data.map(record => ({
        year,
        month,
        dentist_name: record.dentistName,
        exam_count: record.examCount
    }));

    const { error: insertError } = await supabase.from('partner_details_by_exams').insert(rows);
    if (insertError) {
        console.error("Error inserting details:", insertError.message);
        fetchData();
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

    const { error } = await supabase.from('partner_details_by_exams').delete().match({ year, month });
    if (error) {
        console.error("Error deleting details:", error.message);
        fetchData();
    }
  }, []);

  return { partnerDetailsData, addPartnerDetails, deletePartnerDetails };
};
