import React, { useState, useRef } from 'react';
import type { PartnerRecordByExams } from '../types';

// Import xlsx library for parsing Excel files
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs';

interface PartnersMovementByExamsFormProps {
  onAddMovement: (year: string, month: string, file: File) => void;
  onAddDetails: (year: string, month: string, data: PartnerRecordByExams[]) => void;
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

const PartnersMovementByExamsForm: React.FC<PartnersMovementByExamsFormProps> = ({ onAddMovement, onAddDetails }) => {
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth).padStart(2, '0'));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setSelectedFile(e.target.files[0]);
    }
  };
  
  const parseFile = (file: File): Promise<PartnerRecordByExams[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (rows.length < 2) {
                    return reject(new Error("O arquivo está vazio ou contém apenas o cabeçalho."));
                }
                
                const dataRows = rows.slice(1);
                
                const records: PartnerRecordByExams[] = dataRows.map((row, index) => {
                    if (!row || row.length === 0) {
                        return null;
                    }
                    
                    if (row.length < 3 || row[1] === undefined || row[2] === undefined) {
                         if (row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')) {
                             throw new Error(`A linha ${index + 2} do arquivo parece estar incompleta. Verifique se possui 3 colunas.`);
                         }
                        return null;
                    }

                    const dentistName = String(row[1]);
                    const examCountRaw = row[2];

                    if (!dentistName.trim()) {
                        return null;
                    }
                    
                    const examCount = parseInt(String(examCountRaw), 10);

                    if (isNaN(examCount)) {
                        throw new Error(`Número de exames inválido para "${dentistName}" na linha ${index + 2} (valor: "${examCountRaw}"). O valor deve ser um número inteiro.`);
                    }

                    return { dentistName, examCount };
                }).filter((record): record is PartnerRecordByExams => record !== null);

                if (records.length === 0) {
                    reject(new Error("Nenhum registro válido encontrado no arquivo. Verifique o formato das colunas (Ranking, Nome, Número de Exames)."));
                } else {
                    resolve(records);
                }

            } catch (error) {
                console.error("Erro ao processar o arquivo:", error);
                reject(error instanceof Error ? error : new Error("Ocorreu um erro desconhecido ao processar o arquivo. Certifique-se de que é um arquivo .xlsx ou .csv válido com 3 colunas: Ranking, Nome do Dentista e Número de Exames."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !month || !selectedFile) {
        alert('Por favor, selecione o ano, mês e um arquivo para enviar.');
        return;
    }
    
    setIsLoading(true);
    try {
      const parsedData = await parseFile(selectedFile);
      
      onAddMovement(year, month, selectedFile);
      onAddDetails(year, month, parsedData);
      
      alert(`Arquivo "${selectedFile.name}" enviado e processado com sucesso para ${months.find(m => m.value === month)?.name}/${year}.`);
      
      setSelectedFile(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
    } catch (error: any) {
        alert(`Erro ao processar o arquivo: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Movimentação Mensal Parceiros (por número de exames)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="year-partner-exams" className="block text-sm font-medium text-gray-700">Ano</label>
            <select
              id="year-partner-exams"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="month-partner-exams" className="block text-sm font-medium text-gray-700">Mês</label>
            <select
              id="month-partner-exams"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Relação de Dentistas (Excel/CSV)</label>
             <p className="text-xs text-gray-500 mb-1">O arquivo deve ter 3 colunas (Ranking, Nome do Dentista, Número de Exames). A primeira linha será ignorada como cabeçalho.</p>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload-partner-exams" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Carregar um arquivo</span>
                            <input id="file-upload-partner-exams" name="file-upload-partner-exams" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls, .csv" ref={fileInputRef} />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">.xlsx, .xls, .csv</p>
                </div>
            </div>
            {selectedFile && (
                <p className="mt-2 text-sm text-gray-500">Arquivo selecionado: <span className="font-medium">{selectedFile.name}</span></p>
            )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 !mt-6 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processando...' : 'Enviar Relação'}
        </button>
      </form>
    </div>
  );
};

export default PartnersMovementByExamsForm;
