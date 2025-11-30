import { useState } from 'react';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // TODO: REMOVE THIS MOCK AUTHENTICATION WHEN BACKEND IS READY
        // Replace with actual API calls to your backend
        if (mode === 'login') {
            // Mock login - only check if email exists, accept any password
            if (MOCK_USERS[formData.email as keyof typeof MOCK_USERS]) {
                const user = MOCK_USERS[formData.email as keyof typeof MOCK_USERS];
                setSuccess(`Welcome back, ${user.name}!`);

                // Store mock user data in sessionStorage
                sessionStorage.setItem('mockUser', JSON.stringify({
                    email: formData.email,
                    name: user.name,
                    role: user.role
                }));

                // Redirect to dashboard after successful login
                setTimeout(() => {
                    navigate('dashboard');
                }, 1500);
            } else {
                setError('User not found. Try: admin@shiftswap.com, teamleader@shiftswap.com, or user@shiftswap.com');
            }
        } else if (mode === 'signup') {
            // Mock signup - just show success message
            setSuccess(`Account created for ${formData.email}! You can now log in.`);
            setTimeout(() => {
                setMode('login');
                setSuccess('');
            }, 2000);
        } else if (mode === 'forgot') {
            // Mock forgot password - just show success message
            setSuccess(`Password reset link sent to ${formData.email}!`);
        }
        // END TODO
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
                        <button
                            onClick={() => navigate('home')}
                            className="text-gray-600 hover:text-gray-900 transition"
                        >
                            Back to Home
                        </button>
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
                                Login
                            </button>
                            <button
                                onClick={() => setMode('signup')}
                                className={`flex-1 py-3 text-center font-medium transition ${
                                    mode === 'signup'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Login Form */}
                        {mode === 'login' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Welcome Back
                                    </h2>
                                    <p className="text-gray-600">
                                        Sign in to your ShiftSwap account
                                    </p>
                                    {/* TODO: REMOVE - Mock login hint */}
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                        <strong>Demo Mode:</strong> Try these accounts (any password works):
                                        <ul className="mt-2 ml-4 list-disc">
                                            <li>admin@shiftswap.com (Admin)</li>
                                            <li>teamleader@shiftswap.com (Team Leader)</li>
                                            <li>user@shiftswap.com (User)</li>
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
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
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
                                            Remember me
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setMode('forgot')}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Sign In
                                </button>

                                <div className="text-center text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setMode('signup')}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Sign up
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Sign Up Form */}
                        {mode === 'signup' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Create Account
                                    </h2>
                                    <p className="text-gray-600">
                                        Join ShiftSwap and simplify your scheduling
                                    </p>
                                    {/* TODO: REMOVE - Mock signup hint */}
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                        <strong>Demo Mode:</strong> Account creation is simulated
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
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Healthcare Facility
                                    </label>
                                    <input
                                        type="text"
                                        name="facility"
                                        value={formData.facility}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Memorial Hospital"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Create Account
                                </button>

                                <div className="text-center text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setMode('login')}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Sign in
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Forgot Password Form */}
                        {mode === 'forgot' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Reset Password
                                    </h2>
                                    <p className="text-gray-600">
                                        Enter your email and we'll send you a reset link
                                    </p>
                                    {/* TODO: REMOVE - Mock password reset hint */}
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                        <strong>Demo Mode:</strong> Password reset is simulated
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
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Send Reset Link
                                </button>

                                <div className="text-center text-sm text-gray-600">
                                    Remember your password?{' '}
                                    <button
                                        onClick={() => setMode('login')}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Sign in
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        <p>
                            By continuing, you agree to ShiftSwap's{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LoginPage;