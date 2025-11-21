
import { useState, useEffect, useCallback } from 'react';
import type { DeclineReasonsData, DeclineReason } from '../types';
import { supabase } from '../supabaseClient';

export const useDeclineReasons = () => {
  const [declineReasons, setDeclineReasons] = useState<DeclineReasonsData>({});

  const fetchData = async () => {
    const { data, error } = await supabase.from('decline_reasons').select('*');
    if (error) {
        console.error("Failed to load decline reasons:", error.message);
        return;
    }
    const formatted: DeclineReasonsData = {};
    if (data) {
        data.forEach((row: any) => {
            formatted[row.key] = row.reason as DeclineReason;
        });
    }
    setDeclineReasons(formatted);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateDeclineReason = useCallback(async (key: string, reason: DeclineReason) => {
    setDeclineReasons(prevData => {
      const newData = { ...prevData };
      if (reason === '') {
        delete newData[key];
      } else {
        newData[key] = reason;
      }
      return newData;
    });

    if (reason === '') {
        const { error } = await supabase.from('decline_reasons').delete().eq('key', key);
        if (error) { console.error('Error deleting reason:', error.message); fetchData(); }
    } else {
        const { error } = await supabase.from('decline_reasons').upsert({ key, reason }, { onConflict: 'key' });
        if (error) { console.error('Error updating reason:', error.message); fetchData(); }
    }
  }, []);

  return { declineReasons, updateDeclineReason };
};
