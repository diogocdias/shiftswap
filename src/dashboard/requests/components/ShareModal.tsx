import React from "react";
import { useTranslation } from 'react-i18next';
import { SwapRequest } from "../Types.ts";

interface ShareSwapModalProps {
    show: boolean;
    request: SwapRequest | null;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    setRequest: React.Dispatch<React.SetStateAction<SwapRequest | null>>;
    shareToApp: (app: "whatsapp" | "telegram" | "messenger" | "sms" | "copy") => void;
}

export const ShareSwapModal: React.FC<ShareSwapModalProps> = ({
                                                                  show,
                                                                  request,
                                                                  setShow,
                                                                  setRequest,
                                                                  shareToApp,
                                                              }) => {
    const { t } = useTranslation();

    if (!show || !request) return null;

    const handleClose = () => {
        setShow(false);
        setRequest(null);
    };

    const shareOptions = [
        { app: "whatsapp", label: t('requests.shareModal.whatsapp'), bg: "bg-green-500", color: "bg-green-50", emoji: "💬" },
        { app: "telegram", label: t('requests.shareModal.telegram'), bg: "bg-blue-500", color: "bg-blue-50", emoji: "✈️" },
        { app: "messenger", label: t('requests.shareModal.messenger'), bg: "bg-purple-500", color: "bg-purple-50", emoji: "💬" },
        { app: "sms", label: t('requests.shareModal.sms'), bg: "bg-gray-500", color: "bg-gray-50", emoji: "💬" },
        { app: "copy", label: t('requests.shareModal.copyLink'), bg: "bg-gray-500", color: "bg-gray-50", emoji: "📋" },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {t('requests.shareModal.title')}
                        </h2>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {shareOptions.map(({ app, label, bg, color, emoji }) => (
                            <button
                                key={app}
                                onClick={() => shareToApp(app as any)}
                                className={`w-full flex items-center gap-4 p-4 ${color} hover:opacity-90 border border-gray-200 rounded-lg transition`}
                            >
                                <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center text-white text-2xl`}>
                                    {emoji}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-900">{label}</div>
                                    <div className="text-sm text-gray-600">{t('requests.shareModal.shareVia')} {label}</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
