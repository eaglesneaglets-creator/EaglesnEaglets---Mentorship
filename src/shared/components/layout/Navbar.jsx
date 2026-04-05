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

    // Close menu on route change — during-render pattern avoids setState-in-effect
    const [prevPath, setPrevPath] = useState(location.pathname);
    if (prevPath !== location.pathname) {
        setPrevPath(location.pathname);
        setIsMobileMenuOpen(false);
    }

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Store', path: '/store' },
        { name: 'Donation', path: '/donation' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                isScrolled
                    ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg'
                    : 'bg-transparent'
            }`}
        >
            {/* Single-row bar — never wraps */}
            <div className="max-w-7xl mx-auto flex items-center h-14 sm:h-16 px-4 sm:px-6 gap-3">

                {/* Logo — icon + text on sm+, icon only on xs */}
                <Link to="/" className="flex items-center gap-2 group flex-shrink-0 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-lg sm:text-xl">nest_eco</span>
                    </div>
                    {/* Always show on sm+, hidden on xs to prevent wrapping */}
                    <span className="hidden sm:inline text-base md:text-lg font-black text-slate-900 tracking-tighter whitespace-nowrap">
                        The Nest<span className="text-emerald-500">.</span>
                    </span>
                </Link>

                {/* Desktop pill nav — md+ only */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8 bg-white/40 backdrop-blur-md px-6 lg:px-8 py-2 rounded-full border border-white/20 shadow-sm mx-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-bold transition-colors hover:text-emerald-500 whitespace-nowrap ${
                                location.pathname === link.path
                                    ? 'text-emerald-600'
                                    : 'text-slate-600'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Spacer on mobile to push CTAs right */}
                <div className="flex-1 md:hidden" />

                {/* Desktop auth CTAs */}
                <div className="hidden md:flex items-center gap-3 lg:gap-4 flex-shrink-0 ml-auto">
                    <Link
                        to="/login"
                        className="text-sm font-bold text-slate-700 hover:text-emerald-500 transition-colors whitespace-nowrap"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 lg:px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                    >
                        Join the Nest
                    </Link>
                </div>

                {/* Mobile: compact "Join" pill + hamburger */}
                <div className="flex md:hidden items-center gap-2 flex-shrink-0">
                    <Link
                        to="/register"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full font-bold text-xs transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
                    >
                        Join
                    </Link>
                    <button
                        className="w-8 h-8 flex items-center justify-center text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="material-symbols-outlined text-2xl leading-none">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-2xl"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`w-full flex items-center px-4 py-3.5 rounded-xl font-bold text-base transition-colors ${
                                        location.pathname === link.path
                                            ? 'text-emerald-600 bg-emerald-50'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full text-center font-bold text-slate-600 py-3.5 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-center py-3.5 rounded-2xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    Join the Nest
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;