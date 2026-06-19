import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState, useCallback } from "react";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
    })
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2
        }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const slideIn = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
};

const Landing = () => {
    const { user } = useAuth();
    const [counters, setCounters] = useState({});
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const statsRef = useRef(null);
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll();

    // Parallax effects
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Mouse parallax
    const handleMouseMove = useCallback((e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;
        setMousePosition({ x, y });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    // Animated counter effect
    useEffect(() => {
        if (!statsRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        stats.forEach((stat) => {
                            const finalValue = stat.value;
                            let current = 0;
                            const duration = 2000;
                            const steps = 60;
                            const increment = Math.ceil(finalValue / steps);
                            let step = 0;
                            const timer = setInterval(() => {
                                step++;
                                current += increment;
                                if (step >= steps || current >= finalValue) {
                                    current = finalValue;
                                    clearInterval(timer);
                                }
                                setCounters(prev => ({
                                    ...prev,
                                    [stat.label]: current
                                }));
                            }, duration / steps);
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    // Features data
    const features = [
        {
            icon: "📤",
            title: "Upload & Share",
            description: "Easily upload your study notes and share them with students worldwide.",
            size: "col-span-1",
            gradient: "from-indigo-50 to-purple-50"
        },
        {
            icon: "🔍",
            title: "Discover Resources",
            description: "Search and find notes from thousands of students across all subjects.",
            size: "col-span-1 md:col-span-2",
            gradient: "from-blue-50 to-indigo-50"
        },
        {
            icon: "📊",
            title: "Track Engagement",
            description: "Monitor views, downloads, and engagement on your uploaded content.",
            size: "col-span-1",
            gradient: "from-emerald-50 to-teal-50"
        },
        {
            icon: "🤝",
            title: "Collaborative Learning",
            description: "Join a community of learners sharing knowledge and helping each other.",
            size: "col-span-1 md:col-span-2",
            gradient: "from-violet-50 to-purple-50"
        },
        {
            icon: "🔒",
            title: "Secure & Private",
            description: "Your data is protected with enterprise-grade security and privacy controls.",
            size: "col-span-1",
            gradient: "from-rose-50 to-pink-50"
        },
        {
            icon: "📱",
            title: "Access Anywhere",
            description: "Access your notes and resources from any device, anywhere in the world.",
            size: "col-span-1",
            gradient: "from-amber-50 to-orange-50"
        }
    ];

    // Stats data
    const stats = [
        { label: "Active Users", value: 10000, suffix: "+", icon: "👥" },
        { label: "Notes Shared", value: 50000, suffix: "+", icon: "📚" },
        { label: "Downloads", value: 100000, suffix: "+", icon: "⬇️" },
        { label: "Categories", value: 30, suffix: "+", icon: "📂" }
    ];

    // Testimonials
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Computer Science Student",
            avatar: "👩‍🎓",
            quote: "NotesSaver completely transformed how I study. I've found amazing resources and connected with students worldwide."
        },
        {
            name: "Michael Chen",
            role: "Engineering Student",
            avatar: "👨‍🎓",
            quote: "The platform is incredibly intuitive. Uploading and sharing notes has never been easier. Highly recommended!"
        },
        {
            name: "Emily Rodriguez",
            role: "Medical Student",
            avatar: "👩‍⚕️",
            quote: "As a medical student, having access to quality notes is crucial. NotesSaver has been a game-changer for my studies."
        }
    ];

    // Floating orbs with gradient colors
    const FloatingOrbs = () => (
        <>
            <motion.div
                className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 30, 0],
                    y: [0, -20, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-40 right-10 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -30, 0],
                    y: [0, 20, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.div
                className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -40, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />
        </>
    );

    return (
        <div className="min-h-screen bg-[#F7F8FA] overflow-x-hidden">
            {/* Navbar with scroll effect */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/20"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2 group">
                            <motion.span
                                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                                whileHover={{ scale: 1.05 }}
                            >
                                NotesSaver
                            </motion.span>
                            <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">Beta</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {user ? (
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Link
                                        to="/dashboard"
                                        className="relative px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-xl hover:shadow-indigo-200/50 group"
                                    >
                                        <span>Dashboard</span>
                                        <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </motion.div>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-xl text-sm font-medium transition-all hover:bg-slate-50"
                                    >
                                        Sign In
                                    </Link>
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                        <Link
                                            to="/register"
                                            className="relative px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-xl hover:shadow-indigo-200/50 group"
                                        >
                                            <span>Get Started</span>
                                            <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section with Parallax */}
            <section ref={heroRef} className="relative overflow-hidden pt-32 pb-20 px-4 min-h-screen flex items-center">
                <FloatingOrbs />

                {/* Animated particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-indigo-400/30 rounded-full"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                                opacity: Math.random() * 0.5 + 0.2
                            }}
                            animate={{
                                y: [null, -100, -200],
                                opacity: [null, 0]
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ))}
                </div>

                <div className="relative max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6 border border-indigo-100/50"
                        >
                            <motion.span
                                className="w-2 h-2 rounded-full bg-indigo-600"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            Join 10,000+ Students
                        </motion.span>

                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 leading-[1.1]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <span className="block">Share Knowledge,</span>
                            <motion.span
                                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] inline-block"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                Empower Learning
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.7 }}
                        >
                            Upload, discover, and share study notes with a global community of students and educators.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.7 }}
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to={user ? "/dashboard" : "/register"}
                                    className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-all hover:shadow-2xl hover:shadow-indigo-200/50 text-sm overflow-hidden"
                                >
                                    <span className="relative z-10">{user ? "Go to Dashboard" : "Start Learning Today"}</span>
                                    <motion.span
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"
                                        animate={{
                                            x: [-100, 100],
                                            opacity: [0, 0.3, 0]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/notes"
                                    className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold border border-slate-200 transition-all hover:shadow-lg text-sm"
                                >
                                    Browse Notes
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.6 }}
                        >
                            {[
                                { label: "Free to use", icon: "✓" },
                                { label: "No credit card", icon: "✓" },
                                { label: "Instant access", icon: "✓" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="flex items-center gap-2"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 16 16" fill="none">
                                            <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {item.label}
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Floating Cards with mouse parallax */}
                        <motion.div
                            className="hidden lg:block absolute right-[-180px] top-1/2 -translate-y-1/2"
                            style={{
                                x: mousePosition.x * -0.5,
                                y: mousePosition.y * -0.5
                            }}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                        >
                            <motion.div
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/50 rotate-12 hover:rotate-6 transition-transform mb-4"
                                whileHover={{ scale: 1.05, rotate: 6 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">📄</div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Physics Notes</p>
                                        <p className="text-xs text-slate-500">⭐ 4.8 • 120 downloads</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/50 -rotate-6 ml-8 hover:rotate-0 transition-transform"
                                whileHover={{ scale: 1.05, rotate: 0 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl">📚</div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Calculus Notes</p>
                                        <p className="text-xs text-slate-500">⭐ 4.9 • 230 downloads</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Floating cards left side */}
                        <motion.div
                            className="hidden lg:block absolute left-[-180px] top-1/2 -translate-y-1/2"
                            style={{
                                x: mousePosition.x * 0.5,
                                y: mousePosition.y * 0.5
                            }}
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.4, duration: 0.8 }}
                        >
                            <motion.div
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/50 -rotate-12 hover:rotate-6 transition-transform mb-4"
                                whileHover={{ scale: 1.05, rotate: -6 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">📝</div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Biology Notes</p>
                                        <p className="text-xs text-slate-500">⭐ 4.7 • 180 downloads</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/50 rotate-6 ml-8 hover:rotate-0 transition-transform"
                                whileHover={{ scale: 1.05, rotate: 6 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl">📊</div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Statistics Notes</p>
                                        <p className="text-xs text-slate-500">⭐ 4.6 • 95 downloads</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section with Animated Counters */}
            <section ref={statsRef} className="py-20 px-4 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="text-center group p-6 rounded-2xl hover:bg-slate-50 transition-all"
                            >
                                <motion.div
                                    className="text-4xl mb-3"
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                >
                                    {stat.icon}
                                </motion.div>
                                <motion.p
                                    className="text-4xl md:text-5xl font-bold text-slate-900"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {counters[stat.label]?.toLocaleString() || "0"}{stat.suffix}
                                </motion.p>
                                <p className="text-sm text-slate-500 mt-2">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section - Bento Grid */}
            <section className="py-24 px-4 bg-[#F7F8FA]">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <motion.span
                            className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full mb-4"
                            whileHover={{ scale: 1.05 }}
                        >
                            Features
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
                            Powerful features designed to help you learn, share, and grow with the community.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)]"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                custom={index}
                                whileHover={{ y: -12, scale: 1.02 }}
                                className={`${feature.size} bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden`}
                            >
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                />
                                <div className="relative z-10">
                                    <motion.div
                                        className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl mb-4 shadow-sm group-hover:shadow-md transition-shadow"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        {feature.icon}
                                    </motion.div>
                                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">{feature.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                                    <motion.div
                                        className="mt-4 flex items-center text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        whileHover={{ x: 5 }}
                                    >
                                        Learn more
                                        <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-500 bg-violet-50 px-3 py-1 rounded-full mb-4">
                            Testimonials
                        </span>
                        <h2 className="text-4xl font-bold text-slate-900">
                            Loved by Students Worldwide
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                custom={index}
                                whileHover={{ y: -8 }}
                                className="bg-[#F7F8FA] rounded-2xl p-6 border border-slate-200/80 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">{testimonial.avatar}</span>
                                    <div>
                                        <p className="font-semibold text-slate-900">{testimonial.name}</p>
                                        <p className="text-xs text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.5L8 13.5 3.1 16l.9-5.5L0 6.8 5.5 6z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">"{testimonial.quote}"</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section with Floating Shapes */}
            <section className="relative overflow-hidden py-24 px-4">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5" />

                {/* Floating shapes */}
                <motion.div
                    className="absolute top-10 left-20 text-4xl"
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                >
                    🎓
                </motion.div>
                <motion.div
                    className="absolute bottom-20 right-20 text-4xl"
                    animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                >
                    📖
                </motion.div>
                <motion.div
                    className="absolute top-1/3 right-10 text-3xl"
                    animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                >
                    ⭐
                </motion.div>

                <div className="relative max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl shadow-2xl p-12 text-center"
                    >
                        <motion.div
                            className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 8, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                        />

                        <div className="relative">
                            <motion.span
                                className="inline-flex items-center gap-2 text-indigo-200 text-sm font-medium mb-4"
                                animate={{ opacity: [1, 0.7, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Join the community
                            </motion.span>
                            <motion.h2
                                className="text-4xl md:text-5xl font-bold text-white mb-4"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                Ready to Start Learning?
                            </motion.h2>
                            <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
                                Join thousands of students sharing knowledge and accelerating their learning journey.
                            </p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to={user ? "/dashboard" : "/register"}
                                    className="group inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-indigo-700 rounded-2xl font-semibold transition-all hover:shadow-2xl"
                                >
                                    {user ? "Go to Dashboard" : "Get Started for Free"}
                                    <motion.svg
                                        className="w-4 h-4"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        viewBox="0 0 16 16" fill="none"
                                    >
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </motion.svg>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                NotesSaver
                            </span>
                            <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Beta</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
                            <Link to="/notes" className="hover:text-slate-900 transition-colors">Browse</Link>
                            {!user && (
                                <>
                                    <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
                                    <Link to="/register" className="hover:text-slate-900 transition-colors">Sign Up</Link>
                                </>
                            )}
                            <span className="text-slate-300">|</span>
                            <span>© {new Date().getFullYear()} NotesSaver</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                        <span>Made By me (Pratik Mohanty)</span>
                        <span>•</span>
                        <span>v2.0.0</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            All systems operational
                        </span>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 4s ease infinite;
                }
            `}</style>
        </div>
    );
};

export default Landing;