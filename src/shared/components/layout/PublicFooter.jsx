/**
 * PublicFooter
 *
 * Shared footer for all public-facing pages (HomePage, DonationsPage, etc.)
 * Extracted from HomePage so it can be reused without duplication.
 *
 * 4-column layout: Brand | Quick Links | Contact | Newsletter
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import logoImg from '../../../assets/EaglesnEagletsLogo.jpeg';

// Social link hrefs — placeholders until real URLs are provided
const SOCIAL_LINKS = {
    facebook: '#',
    twitter: '#',
    instagram: '#',
    tiktok: '#',
};

const QUICK_LINKS = [
    { label: 'Our Mission', href: '/about' },
    { label: 'Mentorship Programs', href: '/#features' },
    { label: 'The Shop', href: '/store' },
    { label: 'Success Stories', href: '/#testimonials' },
];

const FacebookIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
    </svg>
);

const TwitterIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const InstagramIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
);

const TikTokIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z"/>
    </svg>
);

const SOCIAL_ICONS = [
    { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
    { key: 'twitter', label: 'X (Twitter)', Icon: TwitterIcon },
    { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
    { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
];

const PublicFooter = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const currentYear = new Date().getFullYear();

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) { setSubscribed(true); setEmail(''); }
    };

    return (
        <footer id="footer" className="bg-white border-t border-slate-200/70 pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                                <img src={logoImg} alt="" className="w-7 h-7 rounded-md object-cover" />
                            </div>
                            <span className="font-extrabold text-slate-900 text-sm tracking-tight">Eagles & Eaglets</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-5">
                            Empowering creators and leaders to make a lasting impact through mentorship and community.
                        </p>
                        <div className="flex gap-2.5">
                            {SOCIAL_ICONS.map(({ key, label, Icon }) => (
                                <a
                                    key={key}
                                    href={SOCIAL_LINKS[key]}
                                    aria-label={label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-primary flex items-center justify-center transition-all group"
                                >
                                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-5">Quick Links</h4>
                        <ul className="space-y-3">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-sm text-slate-600 hover:text-primary transition-colors font-medium">{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-5">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="material-symbols-outlined text-sm text-primary mt-0.5">location_on</span>
                                <span className="leading-relaxed">123 Visionary Way, Suite 100<br />Creative Park, CA 90210</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="material-symbols-outlined text-sm text-primary">alternate_email</span>
                                hello@eaglesneaglets.org
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-5">Newsletter</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Join our mailing list for weekly inspiration and community updates.
                        </p>
                        {subscribed ? (
                            <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                You're subscribed!
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="space-y-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    required
                                    className="w-full px-4 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
                                >
                                    Subscribe
                                </motion.button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-200/70 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">© {currentYear} Eagles & Eaglets Community Platform. All rights reserved.</p>
                    <div className="flex gap-5">
                        <a href="#" className="text-xs text-slate-400 hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-slate-400 hover:text-primary transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
