import { useState } from 'react';

export default function ShiftSwapHome() {
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

            {/* Hero Section - Clean & Spacious */}
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
                            <button className="bg-white text-blue-600 px-8 py-4 rounded text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition">
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

            {/* Services Section - Clean Cards */}
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
                                eliminating the need for paperwork and manual tracking. Enjoy seamless communication and real-time updates.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Image + Text Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Streamlined Shift Management
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Say goodbye to spreadsheets and endless emails. ShiftSwap provides a centralized hub
                                for all your scheduling needs, making it easy for managers and staff to stay coordinated.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Real-time schedule updates</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Automated conflict detection</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Mobile access for on-the-go management</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-96 flex items-center justify-center">
                            <div className="text-8xl">📊</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Alternate Image + Text Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg h-96 flex items-center justify-center order-2 md:order-1">
                            <div className="text-8xl">✅</div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Built for Healthcare Teams
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                We understand the unique challenges of healthcare scheduling. ShiftSwap is designed
                                specifically for healthcare facilities, with features that address your specific needs.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Credential and certification tracking</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Compliance with labor regulations</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Department-specific scheduling rules</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            What Healthcare Professionals Say
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="bg-gray-50 p-8 rounded-lg">
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4 italic">
                                "ShiftSwap has completely transformed how we manage our nursing staff. The time saved is incredible."
                            </p>
                            <p className="font-semibold text-gray-900">Dr. Sarah Johnson</p>
                            <p className="text-gray-600 text-sm">Nurse Manager, City Hospital</p>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-lg">
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4 italic">
                                "The swap functionality is a game-changer. Our staff love the flexibility and it reduces scheduling conflicts."
                            </p>
                            <p className="font-semibold text-gray-900">Michael Chen</p>
                            <p className="text-gray-600 text-sm">Operations Director, Medical Center</p>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-lg">
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4 italic">
                                "Simple, intuitive, and powerful. This is the scheduling tool we've been waiting for."
                            </p>
                            <p className="font-semibold text-gray-900">Emily Rodriguez</p>
                            <p className="text-gray-600 text-sm">HR Manager, Healthcare Network</p>
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
                        Join hundreds of healthcare facilities already using ShiftSwap to manage their teams more efficiently.
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
                                <li><a href="#" className="hover:text-white transition">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Careers</a></li>
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