import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Store', path: '/store' },
        { name: 'Donation', path: '/donation' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${isScrolled
                ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg py-3'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white text-xl md:text-2xl">nest_eco</span>
                    </div>
                    <span className="text-lg md:text-xl font-black text-slate-900 tracking-tighter">
                        The Nest<span className="text-emerald-500">.</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8 bg-white/40 backdrop-blur-md px-4 lg:px-8 py-2.5 rounded-full border border-white/20 shadow-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-bold transition-colors hover:text-emerald-500 whitespace-nowrap ${location.pathname === link.path
                                ? 'text-emerald-600'
                                : 'text-slate-600'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Auth CTAs */}
                <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-shrink-0">
                    <Link
                        to="/login"
                        className="text-sm font-bold text-slate-700 hover:text-emerald-500 transition-colors whitespace-nowrap"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                    >
                        Join the Nest
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-slate-900"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined text-3xl">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-6 md:hidden shadow-2xl"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-xl font-bold text-slate-900"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <hr className="border-slate-100" />
                        <div className="flex flex-col gap-4">
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-center font-bold text-slate-600"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="bg-emerald-500 text-white text-center py-4 rounded-2xl font-bold"
                            >
                                Join the Nest
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
