import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicNavbar from '@shared/components/layout/PublicNavbar';
import PublicFooter from '@shared/components/layout/PublicFooter';
import FadeIn from '@shared/components/motion/FadeIn';
import LearningIllustration from '@shared/components/visual/LearningIllustration';
import { useProducts } from '../../modules/store/hooks/useStore';

// 4K community teaching & learning hero — diverse group in a learning/mentorship setting
const heroBg = 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=90&w=3840&auto=format&fit=crop';

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

            <div className="relative z-10 min-h-screen flex items-center pt-24 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto w-full">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full border border-white/20 mb-4 sm:mb-6"
                    >
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        Community-Centered Mentorship
                    </motion.span>

                    <div className="max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-white mb-4 sm:mb-6"
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
                            className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed max-w-xl mb-6 sm:mb-10"
                        >
                            Join our community-centric mission to nurture, inspire, and build a brighter future for the youth in our neighborhood.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-wrap items-center gap-3 sm:gap-4"
                        >
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/register')}
                                className="min-h-[44px] px-6 sm:px-7 py-3 sm:py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all duration-300">
                                Get Started Now
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="min-h-[44px] flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-white/10 backdrop-blur-sm border border-white/25 text-white font-bold text-sm rounded-xl hover:bg-white/20 transition-all duration-300">
                                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-base fill">play_arrow</span>
                                </span>
                                Watch Story
                            </motion.button>
                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   ABOUT SECTION — 2-column: text left, illustration right
   ═══════════════════════════════════════════════ */
