import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

const typeConfig = {
    success: {
        icon: CheckCircle2,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.2)',
    },
    error: {
        icon: AlertCircle,
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.2)',
    },
    warning: {
        icon: AlertTriangle,
        color: '#F25623',
        bg: 'rgba(242, 86, 35, 0.08)',
        border: 'rgba(242, 86, 35, 0.2)',
    },
    info: {
        icon: Info,
        color: '#60a5fa',
        bg: 'rgba(96, 165, 250, 0.08)',
        border: 'rgba(96, 165, 250, 0.2)',
    },
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '400px' }}>
                <AnimatePresence>
                    {toasts.map((t) => {
                        const config = typeConfig[t.type] || typeConfig.info;
                        const Icon = config.icon;
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="pointer-events-auto"
                            >
                                <div
                                    className="relative overflow-hidden rounded-xl shadow-2xl backdrop-blur-xl"
                                    style={{
                                        background: '#0a0a0a',
                                        border: `1px solid ${config.border}`,
                                        minWidth: '300px',
                                    }}
                                >
                                    <div className="flex items-center gap-3 px-4 py-3.5 pr-10">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: config.bg }}
                                        >
                                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                                        </div>
                                        <p className="text-[13px] font-semibold text-white leading-snug">{t.message}</p>
                                    </div>
                                    <button
                                        onClick={() => removeToast(t.id)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5 text-[#A3A3A3]" />
                                    </button>
                                    {/* Progress bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `${config.color}10` }}>
                                        <motion.div
                                            className="h-full"
                                            style={{ background: config.color }}
                                            initial={{ width: '100%' }}
                                            animate={{ width: '0%' }}
                                            transition={{ duration: 4, ease: 'linear' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
