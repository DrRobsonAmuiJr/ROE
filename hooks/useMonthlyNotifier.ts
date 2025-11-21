import { useState, useEffect } from 'react';

const NOTIFICATION_DAY = 5;
const STORAGE_KEY = 'lastNotificationMonth';

export const useMonthlyNotifier = () => {
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonthIdentifier = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        try {
            const lastNotifiedMonth = localStorage.getItem(STORAGE_KEY);
            
            if (currentDay === NOTIFICATION_DAY && lastNotifiedMonth !== currentMonthIdentifier) {
                setShowNotification(true);
            }
        } catch (error) {
            console.error("Erro ao verificar o estado da notificação:", error);
        }
    }, []); // Executa apenas na montagem inicial do app

    const notificationHandled = () => {
        setShowNotification(false);
        try {
            const today = new Date();
            const currentMonthIdentifier = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            localStorage.setItem(STORAGE_KEY, currentMonthIdentifier);
        } catch (error) {
            console.error("Erro ao atualizar o estado da notificação:", error);
        }
    };

    return { showNotification, notificationHandled };
};
