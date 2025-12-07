import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../components/LoadingOverlay';
import LanguageSelector from '../components/LanguageSelector';
import { getCurrentLanguage } from '../i18n';

interface LoginPageProps {
    navigate: (page: string) => void;
}

// TODO: REMOVE THIS MOCK AUTHENTICATION WHEN BACKEND IS READY
// This is temporary mock authentication for development
const MOCK_USERS = {
    'admin@shiftswap.com': { name: 'Admin User', role: 'admin' },
    'teamleader@shiftswap.com': { name: 'Team Leader', role: 'teamleader' },
    'user@shiftswap.com': { name: 'Regular User', role: 'user' }
};

function LoginPage({ navigate }: LoginPageProps) {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        facility: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        // TODO: REMOVE THIS MOCK AUTHENTICATION WHEN BACKEND IS READY
        // Replace with actual API calls to your backend
        if (mode === 'login') {
            // Mock login - only check if email exists, accept any password
            if (MOCK_USERS[formData.email as keyof typeof MOCK_USERS]) {
                const user = MOCK_USERS[formData.email as keyof typeof MOCK_USERS];
                setSuccess(t('login.welcomeUser', { name: user.name }));

                // Store mock user data in sessionStorage with current language preference
                sessionStorage.setItem('mockUser', JSON.stringify({
                    email: formData.email,
                    name: user.name,
                    role: user.role,
                    language: getCurrentLanguage()
                }));

                // Redirect to dashboard after successful login
                setTimeout(() => {
                    navigate('dashboard');
                }, 1500);
            } else {
                setError(t('login.userNotFound'));
            }
        } else if (mode === 'signup') {
            // Mock signup - just show success message
            setSuccess(t('login.accountCreated', { email: formData.email }));
            setTimeout(() => {
                setMode('login');
                setSuccess('');
            }, 2000);
        } else if (mode === 'forgot') {
            // Mock forgot password - just show success message
            setSuccess(t('login.resetLinkSent', { email: formData.email }));
        }
        // END TODO

        setIsSubmitting(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="relative bg-gray-50 min-h-screen">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <img
                                src="/shiftswap_side.png"
                                alt="ShiftSwap"
                                className="h-10 w-auto cursor-pointer"
                                onClick={() => navigate('home')}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageSelector variant="compact" />
                            <button
                                onClick={() => navigate('home')}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                {t('nav.backToHome')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Login Form Section */}
            <section className="py-16 px-6">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-8">
                            <button
                                onClick={() => setMode('login')}
                                className={`flex-1 py-3 text-center font-medium transition ${
                                    mode === 'login'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('login.tabs.login')}
                            </button>
                            <button
                                onClick={() => setMode('signup')}
                                className={`flex-1 py-3 text-center font-medium transition ${
                                    mode === 'signup'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('login.tabs.signup')}
                            </button>
                        </div>

                        {/* Login Form */}
                        {mode === 'login' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {t('login.welcomeBack')}
                                    </h2>
                                    <p className="text-gray-600">
                                        {t('login.signInSubtitle')}
                                    </p>
                                    {/* TODO: REMOVE - Mock login hint */}
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                        <strong>{t('login.demoMode')}:</strong> {t('login.demoModeHint')}
                                        <ul className="mt-2 ml-4 list-disc">
                                            <li>admin@shiftswap.com {t('login.demoAdmin')}</li>
                                            <li>teamleader@shiftswap.com {t('login.demoTeamLeader')}</li>
                                            <li>user@shiftswap.com {t('login.demoUser')}</li>
                                        </ul>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                                        {success}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('login.emailLabel')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('login.emailPlaceholder')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('login.passwordLabel')}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('login.passwordPlaceholder')}
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">
                                            {t('login.rememberMe')}
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setMode('forgot')}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        {t('login.forgotPassword')}
                                    </button>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    {t('login.signIn')}
                                </button>

                                <div className="text-center text-sm text-gray-600">
                                    {t('login.noAccount')}{' '}
                                    <button
                                        onClick={() => setMode('signup')}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {t('login.signUp')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Sign Up Form */}
                        {mode === 'signup' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {t('login.createAccount')}
                                    </h2>
                                    <p className="text-gray-600">
                                        {t('login.signUpSubtitle')}
                                    </p>
                                    {/* TODO: REMOVE - Mock signup hint */}
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                        <strong>{t('login.demoMode')}:</strong> {t('login.accountCreationSimulated')}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                                        {success}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('login.fullNameLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('login.fullNamePlaceholder')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('login.emailLabel')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('login.emailPlaceholder')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('login.facilityLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        name="facility"
                                        value={formData.facility}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('login.facilityPlaceholder')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('login.passwordLabel')}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('login.passwordPlaceholder')}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('login.confirmPasswordLabel')}
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('login.passwordPlaceholder')}
                                        required
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    {t('login.createAccountButton')}
                                </button>

                                <div className="text-center text-sm text-gray-600">
                                    {t('login.hasAccount')}{' '}
                                    <button
                                        onClick={() => setMode('login')}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {t('login.signIn')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Forgot Password Form */}
                        {mode === 'forgot' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {t('login.resetPassword')}
                                    </h2>
                                    <p className="text-gray-600">
                                        {t('login.resetPasswordSubtitle')}
                                    </p>
                                    {/* TODO: REMOVE - Mock password reset hint */}
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                        <strong>{t('login.demoMode')}:</strong> {t('login.passwordResetSimulated')}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                                        {success}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('login.emailLabel')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={t('login.emailPlaceholder')}
                                        required
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    {t('login.sendResetLink')}
                                </button>

                                <div className="text-center text-sm text-gray-600">
                                    {t('login.rememberPassword')}{' '}
                                    <button
                                        onClick={() => setMode('login')}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {t('login.signIn')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        <p>
                            {t('login.termsAgreement')}{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700">
                                {t('login.termsOfService')}
                            </a>{' '}
                            {t('login.and')}{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700">
                                {t('login.privacyPolicy')}
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* Add Loading Overlay */}
            <LoadingOverlay
                isLoading={isSubmitting}
                onTimeout={() => {
                    setIsSubmitting(false);
                    setError(t('login.requestTimeout'));
                }}
            />
        </div>
    );
}

export default LoginPage;