const AboutSection = () => {
    const navigate = useNavigate();
    return (
        <section id="about" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center">

                    {/* Left: text */}
                    <div>
                        <FadeIn delay={0} direction="right">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 sm:mb-3 block">
                                About Our Mission
                            </span>
                        </FadeIn>
                        <FadeIn delay={0.08} direction="right">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4 sm:mb-5">
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
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-6 sm:mb-8">
                                Our vision is simple: to create a safe nest where young minds can grow wings and learn to soar. By connecting local leaders with aspiring youth, we foster an environment of growth, resilience, and leadership.
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.3} direction="right">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/about')}
                                className="min-h-[44px] px-6 sm:px-7 py-3 sm:py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-300"
                            >
                                Learn More
                            </motion.button>
                        </FadeIn>
                    </div>

                    {/* Right: illustration */}
                    <FadeIn delay={0.1} direction="left">
                        <div className="relative">
                            <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xl shadow-slate-200/40 aspect-[4/3] sm:aspect-auto">
                                <LearningIllustration />
                            </div>
                            {/* Small floating badge — sits inside the card on phones so it doesn't clip past the viewport */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
                                className="absolute bottom-3 left-3 sm:-bottom-4 sm:-left-4 md:-left-6 bg-white rounded-2xl p-3 sm:p-4 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-2.5 sm:gap-3"
                            >
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-base sm:text-lg">diversity_3</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Community First</p>
                                    <p className="text-[11px] sm:text-xs text-slate-400">Building together</p>
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
   STORE — real products from API
   ═══════════════════════════════════════════════ */
const StoreSection = () => {
    const { data: productsData, isLoading } = useProducts();
    const allProducts = productsData?.data ?? [];
    const products = allProducts.slice(0, 4);

    return (
        <section id="store" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <FadeIn>
                    <div className="flex items-end justify-between gap-3 mb-8 sm:mb-10">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">The Store</h2>
                            <p className="text-sm text-slate-400 mt-1.5 sm:mt-2">Exclusive apparel and resources for the community.</p>
                        </div>
                        <Link to="/store" className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors group flex-shrink-0">
                            View All Items
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                </FadeIn>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square rounded-2xl bg-slate-100 mb-3 sm:mb-4" />
                                <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-slate-100 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 border border-dashed border-slate-200 rounded-2xl">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">storefront</span>
                        <p className="text-sm text-slate-400 px-4">New products coming soon. Check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((prod, i) => (
                            <FadeIn key={prod.id} delay={i * 0.1} direction="up">
                                <Link to={`/store/${prod.slug}`}>
                                <motion.div whileHover={{ y: -6 }} className="group cursor-pointer">
                                    <div className="relative aspect-square rounded-2xl border border-slate-200/50 overflow-hidden mb-4 group-hover:shadow-lg transition-all duration-300 bg-slate-100">
                                        {prod.primary_image ? (
                                            <img
                                                src={prod.primary_image}
                                                alt={prod.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-5xl text-slate-300">shopping_bag</span>
                                            </div>
                                        )}
                                        {prod.category_name && (
                                            <span className="absolute top-3 left-3 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                {prod.category_name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{prod.name}</h3>
                                    {prod.short_description && (
                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{prod.short_description}</p>
                                    )}
                                    <p className="text-sm font-bold text-slate-900 mt-2">₵{Number(prod.price).toLocaleString()}</p>
                                </motion.div>
                                </Link>
                            </FadeIn>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

/* ═══════════════════════════════════════════════
   TESTIMONIALS — Voices of the Nest
   Temporarily unmounted from the homepage (placeholder quotes).
   Exported so it stays lint-clean; re-add <TestimonialsSection /> to
   HomePage's render once real testimonials are collected.
   ═══════════════════════════════════════════════ */
export const TestimonialsSection = () => {
    const testimonials = [
        {
            quote: "This community has provided a safe space for my son to grow and discover his talents. The mentors are truly invested in the kids' futures.",
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
        <section id="testimonials" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 bg-slate-50/50">
            <div className="max-w-7xl mx-auto">
                <FadeIn>
                    <div className="mb-10 sm:mb-14 lg:mb-16">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">Testimonials</span>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-4">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Voices of the Nest</h2>
                            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                                Stories from the families and youth whose lives have been touched by our community outreach.
                            </p>
                        </div>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                    {testimonials.map((t, i) => (
                        <FadeIn key={t.name} delay={i * 0.12} direction="up">
                            <motion.div
                                whileHover={{ y: -4 }}
                                className={`rounded-2xl border p-5 sm:p-7 transition-all duration-300 flex flex-col h-full ${t.featured
                                    ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                                    : 'bg-white border-slate-200/80 hover:shadow-xl hover:shadow-slate-200/40'
                                    }`}
                            >
                                <div className="flex gap-0.5 mb-3 sm:mb-4">
                                    {[...Array(t.stars)].map((_, si) => (
                                        <span key={si} className={`material-symbols-outlined text-base sm:text-lg fill ${t.featured ? 'text-yellow-300' : 'text-yellow-400'}`}>star</span>
                                    ))}
                                </div>
                                <p className={`text-sm leading-relaxed flex-1 mb-5 sm:mb-6 ${t.featured ? 'text-white/90' : 'text-slate-500'}`}>
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-current/10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0`}
                                        style={{ backgroundColor: t.featured ? 'rgba(255,255,255,0.25)' : t.color }}>
                                        {t.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold truncate ${t.featured ? 'text-white' : 'text-slate-900'}`}>{t.name}</p>
                                        <p className={`text-xs font-semibold truncate ${t.featured ? 'text-white/70' : ''}`}
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
   ═══════════════════════════════════════════════ */
const DonateSection = () => {
    const navigate = useNavigate();

    return (
        <section id="donate" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
            <div className="max-w-4xl mx-auto">
                <FadeIn direction="up">
                    {/* Rounded green gradient card */}
                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden px-5 sm:px-8 py-10 sm:py-14 lg:py-16 text-center"
                        style={{
                            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 40%, #d1fae5 70%, #ecfdf5 100%)',
                        }}>

                        {/* Heading */}
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4">
                            Support the Mission
                        </h2>
                        <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-lg mx-auto mb-6 sm:mb-10">
                            Every contribution helps us provide more resources, mentoring sessions, and safe environments for our eaglets to soar. Together, we can make a lasting impact.
                        </p>

                        {/* CTA — centered single button */}
                        <div className="flex justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/donations')}
                                className="min-h-[44px] px-7 sm:px-8 py-3 sm:py-3.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all duration-300"
                            >
                                Donate Now
                            </motion.button>
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
            <StoreSection />
            {/* <TestimonialsSection /> — re-enable when real testimonials exist */}
            <DonateSection />
            <PublicFooter />
        </div>
    );
};

export default HomePage;
