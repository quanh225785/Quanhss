import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/shared/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback(({ type, message, description, duration }) => {
        setToast({ type, message, description, duration });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    description={toast.description}
                    duration={toast.duration}
                    onClose={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
