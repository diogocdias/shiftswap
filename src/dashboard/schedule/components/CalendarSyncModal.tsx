import { useState, useEffect } from 'react';

interface CalendarProvider {
    id: string;
    name: string;
    icon: JSX.Element;
    color: string;
    connected: boolean;
    lastSynced?: string;
}

interface CalendarSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSync: (providerId: string) => void;
}

const STORAGE_KEY = 'calendarSyncConnections';

const getStoredConnections = (): Record<string, { connected: boolean; lastSynced?: string }> => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const saveConnections = (connections: Record<string, { connected: boolean; lastSynced?: string }>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
};

export default function CalendarSyncModal({ isOpen, onClose, onSync }: CalendarSyncModalProps) {
    const [providers, setProviders] = useState<CalendarProvider[]>([]);
    const [connecting, setConnecting] = useState<string | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const stored = getStoredConnections();
        setProviders([
            {
                id: 'google',
                name: 'Google Calendar',
                icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                ),
                color: 'bg-white hover:bg-gray-50',
                connected: stored['google']?.connected || false,
                lastSynced: stored['google']?.lastSynced,
            },
            {
                id: 'apple',
                name: 'Apple Calendar',
                icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                ),
                color: 'bg-gray-100 hover:bg-gray-200',
                connected: stored['apple']?.connected || false,
                lastSynced: stored['apple']?.lastSynced,
            },
            {
                id: 'outlook',
                name: 'Outlook Calendar',
                icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.159.152-.356.228-.593.228h-8.5V6.583h8.5c.237 0 .434.076.593.228.158.152.238.346.238.576z" fill="#0364B8"/>
                        <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.159.152-.356.228-.593.228H10.5V4.5h4.169l.831 2.083h8.669c.237 0 .434.076.593.228.158.152.238.346.238.576z" fill="#0078D4"/>
                        <path d="M14.669 4.5L10.5 6.583v14.5L2.831 19.5c-.237 0-.434-.076-.593-.228A.795.795 0 012 18.696V5.5c0-.23.08-.424.238-.576.159-.152.356-.228.593-.228h11.838z" fill="#28A8EA"/>
                        <path d="M10.5 9v10l-8-1.583V7.5L10.5 9z" fill="#0078D4"/>
                        <ellipse cx="6.25" cy="12.75" rx="3" ry="3.5" fill="#fff"/>
                    </svg>
                ),
                color: 'bg-blue-50 hover:bg-blue-100',
                connected: stored['outlook']?.connected || false,
                lastSynced: stored['outlook']?.lastSynced,
            },
            {
                id: 'ical',
                name: 'iCal Export',
                icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
                    </svg>
                ),
                color: 'bg-purple-50 hover:bg-purple-100',
                connected: stored['ical']?.connected || false,
                lastSynced: stored['ical']?.lastSynced,
            },
        ]);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConnect = async (providerId: string) => {
        setConnecting(providerId);
        setMessage(null);

        // Simulate OAuth flow / connection process
        await new Promise(resolve => setTimeout(resolve, 1500));

        const stored = getStoredConnections();
        const provider = providers.find(p => p.id === providerId);

        if (provider?.connected) {
            // Disconnect
            delete stored[providerId];
            saveConnections(stored);
            setProviders(prev => prev.map(p =>
                p.id === providerId
                    ? { ...p, connected: false, lastSynced: undefined }
                    : p
            ));
            setMessage({ type: 'success', text: `Disconnected from ${provider.name}` });
        } else {
            // Connect
            stored[providerId] = { connected: true };
            saveConnections(stored);
            setProviders(prev => prev.map(p =>
                p.id === providerId
                    ? { ...p, connected: true }
                    : p
            ));
            setMessage({ type: 'success', text: `Connected to ${providers.find(p => p.id === providerId)?.name}!` });
        }

        setConnecting(null);
    };

    const handleSync = async (providerId: string) => {
        setSyncing(providerId);
        setMessage(null);

        // Simulate sync process
        await new Promise(resolve => setTimeout(resolve, 2000));

        const now = new Date().toISOString();
        const stored = getStoredConnections();
        stored[providerId] = { connected: true, lastSynced: now };
        saveConnections(stored);

        setProviders(prev => prev.map(p =>
            p.id === providerId
                ? { ...p, lastSynced: now }
                : p
        ));

        onSync(providerId);
        setSyncing(null);
        setMessage({ type: 'success', text: 'Calendar synced successfully! Your shifts have been exported.' });
    };

    const formatLastSynced = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const handleClose = () => {
        setMessage(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Sync Calendar</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Connect your calendar to sync your shifts
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                            message.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                            <div className="flex items-center gap-2">
                                {message.type === 'success' ? (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                {message.text}
                            </div>
                        </div>
                    )}

                    {/* Calendar Providers */}
                    <div className="space-y-3">
                        {providers.map((provider) => (
                            <div
                                key={provider.id}
                                className={`${provider.color} border border-gray-200 rounded-lg p-4 transition`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {provider.icon}
                                        <div>
                                            <div className="font-medium text-gray-900">{provider.name}</div>
                                            {provider.connected && provider.lastSynced && (
                                                <div className="text-xs text-gray-500">
                                                    Last synced: {formatLastSynced(provider.lastSynced)}
                                                </div>
                                            )}
                                            {provider.connected && !provider.lastSynced && (
                                                <div className="text-xs text-green-600">Connected</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {provider.connected && (
                                            <button
                                                onClick={() => handleSync(provider.id)}
                                                disabled={syncing !== null || connecting !== null}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                {syncing === provider.id ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                        </svg>
                                                        Syncing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Sync
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleConnect(provider.id)}
                                            disabled={syncing !== null || connecting !== null}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                                                provider.connected
                                                    ? 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                            }`}
                                        >
                                            {connecting === provider.id ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                    </svg>
                                                    {provider.connected ? 'Disconnecting...' : 'Connecting...'}
                                                </>
                                            ) : provider.connected ? (
                                                'Disconnect'
                                            ) : (
                                                'Connect'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-700">
                                <p className="font-medium">How calendar sync works</p>
                                <p className="mt-1 text-blue-600">
                                    Connect your calendar to automatically add your shifts as events.
                                    Sync anytime to update with your latest schedule.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
