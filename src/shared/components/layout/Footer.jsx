import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Quicklinks: [
            { name: 'Our Mission', path: '/mission' },
            { name: 'Mentorship Programs', path: '/programs' },
            { name: 'The Shop', path: '/store' },
            { name: 'Success Stories', path: '/stories' },
        ],
        Contact: [
            { name: '123 Visionary Way, Suite 500', icon: 'location_on' },
            { name: 'Creative Park, CA 90001', icon: '' },
            { name: 'hello@thenest.community', icon: 'mail' },
        ],
    };

    return (
        <footer className="bg-white pt-20 pb-10 px-6 border-t border-slate-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand */}
                <div className="col-span-1 md:col-span-1">
                    <Link to="/" className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">nest_eco</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900">The Nest</span>
                    </Link>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Empowering mentors and leaders to make a lasting impact through mentorship and community.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">public</span>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">work</span>
                        </a>
                    </div>
                </div>

                {/* Quicklinks */}
                <div>
                    <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Quicklinks</h4>
                    <ul className="flex flex-col gap-4">
                        {footerLinks.Quicklinks.map((link) => (
                            <li key={link.name}>
                                <Link to={link.path} className="text-slate-500 text-sm hover:text-emerald-500 transition-colors">
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Contact</h4>
                    <ul className="flex flex-col gap-4">
                        {footerLinks.Contact.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-slate-500 text-sm">
                                {item.icon && <span className="material-symbols-outlined text-base">{item.icon}</span>}
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Newsletter</h4>
                    <p className="text-slate-500 text-sm mb-4">
                        Join our mailing list for weekly inspiration and community updates.
                    </p>
                    <form className="flex flex-col gap-2">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-400 text-xs">
                    © {currentYear} The Nest Community Platform. All rights reserved.
                </p>
                <div className="flex gap-6">
                    <a href="#" className="text-slate-400 text-xs hover:text-slate-600">Privacy Policy</a>
                    <a href="#" className="text-slate-400 text-xs hover:text-slate-600">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
