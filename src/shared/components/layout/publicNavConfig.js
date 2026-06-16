import logoImg from '../../../assets/EaglesnEagletsLogo.jpeg';

export { logoImg };

export const PUBLIC_NAV_LINKS = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'About', path: '/about', icon: 'groups' },
  {
    label: 'Store',
    path: '/store',
    icon: 'storefront',
    // Mobile-only nested items; desktop navbar still renders flat links.
    children: [
      { label: 'Store home', path: '/store', icon: 'storefront' },
      { label: 'My orders', path: '/store/orders', icon: 'receipt_long' },
      { label: 'Cart', path: '/store/cart', icon: 'shopping_cart' },
    ],
  },
  { label: 'Donate', path: '/donations', icon: 'volunteer_activism' },
];

/** Whether a public nav link matches the current route. */
export function isNavLinkActive(pathname, linkPath) {
  if (linkPath === '/') return pathname === '/';
  return pathname === linkPath || pathname.startsWith(`${linkPath}/`);
}

export function getDashboardPath(user) {
  if (!user) return '/dashboard';
  if (user.role === 'admin' || user.is_staff || user.is_superuser) return '/admin/dashboard';
  if (user.role === 'eagle') return '/eagle/dashboard';
  return '/eaglet/dashboard';
}

export function getInitials(user) {
  if (!user) return '?';
  const f = user.first_name?.charAt(0) || '';
  const l = user.last_name?.charAt(0) || '';
  return (f + l).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
}

export function navLinkClass(useDarkText) {
  return `px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
    useDarkText
      ? 'text-slate-600 hover:text-primary hover:bg-primary/5'
      : 'text-white/90 hover:text-white hover:bg-white/15'
  }`;
}

export function navIconBtnClass(useDarkText) {
  return `relative p-2 rounded-full transition-all duration-200 ${
    useDarkText
      ? 'text-slate-600 hover:text-primary hover:bg-primary/5'
      : 'text-white/90 hover:text-white hover:bg-white/15'
  }`;
}

export function navPillClass(useDarkText, { mobile = false } = {}) {
  const base = mobile
    ? 'md:hidden flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-2xl border transition-all duration-500'
    : 'hidden md:flex items-center gap-1 px-2 py-2 rounded-full border transition-all duration-500';

  const theme = useDarkText
    ? mobile
      ? 'bg-white/95 backdrop-blur-xl border-slate-200/70 shadow-md shadow-slate-200/25'
      : 'bg-white/90 backdrop-blur-xl border-slate-200/60 shadow-lg shadow-slate-200/30'
    : mobile
      ? 'bg-slate-900/45 backdrop-blur-xl border-white/20 shadow-lg shadow-black/15'
      : 'bg-white/20 backdrop-blur-md border-white/30 shadow-md shadow-black/10';

  return `${base} ${theme}`;
}

/** Full-width fixed shell for the mobile top bar (industry-standard edge-to-edge header). */
export function navMobileShellClass(useDarkText) {
  return `md:hidden fixed top-0 inset-x-0 z-50 px-4 pt-3 pb-2 transition-all duration-500 ${
    useDarkText ? 'bg-gradient-to-b from-white/80 to-white/0' : 'bg-gradient-to-b from-slate-900/35 to-transparent'
  }`;
}

export function navDividerClass(useDarkText, { wide = false } = {}) {
  const spacing = wide ? 'mx-3 lg:mx-4' : 'mx-1';
  return `w-px h-6 ${spacing} transition-colors duration-500 ${
    useDarkText ? 'bg-slate-200/50' : 'bg-white/30'
  }`;
}

export function navBrandTextClass(useDarkText) {
  return `font-extrabold text-sm tracking-tight whitespace-nowrap transition-colors duration-500 ${
    useDarkText ? 'text-slate-900' : 'text-white'
  }`;
}

export function navShellOffsetClass(useDarkText) {
  return useDarkText ? 'top-3 max-md:top-0' : 'top-5 max-md:top-0';
}

export function navMenuBtnClass(useDarkText) {
  return `w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
    useDarkText ? 'bg-slate-100' : 'bg-white/20'
  }`;
}

export function navMenuIconClass(useDarkText) {
  return `material-symbols-outlined text-xl ${useDarkText ? 'text-slate-700' : 'text-white'}`;
}
