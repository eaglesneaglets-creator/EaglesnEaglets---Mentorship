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

const PublicFooter = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

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
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-primary flex items-center justify-center transition-all group">
                                <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-white">public</span>
                            </a>
                            <a href="mailto:hello@eaglesneaglets.org" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-primary flex items-center justify-center transition-all group">
                                <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-white">alternate_email</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-5">Quick Links</h4>
                        <ul className="space-y-3">
                            {['Our Mission', 'Mentorship Programs', 'The Shop', 'Success Stories'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-sm text-slate-600 hover:text-primary transition-colors font-medium">{link}</a>
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
                    <p className="text-xs text-slate-400">© 2024 Eagles & Eaglets Community Platform. All rights reserved.</p>
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
