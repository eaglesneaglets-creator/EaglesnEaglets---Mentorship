import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import PublicNavbar from '@shared/components/layout/PublicNavbar';
import PublicFooter from '@shared/components/layout/PublicFooter';
// Same students-learning artwork the landing page uses, so the About hero
// reads as part of the same visual world. Motion layered on top in JSX.
import aboutIllustration from '../../assets/about-illustration.png';

/* ═══════════════════════════════════════════════
   STUDENTS-LEARNING ILLUSTRATION
   Uses the same artwork as the landing page About section
   so the visual language carries across surfaces. Motion is
   added as a layer: the artwork breathes gently, and three
   accent glyphs orbit around the card (book, lightbulb,
   sparkle) on independent periods so nothing pulses in sync.
   ═══════════════════════════════════════════════ */
const LearningIllustration = () => (
    <div className="relative w-full h-full">
        {/* Soft glow halo behind the artwork */}
        <motion.div
            aria-hidden
            className="absolute inset-4 rounded-3xl bg-gradient-to-br from-emerald-100/50 via-transparent to-amber-100/30 blur-2xl"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* The artwork — gentle breathing motion (scale + translate) */}
        <motion.img
            src={aboutIllustration}
            alt="Diverse youth learning together"
            className="relative w-full h-full object-cover"
            loading="eager"
            decoding="async"
            animate={{ y: [0, -6, 0], scale: [1, 1.012, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Accent glyph: open book (top-left) */}
        <motion.div
            aria-hidden
            className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-white shadow-lg shadow-emerald-200/50 border border-emerald-100 flex items-center justify-center"
            animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
            <span className="material-symbols-outlined text-emerald-600 text-xl">menu_book</span>
        </motion.div>

        {/* Accent glyph: lightbulb (top-right) */}
        <motion.div
            aria-hidden
            className="absolute top-6 right-5 w-12 h-12 rounded-2xl bg-white shadow-lg shadow-amber-200/60 border border-amber-100 flex items-center justify-center"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
            <span className="material-symbols-outlined text-amber-500 text-2xl">lightbulb</span>
        </motion.div>

        {/* Accent glyph: graduation cap (mid-right) */}
        <motion.div
            aria-hidden
            className="absolute top-1/2 -right-2 sm:-right-3 w-12 h-12 rounded-2xl bg-white shadow-lg shadow-slate-200/60 border border-slate-100 flex items-center justify-center"
            animate={{ y: [0, -8, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        >
            <span className="material-symbols-outlined text-slate-700 text-xl">school</span>
        </motion.div>

        {/* Drifting sparkle particles */}
        <motion.span
            aria-hidden
            className="absolute top-12 right-1/3 text-amber-400"
            animate={{ y: [0, -16, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
        </motion.span>
        <motion.span
            aria-hidden
            className="absolute bottom-12 left-1/3 text-emerald-400"
            animate={{ y: [0, -14, 0], opacity: [0.3, 0.9, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
        >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
        </motion.span>
        <motion.span
            aria-hidden
            className="absolute top-1/3 left-8 text-emerald-300"
            animate={{ y: [0, -18, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
            <span className="material-symbols-outlined text-xs">circle</span>
        </motion.span>
    </div>
);


/* ═══════════════════════════════════════════════
   SCROLL FADE-IN WRAPPER (matches HomePage pattern)
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
   HERO — text left, photo right with floating badge
   ═══════════════════════════════════════════════ */
const HeroSection = () => {
    return (
        <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 bg-white overflow-hidden">
            {/* Subtle gradient flourish in the top-right corner */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/[0.04] via-transparent to-transparent pointer-events-none" />

            <div className="relative max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
                    {/* Left: text */}
                    <div>
                        <FadeIn delay={0} direction="right">
                            <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 sm:mb-5">
                                Our Mission
                            </span>
                        </FadeIn>
                        <FadeIn delay={0.08} direction="right">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] mb-5 sm:mb-6">
                                Elevating Ambition through{' '}
                                <span className="text-primary">Expert Guidance.</span>
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.15} direction="right">
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-xl mb-6 sm:mb-8">
                                We believe that the distance between who you are and who you want to be is bridged by mentorship. Eagles & Eaglets is a sanctuary for growth where seasoned veterans share the wind beneath the wings of future leaders.
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.22} direction="right">
                            <div className="flex flex-wrap items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => document.getElementById('mentorship-works')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="min-h-[44px] px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-300"
                                >
                                    Explore Programs
                                </motion.button>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Right: photo with floating badge */}
                    <FadeIn delay={0.18} direction="left">
                        <div className="relative">
                            <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-slate-300/40 aspect-[4/3]">
                                <LearningIllustration />
                            </div>
                            {/* Floating stat badge — sits inside the card on small screens to avoid clipping */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.55, type: 'spring' }}
                                className="absolute bottom-3 left-3 sm:bottom-6 sm:-left-6 bg-primary text-white rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-2xl shadow-primary/30"
                            >
                                <p className="text-xl sm:text-2xl font-black leading-none">500+</p>
                                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1 text-white/90">Active Mentees</p>
                            </motion.div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   OUR STORY — text + single portrait photo + stats
   ═══════════════════════════════════════════════ */
const OurStorySection = () => {
    return (
        <section className="py-14 sm:py-20 px-4 sm:px-6 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-start">
                    {/* Left: portrait photo */}
                    <FadeIn delay={0} direction="right">
                        <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-200 shadow-lg shadow-slate-200/50 aspect-[4/3] sm:aspect-[5/4] lg:aspect-square">
                            <img
                                src="https://images.unsplash.com/photo-1573497019418-b400bb3ab074?q=80&w=1200&auto=format&fit=crop"
                                alt="Mentee at a window"
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </FadeIn>

                    {/* Right: story text + stats */}
                    <div>
                        <FadeIn delay={0.08} direction="left">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Our Story</h2>
                            <div className="w-12 h-0.5 bg-primary mb-5 sm:mb-6" />
                        </FadeIn>
                        <FadeIn delay={0.15} direction="left">
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-4">
                                It started with a simple observation: the world is full of brilliant minds that lack the specific guidance required to navigate complex career terrains. A group of leaders decided to open their calendars to aspiring talent.
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.22} direction="left">
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-6 sm:mb-8">
                                What began as a local meetup in a community center has evolved into a growing ecosystem. Today, Eagles & Eaglets connects mentors with mentees worldwide, bridging the gap between industry veterans and the next generation of innovators, ensuring that wisdom is never lost, but always passed forward.
                            </p>
                        </FadeIn>

                        {/* Stats — placeholders for now, swap in real values when known */}
                        <FadeIn delay={0.3} direction="left">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-sm">
                                    {/* TODO: replace 'YYYY' with the Ministry's actual founding year */}
                                    <p className="text-xl sm:text-2xl font-black text-primary leading-none">YYYY</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Founded</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 shadow-sm">
                                    {/* TODO: replace '#+' with the actual countries-reached number */}
                                    <p className="text-xl sm:text-2xl font-black text-primary leading-none">#+</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Countries</p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   CORE ECOSYSTEM — 3 feature cards (relocated from HomePage)
   ═══════════════════════════════════════════════ */
const CoreEcosystemSection = () => {
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
        <section id="features" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <FadeIn>
                    <div className="text-center mb-10 sm:mb-14 lg:mb-16 max-w-2xl mx-auto">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">Platform</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4">Core Ecosystem</h2>
                        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Everything you need to grow professionally and personally within our community.
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                    {features.map((feat, i) => (
                        <FadeIn key={feat.title} delay={i * 0.12} direction="up">
                            <motion.div
                                whileHover={{ y: -6, scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 lg:p-8 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group h-full"
                            >
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${feat.iconBg} ${feat.color} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <span className="material-symbols-outlined text-xl sm:text-2xl">{feat.icon}</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 sm:mb-3">{feat.title}</h3>
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
   HOW MENTORSHIP WORKS — 4 numbered steps on green background
   (Uses the platform's primary green instead of the inspiration's blue
    to keep visual continuity with the rest of the site.)
   ═══════════════════════════════════════════════ */
const MentorshipWorksSection = () => {
    const steps = [
        {
            num: '01',
            title: 'Profile Match',
            description: 'Our matching engine aligns your goals with the perfect Eagle mentor in your field.',
        },
        {
            num: '02',
            title: 'Initial Flight',
            description: 'Attend your first 1-on-1 strategy session to map out your 6-month growth plan.',
        },
        {
            num: '03',
            title: 'Deep Dive',
            description: 'Bi-weekly coaching, exclusive webinars, and hands-on project feedback.',
        },
        {
            num: '04',
            title: 'Eagle Status',
            description: 'Graduate the program and become an Eagle, starting your own mentorship legacy.',
        },
    ];

    return (
        <section id="mentorship-works" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-primary to-emerald-700 text-white relative overflow-hidden">
            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                }}
            />

            <div className="relative max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-4 mb-10 sm:mb-14">
                    <FadeIn>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-2 sm:mb-3 block">Process</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">How Mentorship Works</h2>
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <p className="text-sm text-white/80 max-w-sm leading-relaxed">
                            A structured journey designed to take you from aspiring talent to industry leader.
                        </p>
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6">
                    {steps.map((step, i) => (
                        <FadeIn key={step.num} delay={i * 0.1} direction="up">
                            <div className="relative">
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-primary font-black text-sm sm:text-base flex items-center justify-center mb-4 sm:mb-5 shadow-lg shadow-emerald-900/30">
                                    {step.num}
                                </div>
                                <h3 className="text-base font-black text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-white/80 leading-relaxed">{step.description}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   CTA — Ready to take flight?
   ═══════════════════════════════════════════════ */
const CtaSection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <FadeIn direction="up">
                    <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white px-5 sm:px-8 py-10 sm:py-14 lg:py-16 text-center overflow-hidden">
                        {/* Subtle radial flourish */}
                        <div
                            className="absolute inset-0 opacity-30 pointer-events-none"
                            style={{
                                background: 'radial-gradient(circle at 30% 20%, rgba(34,197,94,0.25), transparent 50%)',
                            }}
                        />

                        <div className="relative">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 sm:mb-4 leading-tight">
                                Ready to take flight?
                            </h2>
                            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xl mx-auto mb-6 sm:mb-8">
                                Join thousands of ambitious professionals and industry leaders today. Whether you're looking to learn or ready to lead, there's a place for you in our community.
                            </p>

                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/register')}
                                    className="min-h-[44px] px-7 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all duration-300"
                                >
                                    Become an Eaglet
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/register')}
                                    className="min-h-[44px] px-7 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all duration-300"
                                >
                                    Apply as an Eagle
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   PAGE COMPOSITION
   ═══════════════════════════════════════════════ */
const AboutPage = () => {
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => { document.documentElement.style.scrollBehavior = ''; };
    }, []);

    return (
        <div className="relative bg-white min-h-screen overflow-x-hidden">
            <PublicNavbar />
            <HeroSection />
            <OurStorySection />
            <CoreEcosystemSection />
            <MentorshipWorksSection />
            <CtaSection />
            <PublicFooter />
        </div>
    );
};

export default AboutPage;
