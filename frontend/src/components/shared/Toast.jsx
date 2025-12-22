import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';

const Toast = ({ type = 'info', message, description, children, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-900',
                    icon: <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-900',
                    icon: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                };
            case 'loading':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-900',
                    icon: <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-900',
                    icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                };
        }
    };

    const styles = getStyles();

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl shadow-xl border backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 ${styles.bg} ${styles.border}`}>
            <div className="flex items-start gap-3">
                {styles.icon}
                <div className="flex-1">
                    <p className={`font-bold ${styles.text}`}>
                        {message}
                    </p>
                    {description && (
                        <p className={`mt-1 text-sm opacity-90 ${styles.text}`}>
                            {description}
                        </p>
                    )}
                    {children}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-black/5 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toast;
