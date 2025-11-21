
import { useState, useEffect, useCallback } from 'react';
import type { PartnersDataByExams, PartnerMovement } from '../types';
import { supabase } from '../supabaseClient';

export const usePartnersDataByExams = () => {
  const [partnersData, setPartnersData] = useState<PartnersDataByExams>({});

  const fetchData = async () => {
    const { data, error } = await supabase.from('partner_movements_by_exams').select('*');
    if (error) {
        console.error("Failed to load partner movements by exams:", error.message);
        return;
    }
    const formatted: PartnersDataByExams = {};
    if (data) {
        data.forEach((row: any) => {
            if (!formatted[row.year]) formatted[row.year] = {};
            formatted[row.year][row.month] = {
                fileName: row.file_name,
                uploadDate: row.upload_date,
                fileSize: row.file_size
            };
        });
    }
    setPartnersData(formatted);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addPartnerMovement = useCallback(async (year: string, month: string, file: File) => {
    const newMovement: PartnerMovement = {
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
    };

    setPartnersData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (!newData[year]) newData[year] = {};
      newData[year][month] = newMovement;
      return newData;
    });

    const { error } = await supabase.from('partner_movements_by_exams').upsert({
        year,
        month,
        file_name: newMovement.fileName,
        upload_date: newMovement.uploadDate,
        file_size: newMovement.fileSize
    }, { onConflict: 'year,month' });

    if (error) {
        console.error("Error saving partner movement by exams:", error.message);
        fetchData();
    }
  }, []);

  const deletePartnerMovement = useCallback(async (year: string, month: string) => {
    setPartnersData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (newData[year]?.[month]) {
        delete newData[year][month];
        if (Object.keys(newData[year]).length === 0) delete newData[year];
      }
      return newData;
    });

    const { error } = await supabase.from('partner_movements_by_exams').delete().match({ year, month });
    if (error) {
        console.error("Error deleting partner movement by exams:", error.message);
        fetchData();
    }
  }, []);

  return { partnersData, addPartnerMovement, deletePartnerMovement };
};
