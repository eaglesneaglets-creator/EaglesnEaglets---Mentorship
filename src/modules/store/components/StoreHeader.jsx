import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store';
import { useCartCount } from '../hooks/useCart';
import { useGuestCart } from '../hooks/useGuestCart';

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

const StoreHeader = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cart count: API for auth users, localStorage for guests
    const authCartCount = useCartCount();
    const { itemCount: guestCartCount } = useGuestCart();
    const cartCount = isAuthenticated ? authCartCount : guestCartCount;

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        setDropdownOpen(false);
        await logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-base">storefront</span>
                    </div>
                    <span className="font-bold text-slate-900 hidden sm:block">Eagles &amp; Eaglets</span>
                    <span className="text-slate-300 hidden sm:block">|</span>
                    <span className="text-sm font-semibold text-primary hidden sm:block">Store</span>
                </Link>

                {/* Right actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Cart icon */}
                    <Link
                        to="/store/cart"
                        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        aria-label="View cart"
                    >
                        <span className="material-symbols-outlined text-slate-700">shopping_cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated && user ? (
                        /* Profile avatar + dropdown */
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen((o) => !o)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.first_name}
                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center ring-2 ring-primary/20">
                                        {getInitials(user)}
                                    </div>
                                )}
                                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                                    {user.first_name || user.email}
                                </span>
                                <span
                                    className={`material-symbols-outlined text-slate-400 text-base transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                >
                                    expand_more
                                </span>
                            </button>

                            {/* Dropdown */}
                            <div
                                className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden
                                    transition-all duration-200 origin-top-right
                                    ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                            >
                                {/* User info */}
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                                        {user.role}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="py-1">
                                    <Link
                                        to={getDashboardPath(user)}
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base text-primary">dashboard</span>
                                        Back to Dashboard
                                    </Link>
                                    <Link
                                        to="/store/cart"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base text-slate-500">shopping_bag</span>
                                        My Cart
                                        {cartCount > 0 && (
                                            <span className="ml-auto text-[10px] font-bold bg-primary text-white rounded-full px-1.5 py-0.5">
                                                {cartCount}
                                            </span>
                                        )}
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
                        <Link
                            to="/login"
                            className="hidden sm:block text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default StoreHeader;
