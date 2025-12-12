import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* Usage example:
<LoadingOverlay
  isLoading={isLoadingMenu}
  timeout={5000}
  onTimeout={() => {
    // Handle timeout
    setIsLoadingMenu(false);
    showErrorMessage();
  }}
/>
 */

interface LoadingOverlayProps {
    isLoading: boolean;
    timeout?: number;
    onTimeout?: () => void;
}

export function LoadingOverlay({ isLoading, timeout = 5000, onTimeout }: LoadingOverlayProps) {
    const { t } = useTranslation();
    const [showTimeout, setShowTimeout] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setShowTimeout(false);
            return;
        }

        const timer = setTimeout(() => {
            setShowTimeout(true);
            if (onTimeout) {
                onTimeout();
            }
        }, timeout);

        return () => clearTimeout(timer);
    }, [isLoading, timeout, onTimeout]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
                {!showTimeout ? (
                    <>
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-gray-700 font-medium">{t('common.loading')}</div>
                    </>
                ) : (
                    <>
                        <div className="text-red-600 font-medium">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('common.requestTimeout')}
                        </div>
                        <div className="text-sm text-gray-600">
                            {t('common.serverTakingTooLong')}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
