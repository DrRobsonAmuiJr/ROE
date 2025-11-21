import React, { useState } from 'react';

interface DataInputFormProps {
  onDailySubmit: (date: string, patients: number, revenue: number, docs: number, tomos: number) => void;
}

const DataInputForm: React.FC<DataInputFormProps> = ({ onDailySubmit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [patients, setPatients] = useState('');
  const [revenue, setRevenue] = useState('');
  const [docs, setDocs] = useState('');
  const [tomos, setTomos] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && patients && revenue && docs && tomos) {
      onDailySubmit(date, parseInt(patients, 10), parseFloat(revenue), parseInt(docs, 10), parseInt(tomos, 10));
      setPatients('');
      setRevenue('');
      setDocs('');
      setTomos('');
      alert('Lançamento diário salvo com sucesso!');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Lançamento Diário (Gerência)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="entry-date" className="block text-sm font-medium text-gray-700">Data</label>
          <input
            type="date"
            id="entry-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="patients" className="block text-sm font-medium text-gray-700">Nº de Pacientes Atendidos</label>
          <input
            type="number"
            id="patients"
            value={patients}
            onChange={(e) => setPatients(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: 50"
            required
            min="0"
          />
        </div>
        <div>
          <label htmlFor="revenue" className="block text-sm font-medium text-gray-700">Faturamento do Dia (R$)</label>
          <input
            type="number"
            id="revenue"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: 2500.00"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="docs" className="block text-sm font-medium text-gray-700">Nº de Docs</label>
          <input
            type="number"
            id="docs"
            value={docs}
            onChange={(e) => setDocs(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: 10"
            required
            min="0"
          />
        </div>
        <div>
          <label htmlFor="tomos" className="block text-sm font-medium text-gray-700">Nº de Tomos</label>
          <input
            type="number"
            id="tomos"
            value={tomos}
            onChange={(e) => setTomos(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: 5"
            required
            min="0"
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
          Salvar Lançamento
        </button>
      </form>
    </div>
  );
};

export default DataInputForm;