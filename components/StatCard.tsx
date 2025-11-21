import React from 'react';

// Icons for comparison indicator
const ArrowUpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
    </svg>
);

const ArrowDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293l-3-3a1 1 0 011.414-1.414L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);


interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'number' | 'percentage';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, previousValue, format = 'number' }) => {
  let formattedValue: string;

  switch (format) {
    case 'currency':
      formattedValue = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      break;
    case 'percentage':
      formattedValue = `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
      break;
    case 'number':
    default:
      formattedValue = value.toLocaleString('pt-BR');
      break;
  }
  
  const hasPreviousValue = typeof previousValue === 'number';
  const difference = hasPreviousValue ? value - previousValue! : 0;
  // Handle case where previousValue is 0 to avoid division by zero.
  // If current value is > 0, it's infinite growth. If 0, no change.
  const percentageChange = hasPreviousValue && previousValue !== 0 
    ? (difference / previousValue!) * 100 
    : (hasPreviousValue && value > 0 ? Infinity : 0);
  const isPositive = difference >= 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-md font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{formattedValue}</p>
      {hasPreviousValue ? (
          previousValue! > 0 ? (
            <div className={`mt-1 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              <span className="font-semibold ml-1">
                {isFinite(percentageChange) ? `${percentageChange.toFixed(2)}%` : 'Crescimento'}
              </span>
              <span className="ml-2 text-gray-500 text-xs">vs período anterior</span>
            </div>
          ) : (
             <p className="mt-1 text-sm text-gray-400">Sem dados do período anterior para comparar.</p>
          )
      ) : null}
    </div>
  );
};

export default StatCard;