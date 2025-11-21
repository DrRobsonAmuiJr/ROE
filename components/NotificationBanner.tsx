import React from 'react';

interface NotificationBannerProps {
  onClose: () => void;
}

const EMAIL_TO = 'direcaoroe@gmail.com';
const EMAIL_SUBJECT = 'Ações de Relacionamento';

const NotificationBanner: React.FC<NotificationBannerProps> = ({ onClose }) => {
  const mailtoLink = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;

  return (
    <div className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
      <div className="flex items-center">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-indigo-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM8 16a2 2 0 104 0H8z"/>
          </svg>
        </div>
        <div>
          <p className="font-bold">Lembrete Mensal</p>
          <p className="text-sm">Hoje é dia 05. Deseja enviar o e-mail de "Ações de Relacionamento"?</p>
        </div>
        <div className="ml-auto flex items-center space-x-4">
            <a 
                href={mailtoLink}
                onClick={onClose}
                className="bg-indigo-500 text-white text-sm font-bold py-1 px-3 rounded hover:bg-indigo-600 transition-colors"
            >
                Enviar E-mail
            </a>
            <button onClick={onClose} className="text-indigo-500 hover:text-indigo-700" aria-label="Dispensar lembrete">
                <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.349a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697L11.697 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
