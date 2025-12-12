import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginPage from './LoginPage.tsx';
import Dashboard from '../dashboard/Dashboard.tsx';
import LanguageSelector from '../components/LanguageSelector.tsx';

// Simple router implementation
function Router() {
    const [currentPage, setCurrentPage] = useState('home');

    const navigate = (page: string) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (currentPage === 'dashboard') {
        return <Dashboard navigate={navigate} />;
    }

    return currentPage === 'home' ? (
        <ShiftSwapHome navigate={navigate} />
    ) : currentPage === 'features' ? (
        <FeaturesPage navigate={navigate} />
    ) : (
        <LoginPage navigate={navigate} />
    );
}

interface PageProps {
    navigate: (page: string) => void;
}

function ShiftSwapHome({ navigate }: PageProps) {
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="relative bg-white">
            {/* Clean Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <img
                                src="/shiftswap_side.png"
                                alt="ShiftSwap"
                                className="h-10 w-auto"
                            />
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#product" className="text-gray-600 hover:text-gray-900 transition">{t('nav.product')}</a>
                            <a href="#about" className="text-gray-600 hover:text-gray-900 transition">{t('nav.about')}</a>
                            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">{t('nav.contact')}</a>
                            <button
                                onClick={() => navigate('login')}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                {t('nav.login')}
                            </button>
                            <LanguageSelector variant="compact" />
                            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                                {t('nav.getStarted')}
                            </button>
                        </div>
                        <div className="md:hidden flex items-center gap-2">
                            <LanguageSelector variant="compact" />
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden pt-4 pb-2 space-y-2">
                            <a
                                href="#product"
                                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.product')}
                            </a>
                            <a
                                href="#about"
                                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.about')}
                            </a>
                            <a
                                href="#contact"
                                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.contact')}
                            </a>
                            <button
                                onClick={() => {
                                    navigate('login');
                                    setMobileMenuOpen(false);
                                }}
                                className="block w-full text-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition"
                            >
                                {t('nav.login')}
                            </button>
                            <button
                                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.getStarted')}
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            {t('home.hero.title')}<br />{t('home.hero.titleBreak')}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-10">
                            {t('home.hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-blue-600 text-white px-8 py-4 rounded text-lg font-medium hover:bg-blue-700 transition">
                                {t('home.hero.bookDemo')}
                            </button>
                            <button
                                onClick={() => navigate('features')}
                                className="bg-white text-blue-600 px-8 py-4 rounded text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition"
                            >
                                {t('home.hero.learnMore')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Info Banner */}
            <section className="bg-white py-12 border-b border-gray-200">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                            <div className="text-gray-600">{t('home.stats.shiftsScheduled')}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
                            <div className="text-gray-600">{t('home.stats.healthcareFacilities')}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                            <div className="text-gray-600">{t('home.stats.platformAvailability')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Section */}
            <section id="product" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('home.product.title')}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('home.product.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition">
                            <div className="text-4xl mb-4">📅</div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('home.product.creatingSchedules.title')}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.product.creatingSchedules.description')}
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition">
                            <div className="text-4xl mb-4">🔄</div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('home.product.swappingShifts.title')}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.product.swappingShifts.description')}
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition">
                            <div className="text-4xl mb-4">📱</div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('home.product.onePlatform.title')}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {t('home.product.onePlatform.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-20 bg-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {t('home.cta.title')}
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        {t('home.cta.subtitle')}
                    </p>
                    <button className="bg-white text-blue-600 px-10 py-4 rounded text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                        {t('home.cta.scheduleDemo')}
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex flex-col items-center">
                                <img
                                    src="/shiftswap_side.png"
                                    alt="ShiftSwap"
                                    className="h-10 w-auto"
                                />
                            </div>
                            <p className="text-gray-400">
                                {t('home.footer.tagline')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">{t('home.footer.productTitle')}</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition">{t('home.footer.features')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('home.footer.pricing')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">{t('home.footer.companyTitle')}</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition">{t('home.footer.aboutUs')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('home.footer.contactUs')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">{t('home.footer.connectTitle')}</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>hello@shiftswap.com</li>
                                <li>(555) 123-4567</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                        <p>{t('home.footer.copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeaturesPage({ navigate }: PageProps) {
    const { t } = useTranslation();

    const features = [
        {
            step: 1,
            title: t('features.steps.createSchedule.title'),
            description: t('features.steps.createSchedule.description'),
            icon: "📅"
        },
        {
            step: 2,
            title: t('features.steps.automatedOptimization.title'),
            description: t('features.steps.automatedOptimization.description'),
            icon: "⚡"
        },
        {
            step: 3,
            title: t('features.steps.enableSwapping.title'),
            description: t('features.steps.enableSwapping.description'),
            icon: "🔄"
        },
        {
            step: 4,
            title: t('features.steps.realTimeUpdates.title'),
            description: t('features.steps.realTimeUpdates.description'),
            icon: "📱"
        }
    ];

    return (
        <div className="relative bg-white min-h-screen">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <img
                                src="/shiftswap_side.png"
                                alt="ShiftSwap"
                                className="h-10 w-auto"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageSelector variant="compact" />
                            <button
                                onClick={() => navigate('home')}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                            >
                                {t('nav.home')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            {t('features.hero.title')}
                        </h1>
                        <p className="text-xl text-gray-600">
                            {t('features.hero.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto space-y-24">
                        {features.map((feature, index) => (
                            <div
                                key={feature.step}
                                className={`grid md:grid-cols-2 gap-12 items-center ${
                                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                                }`}
                            >
                                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-5xl">{feature.icon}</div>
                                        <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                            {t('features.step')} {feature.step}
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                        {feature.title}
                                    </h2>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Calendar/Schedule Mockup */}
                                <div className={`bg-gradient-to-br ${
                                    index % 2 === 0 ? 'from-blue-50 to-blue-100' : 'from-green-50 to-green-100'
                                } rounded-lg p-8 shadow-lg ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                                    <div className="bg-white rounded-lg p-6 shadow">
                                        {/* Calendar Header */}
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b">
                                            <h3 className="font-semibold text-gray-800">{t('features.scheduleOverview')}</h3>
                                            <div className="text-sm text-gray-500">{t('features.week')} 47</div>
                                        </div>

                                        {/* Calendar Grid */}
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 font-medium mb-2">
                                                <div>{t('features.weekDays.mon')}</div>
                                                <div>{t('features.weekDays.tue')}</div>
                                                <div>{t('features.weekDays.wed')}</div>
                                                <div>{t('features.weekDays.thu')}</div>
                                                <div>{t('features.weekDays.fri')}</div>
                                                <div>{t('features.weekDays.sat')}</div>
                                                <div>{t('features.weekDays.sun')}</div>
                                            </div>
                                            <div className="grid grid-cols-7 gap-2">
                                                {[...Array(7)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`aspect-square rounded p-2 text-xs ${
                                                            i === 2 || i === 5
                                                                ? 'bg-blue-600 text-white font-semibold'
                                                                : i === 1 || i === 4
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-50 text-gray-400'
                                                        }`}
                                                    >
                                                        <div>{25 + i}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Shift Details */}
                                            <div className="mt-6 pt-4 border-t space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                                    <span className="text-gray-700">{t('features.dayShift')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                                                    <span className="text-gray-700">{t('features.nightShift')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {t('features.cta.title')}
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        {t('features.cta.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-blue-600 px-10 py-4 rounded text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                            {t('features.cta.scheduleDemo')}
                        </button>
                        <button
                            onClick={() => navigate('home')}
                            className="bg-transparent border-2 border-white text-white px-10 py-4 rounded text-lg font-semibold hover:bg-white hover:text-blue-600 transition"
                        >
                            {t('features.cta.backToHome')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="text-center text-gray-400 text-sm">
                        <p>{t('home.footer.copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Router;
