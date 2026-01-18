/**
 * Toast Component
 * Simple notification system
 */
/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import styles from './Toast.module.css';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onRemove, 300); // Wait for slideDown animation
    };

    useEffect(() => {
        const timer = setTimeout(handleClose, 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`${styles.toast} ${styles[toast.type]} ${isClosing ? styles.closing : ''}`}>
            <span className={styles.message}>{toast.message}</span>
            <button className={styles.closeButton} onClick={handleClose}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 3L3 11M3 3l8 8" />
                </svg>
            </button>
        </div>
    );
}
