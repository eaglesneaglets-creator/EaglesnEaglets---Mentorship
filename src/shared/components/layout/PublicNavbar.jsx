/**
 * PublicNavbar
 *
 * Shared floating navbar for all public-facing pages (HomePage, DonationsPage, etc.)
 * Extracted from HomePage so it can be reused without duplication.
 *
 * Auth-aware: shows user avatar + dropdown when logged in, Login/Join when not.
 * "Donate" always navigates to /donations.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store';
import logoImg from '../../../assets/EaglesnEagletsLogo.jpeg';

const getDashboardPath = (user) => {
    if (!user) return '/dashboard';
    if (user.role === 'admin' || user.is_staff || user.is_superuser) return '/admin/dashboard';
    if (user.role === 'eagle') return '/eagle/dashboard';
    return '/eaglet/dashboard';
};

const getInitials = (user) => {
    if (!user) return '?';
    const f = user.first_name?.charAt(0) || '';
    const l = user.last_name?.charAt(0) || '';
    return (f + l).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
};

const PublicNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/#about' },
        { label: 'Store', path: '/store' },
        { label: 'Donate', path: '/donations' },
    ];

    const handleLogout = async () => {
        setDropdownOpen(false);
        setMobileOpen(false);
        await logout();
        navigate('/login');
    };

    const linkClass = `px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
        scrolled
            ? 'text-slate-600 hover:text-primary hover:bg-primary/5'
            : 'text-white/90 hover:text-white hover:bg-white/15'
    }`;

    return (
        <motion.nav
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
                scrolled ? 'top-3' : 'top-5'
            }`}
        >
            {/* Desktop */}
            <div className={`hidden md:flex items-center gap-1 px-2 py-2 rounded-full border transition-all duration-500 ${
                scrolled
                    ? 'bg-white/90 backdrop-blur-xl border-slate-200/60 shadow-lg shadow-slate-200/30'
                    : 'bg-white/20 backdrop-blur-md border-white/30 shadow-md shadow-black/10'
            }`}>
                <Link to="/" className="flex items-center gap-2 pl-3 pr-4">
                    <img src={logoImg} alt="Eagles & Eaglets" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50" />
                    <span className={`font-extrabold text-sm tracking-tight whitespace-nowrap transition-colors duration-500 ${
                        scrolled ? 'text-slate-900' : 'text-white'
                    }`}>
                        Eagles & Eaglets
                    </span>
                </Link>

                <div className={`w-px h-6 mx-1 transition-colors duration-500 ${
                    scrolled ? 'bg-slate-200/50' : 'bg-white/30'
                }`} />

                {navLinks.map((link) => (
                    <Link key={link.label} to={link.path} className={linkClass}>
                        {link.label}
                    </Link>
                ))}

                <div className={`w-px h-6 mx-1 transition-colors duration-500 ${
                    scrolled ? 'bg-slate-200/50' : 'bg-white/30'
                }`} />

                {isAuthenticated && user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen((o) => !o)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/15 transition-colors focus:outline-none"
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.first_name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center ring-2 ring-primary/30">
                                    {getInitials(user)}
                                </div>
                            )}
                            <span className={`text-sm font-semibold max-w-[90px] truncate transition-colors duration-500 ${
                                scrolled ? 'text-slate-700' : 'text-white'
                            }`}>
                                {user.first_name || user.email}
                            </span>
                            <span className={`material-symbols-outlined text-base transition-transform duration-200 ${
                                dropdownOpen ? 'rotate-180' : ''
                            } ${scrolled ? 'text-slate-400' : 'text-white/70'}`}>
                                expand_more
                            </span>
                        </button>

                        <div className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden
                            transition-all duration-200 origin-top-right
                            ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                        >
                            <div className="px-4 py-3 border-b border-slate-100">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                                    {user.role}
                                </span>
                            </div>
                            <div className="py-1">
                                <Link
                                    to={getDashboardPath(user)}
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base text-primary">dashboard</span>
                                    Go to Dashboard
                                </Link>
                                <Link
                                    to="/store"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base text-slate-500">storefront</span>
                                    Store
                                </Link>
                                <Link
                                    to="/donations/my-donations"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base text-slate-500">volunteer_activism</span>
                                    My Donations
                                </Link>
                            </div>
                            <div className="border-t border-slate-100 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className={linkClass}>Login</Link>
                        <Link
                            to="/register"
                            className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/25"
                        >
                            Join the Nest
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile */}
            <div className={`md:hidden flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-500 ${
                scrolled
                    ? 'bg-white/90 backdrop-blur-xl border-slate-200/60 shadow-lg'
                    : 'bg-white/20 backdrop-blur-md border-white/30 shadow-md'
            }`}>
                <Link to="/" className="flex items-center gap-2">
                    <img src={logoImg} alt="" className="w-7 h-7 rounded-full object-cover" />
                    <span className={`font-extrabold text-sm transition-colors duration-500 ${
                        scrolled ? 'text-slate-900' : 'text-white'
                    }`}>
                        Eagles & Eaglets
                    </span>
                </Link>
                {isAuthenticated && user ? (
                    <div className="ml-auto flex items-center gap-2">
                        {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                                {getInitials(user)}
                            </div>
                        )}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                        >
                            <span className={`material-symbols-outlined text-xl ${scrolled ? 'text-slate-700' : 'text-white'}`}>
                                {mobileOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="ml-auto w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                    >
                        <span className={`material-symbols-outlined text-xl ${scrolled ? 'text-slate-700' : 'text-white'}`}>
                            {mobileOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                )}
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl p-3 mx-4"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.path}
                                onClick={() => setMobileOpen(false)}
                                className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="border-t border-slate-100 mt-2 pt-2">
                            {isAuthenticated && user ? (
                                <div className="space-y-1">
                                    <div className="px-4 py-2">
                                        <p className="text-sm font-semibold text-slate-900">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                    <Link
                                        to={getDashboardPath(user)}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-outlined text-base text-primary">dashboard</span>
                                        Go to Dashboard
                                    </Link>
                                    <Link
                                        to="/donations/my-donations"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-outlined text-base text-primary">volunteer_activism</span>
                                        My Donations
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-outlined text-base">logout</span>
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex-1 text-center py-2.5 text-sm font-semibold text-slate-600 rounded-xl border border-slate-200 hover:border-primary/30"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex-1 text-center py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-md hover:bg-primary-dark"
                                    >
                                        Join
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default PublicNavbar;
