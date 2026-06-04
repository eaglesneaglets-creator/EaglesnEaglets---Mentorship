import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicNavbar from '@shared/components/layout/PublicNavbar';
import PublicFooter from '@shared/components/layout/PublicFooter';
import FadeIn from '@shared/components/motion/FadeIn';
import LearningIllustration from '@shared/components/visual/LearningIllustration';
import storyPic from '../../assets/Story Pic.jpeg';

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
                    {/* Left: portrait photo. Container matches the photo's native
                        portrait ratio (~4/5) so object-cover has nothing to crop —
                        the full subject shows. Sticky on lg keeps the face in view
                        while the long story scrolls beside it. */}
                    <FadeIn delay={0} direction="right">
                        <div className="lg:sticky lg:top-24 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-200 shadow-lg shadow-slate-200/50 aspect-[4/5] max-w-md mx-auto lg:mx-0">
                            <img
                                src={storyPic}
                                alt="The conversations that became Eagles & Eaglets"
                                className="w-full h-full object-cover object-top"
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
                            <h3 className="text-base sm:text-lg font-bold italic text-slate-700 mb-3">
                                How It All Begun
                            </h3>
                            {/* Opening staccato beats grouped into one paragraph; <br/>
                                keeps the line rhythm without per-line margin gaps. */}
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-3">
                                It didn&apos;t begin as a platform.<br />
                                It began with people.<br />
                                A message. A conversation. A young person looking for guidance.
                            </p>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-3">
                                Over time, more and more young people reached out through LinkedIn, conferences, workshops, and everyday interactions. They were searching for clarity, encouragement, direction, and someone who could help them navigate life&apos;s opportunities and challenges. I showed up as much as I could&mdash;listening, sharing experiences, offering guidance, and investing in their growth.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.22} direction="left">
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-2">
                                But soon, it became clear: one person could only reach so many people. Yet the need was much greater. So I began to ask a simple question:
                            </p>
                            <p className="text-sm md:text-base italic text-slate-600 leading-relaxed mb-3">
                                What if more people could be part of this?
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.30} direction="left">
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-2">
                                I reached out to professionals, leaders, and individuals whose journeys, experiences, and lessons could inspire the next generation. Many were willing and eager to help. But there was a challenge: busy schedules, distance, and limited time made consistent mentorship difficult. And that&apos;s when the idea was born.
                            </p>
                            <p className="text-sm md:text-base italic text-slate-600 leading-relaxed mb-3">
                                What if mentorship could happen beyond physical boundaries? What if technology could connect mentors and young people&mdash;anytime, anywhere&mdash;without losing the human connection that makes mentorship so powerful?
                            </p>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-3">
                                That vision gave birth to Eagles &amp; Eaglets.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.38} direction="left">
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-3">
                                Today, Eagles &amp; Eaglets is a growing digital mentorship community where mentors (Eagles) and young people (Eaglets) connect, learn, share experiences, and grow together&mdash;without the limitations of time or location.
                            </p>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-4">
                                What started as a few conversations has grown into something much bigger: a movement dedicated to empowering young people with wisdom, guidance, encouragement, and opportunities to thrive&mdash;built on the belief that no young person should have to navigate life&apos;s journey alone.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.46} direction="left">
                            <p className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                                Eagles mentor. Eaglets grow. Together, we rise. 🦅✨
                            </p>
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
