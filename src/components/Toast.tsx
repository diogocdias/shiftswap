import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; icon: JSX.Element; iconBg: string }> = {
    success: {
        bg: 'bg-white border-green-200',
        iconBg: 'bg-green-100',
        icon: (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
    error: {
        bg: 'bg-white border-red-200',
        iconBg: 'bg-red-100',
        icon: (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    },
    warning: {
        bg: 'bg-white border-yellow-200',
        iconBg: 'bg-yellow-100',
        icon: (
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    info: {
        bg: 'bg-white border-blue-200',
        iconBg: 'bg-blue-100',
        icon: (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

export function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const styles = toastStyles[type];

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose(id);
        }, 300); // Match animation duration
    };

    return (
        <div
            className={`
                transform transition-all duration-300 ease-out
                ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
        >
            <div className={`
                flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm
                ${styles.bg}
            `}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                    {styles.icon}
                </div>
                <div className="flex-1 pt-0.5">
                    <p className="text-sm text-gray-900 font-medium leading-snug">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition p-1 -mt-1 -mr-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType; duration?: number }>;
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={onClose}
                    />
                </div>
            ))}
        </div>
    );
}
