import React, { useState } from 'react';
import type { MonthlyFinancials } from '../types';

interface MonthlyFinancialsFormProps {
  onSubmit: (year: string, month: string, data: MonthlyFinancials) => void;
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const months = [
    { value: '01', name: 'Janeiro' }, { value: '02', name: 'Fevereiro' },
    { value: '03', name: 'Março' }, { value: '04', name: 'Abril' },
    { value: '05', name: 'Maio' }, { value: '06', name: 'Junho' },
    { value: '07', name: 'Julho' }, { value: '08', name: 'Agosto' },
    { value: '09', name: 'Setembro' }, { value: '10', name: 'Outubro' },
    { value: '11', name: 'Novembro' }, { value: '12', name: 'Dezembro' }
];

const initialFormState = {
  monthlyRevenue: '',
  monthlyProfit: '',
  dividends: '',
  monthlyReserve: '',
};


const MonthlyFinancialsForm: React.FC<MonthlyFinancialsFormProps> = ({ onSubmit }) => {
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth).padStart(2, '0'));
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allFilled = Object.values(formData).every(value => value !== '');
    if (!year || !month || !allFilled) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const numericData: MonthlyFinancials = {
      monthlyRevenue: parseFloat(formData.monthlyRevenue as string),
      monthlyProfit: parseFloat(formData.monthlyProfit as string),
      dividends: parseFloat(formData.dividends as string),
      monthlyReserve: parseFloat(formData.monthlyReserve as string),
    };

    onSubmit(year, month, numericData);
    setFormData(initialFormState);
    alert('Lançamento mensal salvo com sucesso!');
  };

  const renderInput = (id: keyof typeof initialFormState, label: string, placeholder: string) => (
     <div>
      <label htmlFor={id as string} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        id={id as string}
        value={formData[id]}
        onChange={handleChange}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder={placeholder}
        required
        min="0"
        step="0.01"
      />
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Lançamento Financeiro Mensal (Gerência Financeira)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="year-monthly" className="block text-sm font-medium text-gray-700">Ano</label>
            <select
              id="year-monthly"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="month-monthly" className="block text-sm font-medium text-gray-700">Mês</label>
            <select
              id="month-monthly"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {renderInput('monthlyRevenue', 'Receita Mensal (R$)', 'Ex: 150000.00')}
        {renderInput('monthlyProfit', 'Lucro Mensal (R$)', 'Ex: 40000.00')}
        {renderInput('dividends', 'Dividendos Dr Robson Jr (R$)', 'Ex: 20000.00')}
        {renderInput('monthlyReserve', 'Reserva Mensal (R$)', 'Ex: 10000.00')}

        <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 !mt-6">
          Salvar Lançamento Mensal
        </button>
      </form>
    </div>
  );
};

export default MonthlyFinancialsForm;