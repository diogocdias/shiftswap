import { useState } from 'react';
import LoginPage from './LoginPage';

// Simple router implementation
function Router() {
    const [currentPage, setCurrentPage] = useState('home');

    const navigate = (page: string) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

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
                            <a href="#services" className="text-gray-600 hover:text-gray-900 transition">Services</a>
                            <a href="#about" className="text-gray-600 hover:text-gray-900 transition">About</a>
                            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
                            <button
                                onClick={() => navigate('login')}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                Login
                            </button>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                                Get Started
                            </button>
                        </div>
                        <button
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Scheduling Shifts,<br />Made Easy
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-10">
                            So you can focus on what matters most – patient care.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-blue-600 text-white px-8 py-4 rounded text-lg font-medium hover:bg-blue-700 transition">
                                Book a Demo
                            </button>
                            <button
                                onClick={() => navigate('features')}
                                className="bg-white text-blue-600 px-8 py-4 rounded text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition"
                            >
                                Learn More
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
                            <div className="text-gray-600">Shifts Scheduled</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
                            <div className="text-gray-600">Healthcare Facilities</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                            <div className="text-gray-600">Platform Availability</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Our Services
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to manage shifts efficiently in one simple platform
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition">
                            <div className="text-4xl mb-4">📅</div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Creating Schedules</h3>
                            <p className="text-gray-600 leading-relaxed">
                                ShiftSwap creates optimized schedules based on pre-defined criteria, ensuring fair distribution of shifts.
                                With the ease of a single click, generate schedules that meet your team's needs.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition">
                            <div className="text-4xl mb-4">🔄</div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Swapping Shifts</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Our intuitive platform allows staff to easily swap shifts, ensuring coverage and flexibility.
                                Staff can propose swaps, and managers can approve them with minimal hassle.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition">
                            <div className="text-4xl mb-4">📱</div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">One Platform. No paperwork.</h3>
                            <p className="text-gray-600 leading-relaxed">
                                ShiftSwap consolidates all scheduling and shift management into a single platform,
                                eliminating the need for paperwork and manual tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-20 bg-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Simplify Your Scheduling?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join hundreds of healthcare facilities already using ShiftSwap.
                    </p>
                    <button className="bg-white text-blue-600 px-10 py-4 rounded text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                        Schedule a Demo
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
                                Simplifying healthcare scheduling since 2024.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Features</a></li>
                                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Connect</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>📧 hello@shiftswap.com</li>
                                <li>📞 (555) 123-4567</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                        <p>© 2024 ShiftSwap. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeaturesPage({ navigate }: PageProps) {
    const features = [
        {
            step: 1,
            title: "Create Your Schedule",
            description: "Start by setting up your team's basic schedule. Define shift types, set working hours, and assign staff members to their preferred roles. Our intelligent system helps ensure fair distribution and compliance with labor regulations.",
            icon: "📅"
        },
        {
            step: 2,
            title: "Automated Optimization",
            description: "Let ShiftSwap's algorithm optimize your schedule based on staff preferences, skill requirements, and coverage needs. The system automatically detects conflicts and suggests the best arrangements to maximize efficiency.",
            icon: "⚡"
        },
        {
            step: 3,
            title: "Enable Shift Swapping",
            description: "Empower your staff to request shift swaps directly through the platform. Managers receive instant notifications and can approve or deny requests with one click, maintaining full control while giving staff flexibility.",
            icon: "🔄"
        },
        {
            step: 4,
            title: "Real-Time Updates",
            description: "Everyone stays informed with instant notifications for schedule changes, approved swaps, and upcoming shifts. Access the schedule from any device, anywhere, ensuring your team is always up to date.",
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
                        <button
                            onClick={() => navigate('home')}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Home
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            How ShiftSwap Works
                        </h1>
                        <p className="text-xl text-gray-600">
                            Four simple steps to transform your healthcare scheduling
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
                                            Step {feature.step}
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
                                            <h3 className="font-semibold text-gray-800">Schedule Overview</h3>
                                            <div className="text-sm text-gray-500">Week 47</div>
                                        </div>

                                        {/* Calendar Grid */}
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 font-medium mb-2">
                                                <div>Mon</div>
                                                <div>Tue</div>
                                                <div>Wed</div>
                                                <div>Thu</div>
                                                <div>Fri</div>
                                                <div>Sat</div>
                                                <div>Sun</div>
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
                                                    <span className="text-gray-700">Day Shift (8am-4pm)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                                                    <span className="text-gray-700">Night Shift (8pm-6am)</span>
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
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        See ShiftSwap in action with a personalized demo
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-blue-600 px-10 py-4 rounded text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
                            Schedule a Demo
                        </button>
                        <button
                            onClick={() => navigate('home')}
                            className="bg-transparent border-2 border-white text-white px-10 py-4 rounded text-lg font-semibold hover:bg-white hover:text-blue-600 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="text-center text-gray-400 text-sm">
                        <p>© 2024 ShiftSwap. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Router;