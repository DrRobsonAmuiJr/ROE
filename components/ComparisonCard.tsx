
import React from 'react';

interface ComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  format?: 'currency' | 'number';
}

const ArrowUpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
    </svg>
);

const ArrowDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293l-3-3a1 1 0 011.414-1.414L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

const ComparisonCard: React.FC<ComparisonCardProps> = ({ title, currentValue, previousValue, format = 'number' }) => {
  const difference = currentValue - previousValue;
  const percentageChange = previousValue !== 0 ? (difference / previousValue) * 100 : Infinity;
  const isPositive = difference >= 0;

  const formatValue = (val: number) => format === 'currency'
    ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : val.toLocaleString('pt-BR');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-md font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{formatValue(currentValue)}</p>
      {previousValue > 0 ? (
        <div className={`mt-2 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
          <span className="font-semibold ml-1">{percentageChange.toFixed(2)}%</span>
          <span className="ml-2 text-gray-500">({isPositive ? '+' : ''}{formatValue(difference)})</span>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-400">Sem dados do ano anterior para comparar.</p>
      )}
    </div>
  );
};

export default ComparisonCard;
