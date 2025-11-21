import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jgrwevirrwsnjzmhdjlj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impncndldmlycndzbmp6bWhkamxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODQ2OTgsImV4cCI6MjA3OTI2MDY5OH0.mcPQVyW34sWk7ybb3-FAo0qgSY8KCLrN0TSSArPmRdk';

export const supabase = createClient(supabaseUrl, supabaseKey);
