import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import logoImg from '../../assets/EaglesnEagletsLogo.jpeg';
import aboutIllustration from '../../assets/about-illustration.png';
import PublicNavbar from '@shared/components/layout/PublicNavbar';
import PublicFooter from '@shared/components/layout/PublicFooter';

// 4K community teaching & learning hero — diverse group in a learning/mentorship setting
const heroBg = 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=90&w=3840&auto=format&fit=crop';

/* ═══════════════════════════════════════════════
   SCROLL FADE-IN WRAPPER
   ═══════════════════════════════════════════════ */
const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
            x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
            filter: 'blur(4px)',
        },
        visible: { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════
   HERO SECTION — 4K photo background
   ═══════════════════════════════════════════════ */
const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section id="hero" className="relative min-h-screen overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={heroBg} alt="" className="w-full h-full object-cover object-center" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/55 to-slate-900/25" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/65" />
                <div className="absolute inset-0 bg-primary/8 mix-blend-multiply" />
            </div>

            <div className="relative z-10 min-h-screen flex items-center pt-28 pb-24 px-6">
                <div className="max-w-7xl mx-auto w-full">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20 mb-6"
                    >
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        Community-Centered Ministry
                    </motion.span>

                    <div className="max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-white mb-6"
                        >
                            Empowering the{' '}
                            <span className="text-primary drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">Next</span>
                            <br />
                            <span className="text-primary drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">Generation</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl mb-10"
                        >
                            Join our community-centric mission to nurture, inspire, and build a brighter future for the youth in our neighborhood.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/register')}
                                className="min-h-[44px] px-7 py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all duration-300">
                                Get Started Now
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="min-h-[44px] flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/25 text-white font-bold text-sm rounded-xl hover:bg-white/20 transition-all duration-300">
                                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-base fill">play_arrow</span>
                                </span>
                                Watch Story
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute bottom-10 left-6 right-6"
                    >
                        <div className="flex gap-8 md:gap-12">
                            {[
                                { value: '500+', label: 'Youth Mentored' },
                                { value: '60+', label: 'Community Eagles' },
                                { value: '12', label: 'Programs Running' },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                                    <p className="text-xs text-white/60 font-medium mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   ABOUT SECTION — 2-column: text left, illustration right
   ═══════════════════════════════════════════════ */
const AboutSection = () => {
    return (
        <section id="about" className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

                    {/* Left: text */}
                    <div>
                        <FadeIn delay={0} direction="right">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
                                About Our Mission
                            </span>
                        </FadeIn>
                        <FadeIn delay={0.08} direction="right">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-5">
                                Our Commitment to the{' '}
                                <span className="text-primary">Next<br />Generation</span>
                            </h2>
                        </FadeIn>
                        <FadeIn delay={0.15} direction="right">
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-4">
                                At Eagles & Eaglets, we believe every child possesses untapped potential. Our platform is dedicated to bridging the gap between today's youth and the resources they need to thrive. Through personalized mentorship, community-driven support, and spiritual guidance, we are building a foundation for a brighter, more inclusive future.
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.22} direction="right">
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-8">
                                Our vision is simple: to create a safe nest where young minds can grow wings and learn to soar. By connecting local leaders with aspiring youth, we foster an environment of growth, resilience, and leadership.
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.3} direction="right">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="min-h-[44px] px-7 py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-300"
                            >
                                Learn More
                            </motion.button>
                        </FadeIn>
                    </div>

                    {/* Right: illustration */}
                    <FadeIn delay={0.1} direction="left">
                        <div className="relative">
                            <div className="rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xl shadow-slate-200/40">
                                <img
                                    src={aboutIllustration}
                                    alt="Diverse youth learning together"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Small floating badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
                                className="absolute -bottom-4 -left-4 md:-left-6 bg-white rounded-2xl p-4 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-lg">diversity_3</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Community First</p>
                                    <p className="text-xs text-slate-400">Building together</p>
                                </div>
                            </motion.div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   CORE ECOSYSTEM — 3 feature cards
   ═══════════════════════════════════════════════ */
const FeaturesSection = () => {
    const features = [
        {
            icon: 'school',
            title: 'Mentorship',
            description: 'Personalized 1-on-1 sessions with industry leaders tailored to each young person\'s unique trajectory.',
            color: 'text-primary',
            iconBg: 'bg-primary/10',
        },
        {
            icon: 'hub',
            title: 'Community Hub',
            description: 'A digital town square to trade ideas, share resources, and collaborate on meaningful projects.',
            color: 'text-blue-600',
            iconBg: 'bg-blue-50',
        },
        {
            icon: 'trending_up',
            title: 'Impact Tracking',
            description: 'Advanced tools that measure progress and demonstrate the reach of community contributions.',
            color: 'text-amber-600',
            iconBg: 'bg-amber-50',
        },
    ];

    return (
        <section id="features" className="py-24 px-6 bg-slate-50/50">
            <div className="max-w-7xl mx-auto">
                <FadeIn>
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">Platform</span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Core Ecosystem</h2>
                        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Everything you need to grow professionally and personally within our community.
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feat, i) => (
                        <FadeIn key={feat.title} delay={i * 0.12} direction="up">
                            <motion.div
                                whileHover={{ y: -6, scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="bg-white rounded-2xl border border-slate-200/80 p-8 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${feat.iconBg} ${feat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <span className="material-symbols-outlined text-2xl">{feat.icon}</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-3">{feat.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   STORE / MINISTRY SHOP
   ═══════════════════════════════════════════════ */
const StoreSection = () => {
    const products = [
        {
            name: 'The Eagle Tee',
            desc: 'Premium Cotton',
            price: '$31.00',
            badge: 'BESTSELLER',
            // White crew-neck tee lifestyle flat lay
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Leadership Journal',
            desc: 'High-Quality Leather',
            price: '$28.00',
            // Person writing in a leather journal — warm, candid
            image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Hydra Flask Pro',
            desc: 'Insulated, 32oz',
            price: '$45.00',
            // Insulated stainless steel water bottle — clean product shot
            image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop',
        },
        {
            name: 'Visionary Shades',
            desc: 'UV Protection',
            price: '$120.00',
            // Stylish sunglasses on a neutral background
            image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
        },
    ];

    return (
        <section id="store" className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <FadeIn>
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">Official Store</span>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Ministry Shop</h2>
                            <p className="text-sm text-slate-400 mt-2">Exclusive apparel and resources for the community.</p>
                        </div>
                        <Link to="/store" className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors group">
                            View All Items
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((prod, i) => (
                        <FadeIn key={prod.name} delay={i * 0.1} direction="up">
                            <Link to="/store">
                            <motion.div whileHover={{ y: -6 }} className="group cursor-pointer">
                                <div className="relative aspect-square rounded-2xl border border-slate-200/50 overflow-hidden mb-4 group-hover:shadow-lg transition-all duration-300 bg-slate-100">
                                    <img
                                        src={prod.image}
                                        alt={prod.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {prod.badge && (
                                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                                            {prod.badge}
                                        </span>
                                    )}
                                    <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:bg-primary hover:text-white text-slate-700">
                                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                    </button>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{prod.name}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">{prod.desc}</p>
                                <p className="text-sm font-bold text-slate-900 mt-2">{prod.price}</p>
                            </motion.div>
                            </Link>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   TESTIMONIALS — Voices of the Nest
   ═══════════════════════════════════════════════ */
const TestimonialsSection = () => {
    const testimonials = [
        {
            quote: "This ministry has provided a safe space for my son to grow and discover his talents. The mentors are truly invested in the kids' futures.",
            name: 'Sarah Miller',
            role: 'Community Parent',
            stars: 5,
            color: 'var(--color-primary)',
            initials: 'SM',
        },
        {
            quote: "The Eagles program taught me that my background doesn't define my height. I'm aiming for the sky now!",
            name: 'Jordan Rivers',
            role: 'Youth Leader',
            stars: 5,
            color: '#3b82f6',
            initials: 'JR',
            featured: true,
        },
        {
            quote: "Investing in these children is investing in our community's future. I've seen measurable change in just one season.",
            name: 'David Brooks',
            role: 'Local Business Partner',
            stars: 5,
            color: '#8b5cf6',
            initials: 'DB',
        },
    ];

    return (
        <section id="testimonials" className="py-24 px-6 bg-slate-50/50">
            <div className="max-w-7xl mx-auto">
                <FadeIn>
                    <div className="mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">Testimonials</span>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Voices of the Nest</h2>
                            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                                Stories from the families and youth whose lives have been touched by our community outreach.
                            </p>
                        </div>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <FadeIn key={t.name} delay={i * 0.12} direction="up">
                            <motion.div
                                whileHover={{ y: -4 }}
                                className={`rounded-2xl border p-7 transition-all duration-300 flex flex-col h-full ${t.featured
                                    ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                                    : 'bg-white border-slate-200/80 hover:shadow-xl hover:shadow-slate-200/40'
                                    }`}
                            >
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(t.stars)].map((_, si) => (
                                        <span key={si} className={`material-symbols-outlined text-lg fill ${t.featured ? 'text-yellow-300' : 'text-yellow-400'}`}>star</span>
                                    ))}
                                </div>
                                <p className={`text-sm leading-relaxed flex-1 mb-6 ${t.featured ? 'text-white/90' : 'text-slate-500'}`}>
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-current/10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white`}
                                        style={{ backgroundColor: t.featured ? 'rgba(255,255,255,0.25)' : t.color }}>
                                        {t.initials}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${t.featured ? 'text-white' : 'text-slate-900'}`}>{t.name}</p>
                                        <p className={`text-xs font-semibold ${t.featured ? 'text-white/70' : ''}`}
                                            style={{ color: t.featured ? undefined : t.color }}>{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   DONATE SECTION — Centered green card
   Matching inspiration: rounded card, centered text,
   2 buttons, 4 icons row
   ═══════════════════════════════════════════════ */
const DonateSection = () => {
    const navigate = useNavigate();

    const icons = [
        { icon: 'volunteer_activism', label: 'Giving' },
        { icon: 'groups', label: 'Community' },
        { icon: 'cottage', label: 'Safe Space' },
        { icon: 'handshake', label: 'Partnership' },
    ];

    return (
        <section id="donate" className="py-24 px-6 bg-white">
            <div className="max-w-4xl mx-auto">
                <FadeIn direction="up">
                    {/* Rounded green gradient card */}
                    <div className="relative rounded-3xl overflow-hidden px-8 py-16 text-center"
                        style={{
                            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 40%, #d1fae5 70%, #ecfdf5 100%)',
                        }}>

                        {/* Heading */}
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                            Support the Ministry
                        </h2>
                        <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-lg mx-auto mb-10">
                            Every contribution helps us provide more resources, mentoring sessions, and safe environments for our eaglets to soar. Together, we can make a lasting impact.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/donations')}
                                className="min-h-[44px] px-8 py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all duration-300"
                            >
                                Donate Now
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/register')}
                                className="min-h-[44px] px-8 py-3.5 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:border-primary/40 hover:text-primary transition-all duration-300 shadow-sm"
                            >
                                Become a Partner
                            </motion.button>
                        </div>

                        {/* Icons row */}
                        <div className="flex items-center justify-center gap-4 sm:gap-8">
                            {icons.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
                                    className="flex flex-col items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-3xl text-slate-500">{item.icon}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   FOOTER — 4-column, light background
   ═══════════════════════════════════════════════ */
const HomePage = () => {
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => { document.documentElement.style.scrollBehavior = ''; };
    }, []);

    return (
        <div className="relative bg-white min-h-screen overflow-x-hidden">
            <PublicNavbar />
            <HeroSection />
            <AboutSection />
            <FeaturesSection />
            <StoreSection />
            <TestimonialsSection />
            <DonateSection />
            <PublicFooter />
        </div>
    );
};

export default HomePage;
