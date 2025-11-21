import React, { useState, useMemo } from 'react';
import type { ProspectionsData, Prospection } from '../types';

interface ProspectionsListProps {
  prospectionsData: ProspectionsData;
  addProspection: (dentistName: string, meetingDate: string) => void;
  deleteProspection: (id: number) => void;
}

const ProspectionsList: React.FC<ProspectionsListProps> = ({ prospectionsData, addProspection, deleteProspection }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [dentistName, setDentistName] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);

  const sortedProspections = useMemo(() => {
    return [...prospectionsData].sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }, [prospectionsData]);

  const groupedProspections = useMemo(() => {
    const groups: { [year: string]: ProspectionsData } = {};
    sortedProspections.forEach(p => {
        const meetingDateObj = new Date(p.meetingDate + 'T00:00:00'); // Treat date as local
        const year = meetingDateObj.getFullYear().toString();
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(p);
    });
    return groups;
  }, [sortedProspections]);

  const sortedYears = useMemo(() => {
    return Object.keys(groupedProspections).sort((a, b) => b.localeCompare(a)); // Sort years descending
  }, [groupedProspections]);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setDentistName('');
    setMeetingDate(new Date().toISOString().split('T')[0]);
  };

  const handleSave = () => {
    if (dentistName.trim() && meetingDate) {
      addProspection(dentistName.trim(), meetingDate);
      handleCancel();
    } else {
      alert('Por favor, preencha o nome do dentista e a data da reunião.');
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Tem certeza que deseja deletar a prospecção com "${name}"?`)) {
      deleteProspection(id);
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Vendas (Prospecções)</h2>
        {!isAdding && (
          <button
            onClick={handleAddClick}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-sm font-medium"
          >
            Adicionar
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6 space-y-4">
          <div>
            <label htmlFor="dentistName" className="block text-sm font-medium text-gray-700">Dentista</label>
            <input
              type="text"
              id="dentistName"
              value={dentistName}
              onChange={(e) => setDentistName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ex: Dra. Maria José"
              required
            />
          </div>
          <div>
            <label htmlFor="meetingDate" className="block text-sm font-medium text-gray-700">Data da Reunião</label>
            <input
              type="date"
              id="meetingDate"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={handleCancel} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-sm font-medium">Cancelar</button>
            <button onClick={handleSave} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm font-medium">Salvar</button>
          </div>
        </div>
      )}

      {sortedYears.length > 0 ? (
        <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
            {sortedYears.map(year => (
                <div key={year}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{`Ano de ${year}`}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Nº da Reunião</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dentista</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data da Reunião</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {groupedProspections[year].map((prospection, index) => (
                                    <tr key={prospection.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{prospection.dentistName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(prospection.meetingDate)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                        <button 
                                            onClick={() => handleDelete(prospection.id, prospection.dentistName)}
                                            className="text-red-600 hover:text-red-900 font-medium focus:outline-none focus:underline"
                                            aria-label={`Deletar prospecção com ${prospection.dentistName}`}
                                        >
                                            Deletar
                                        </button>
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">Nenhuma prospecção adicionada.</p>
      )}
    </div>
  );
};

export default ProspectionsList;
