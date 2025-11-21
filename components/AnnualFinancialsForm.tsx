import React, { useState } from 'react';
import type { AnnualFinancials } from '../types';

interface AnnualFinancialsFormProps {
  onSubmit: (year: string, data: AnnualFinancials) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const initialFormState = {
  rh: '',
  maintenance: '',
  material: '',
  marketing: '',
  operational: '',
  equipment: '',
  interest: '',
  taxes: '',
  dividendsAccounting: '',
  dividendsReal: '',
};

const AnnualFinancialsForm: React.FC<AnnualFinancialsFormProps> = ({ onSubmit }) => {
  const [year, setYear] = useState(String(currentYear));
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allFilled = Object.values(formData).every(value => value !== '');
    if (!year || !allFilled) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const numericData: AnnualFinancials = {
      rh: parseFloat(formData.rh),
      maintenance: parseFloat(formData.maintenance),
      material: parseFloat(formData.material),
      marketing: parseFloat(formData.marketing),
      operational: parseFloat(formData.operational),
      equipment: parseFloat(formData.equipment),
      interest: parseFloat(formData.interest),
      taxes: parseFloat(formData.taxes),
      dividendsAccounting: parseFloat(formData.dividendsAccounting),
      dividendsReal: parseFloat(formData.dividendsReal),
    };

    onSubmit(year, numericData);
    setFormData(initialFormState);
    alert('Lançamento anual salvo com sucesso!');
  };

  const renderInput = (id: keyof typeof initialFormState, label: string, placeholder: string) => (
     <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        id={id}
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
      <h2 className="text-xl font-bold mb-4 text-gray-800">Lançamento Financeiro Anual (Diretor)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">Ano</label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <h3 className="text-md font-semibold text-gray-600 pt-4 pb-2 border-b">Despesas</h3>
        {renderInput('rh', 'Mensal RH (R$)', 'Ex: 120000.00')}
        {renderInput('maintenance', 'Manutenção (R$)', 'Ex: 15000.00')}
        {renderInput('material', 'Material (R$)', 'Ex: 25000.00')}
        {renderInput('marketing', 'Marketing (R$)', 'Ex: 10000.00')}
        {renderInput('operational', 'Operacional (outros) (R$)', 'Ex: 5000.00')}
        
        <h3 className="text-md font-semibold text-gray-600 pt-4 pb-2 border-b">Investimentos e Juros</h3>
        {renderInput('equipment', 'Equipamentos e Predial (R$)', 'Ex: 50000.00')}
        {renderInput('interest', 'Juros (R$)', 'Ex: 8000.00')}

        <h3 className="text-md font-semibold text-gray-600 pt-4 pb-2 border-b">Impostos</h3>
        {renderInput('taxes', 'Simples Nacional (R$)', 'Ex: 30000.00')}

        <h3 className="text-md font-semibold text-gray-600 pt-4 pb-2 border-b">Dividendos Dr Robson Jr</h3>
        {renderInput('dividendsAccounting', 'Contábeis (R$)', 'Ex: 100000.00')}
        {renderInput('dividendsReal', 'Real (R$)', 'Ex: 80000.00')}

        <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 !mt-6">
          Salvar Lançamento Anual
        </button>
      </form>
    </div>
  );
};

export default AnnualFinancialsForm;