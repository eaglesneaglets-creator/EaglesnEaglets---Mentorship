import { useRef, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@shared/components/layout/Navbar';
import Footer from '@shared/components/layout/Footer';

const ThreeBackground = lazy(() => import('@shared/components/visual/ThreeBackground'));

const FadeInWhenVisible = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            {children}
        </motion.div>
    );
};

const LandingPage = () => {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const features = [
        {
            title: "Global Mentorship",
            desc: "Connect with world-class mentors who guide you from your first flight to absolute mastery.",
            icon: "diversity_3",
            color: "from-blue-500 to-indigo-600"
        },
        {
            title: "The Community Hub",
            desc: "A thriving ecosystem of eagles and eaglets sharing resources, feedback, and success.",
            icon: "hub",
            color: "from-emerald-400 to-emerald-600"
        },
        {
            title: "Impact Tracking",
            desc: "Personalized growth analytics and point systems that turn every milestone into a celebration.",
            icon: "monitoring",
            color: "from-amber-400 to-orange-600"
        }
    ];

    return (
        <div className="relative min-h-screen overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
            <Suspense fallback={null}>
                <ThreeBackground />
            </Suspense>
            <Navbar />

            {/* Hero Section */}
            <header ref={heroRef} className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
                <motion.div
                    style={{ y, opacity }}
                    className="max-w-5xl mx-auto text-center z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm"
                    >
                        <span className="text-emerald-600 text-sm font-bold tracking-tight">
                            The Future of Collaborative Growth
                        </span>
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                        Connect<span className="text-emerald-500">.</span><br />
                        Grow<span className="text-emerald-500">.</span><br />
                        Impact<span className="text-slate-200">.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed mb-10">
                        Join the world's most exclusive mentorship ecosystem. Where visionary leaders and ambitious builders unite to push the boundaries of what's possible.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20"
                        >
                            Get Started Now
                        </Link>
                        <button className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg text-slate-600 hover:bg-slate-50 transition-colors">
                            Explore Community
                        </button>
                    </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                    <span className="material-symbols-outlined text-3xl">keyboard_double_arrow_down</span>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <FadeInWhenVisible key={f.title} delay={i * 0.1}>
                                <div className="group relative p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity blur-3xl`} />
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20`}>
                                        <span className="material-symbols-outlined text-white text-3xl">{f.icon}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{f.title}</h3>
                                    <p className="text-slate-500 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            </FadeInWhenVisible>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision Store Teaser */}
            <section className="py-32 px-6 bg-slate-900 text-white rounded-[4rem] mx-6 mb-32 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/30 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                        <div className="md:w-1/2">
                            <FadeInWhenVisible>
                                <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-6 block">Visionary Collection</span>
                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                                    Carry the <br />
                                    <span className="text-emerald-400 italic">Vision Everywhere.</span>
                                </h2>
                                <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
                                    Our premium merchandise isn't just apparel—it's a statement of commitment to growth and community leadership.
                                </p>
                                <Link
                                    to="/store"
                                    className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-emerald-400 hover:text-white transition-all shadow-xl"
                                >
                                    Visit the Shop
                                    <span className="material-symbols-outlined">shopping_bag</span>
                                </Link>
                            </FadeInWhenVisible>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-2 gap-4">
                            <FadeInWhenVisible delay={0.2}>
                                <div className="aspect-[4/5] bg-slate-800 rounded-3xl overflow-hidden group">
                                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            </FadeInWhenVisible>
                            <FadeInWhenVisible delay={0.4}>
                                <div className="aspect-[4/5] bg-slate-800 rounded-3xl overflow-hidden translate-y-8 group">
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-slate-800 animate-pulse group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            </FadeInWhenVisible>
                        </div>
                    </div>
                </div>
            </section>

            {/* Voices of the Nest (Testimonials) */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <FadeInWhenVisible>
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
                                Voices of the Nest<span className="text-emerald-500">.</span>
                            </h2>
                            <p className="text-slate-500">Join thousands of leaders already building the future.</p>
                        </div>
                    </FadeInWhenVisible>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <FadeInWhenVisible key={i} delay={i * 0.1}>
                                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 italic text-slate-700 relative">
                                    <div className="flex gap-1 text-emerald-500 mb-6">
                                        {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined text-sm">star</span>)}
                                    </div>
                                    <p className="mb-8 leading-relaxed">
                                        "The mentorship connection I found here transformed my approach to leadership. The platform makes it so easy to track progress and stay motivated."
                                    </p>
                                    <div className="flex items-center gap-4 non-italic">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500" />
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">Visionary Eagle #{i}</h4>
                                            <p className="text-slate-500 text-xs">Community Mentor</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeInWhenVisible>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 relative">
                <FadeInWhenVisible>
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
                            Find your place <br /> in the Nest.
                        </h2>
                        <p className="text-slate-500 text-lg mb-12 max-w-xl mx-auto">
                            Whether you're looking to guide others or ready to take your first flight, our community is waiting for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 shadow-xl shadow-emerald-500/20"
                            >
                                Register Now
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto border border-slate-200 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </FadeInWhenVisible>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
