import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── ANIMATION VARIANTS ────────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
    }),
};

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const hoverLift = {
    scale: 1.03,
    transition: { type: "spring", stiffness: 340, damping: 22 },
};

const tap = { scale: 0.97 };

// ─── MAGNETIC BUTTON ───────────────────────────────────────────────────────────

const MagneticBtn = ({ children, className, to, onClick }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 200, damping: 20 });
    const sy = useSpring(y, { stiffness: 200, damping: 20 });

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * 0.35);
        y.set((e.clientY - cy) * 0.35);
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    const inner = (
        <motion.span
            ref={ref}
            style={{ x: sx, y: sy }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.span>
    );

    return to ? <Link to={to}>{inner}</Link> : inner;
};

// ─── FLOATING NOTE CARDS (Signature Element) ──────────────────────────────────

const noteColors = [
    { bg: "#EEF2FF", border: "#C7D2FE", accent: "#4F46E5", label: "Calculus Notes", tag: "Mathematics" },
    { bg: "#F0FDF4", border: "#BBF7D0", accent: "#16A34A", label: "Biology Chapter 4", tag: "Life Sciences" },
    { bg: "#FFF7ED", border: "#FED7AA", accent: "#EA580C", label: "History Essay", tag: "Humanities" },
    { bg: "#F5F3FF", border: "#DDD6FE", accent: "#7C3AED", label: "Data Structures", tag: "CS" },
    { bg: "#ECFEFF", border: "#A5F3FC", accent: "#0891B2", label: "Physics Lab", tag: "Sciences" },
];

const NoteStack = () => {
    const [hovered, setHovered] = useState(false);

    const stackRotations = [-12, -6, -2, 3, 8];
    const stackY = [24, 16, 8, -4, -12];
    const stackX = [-8, -4, 0, 4, 8];

    const fanRotations = [-28, -14, 0, 14, 28];
    const fanY = [0, -8, -16, -8, 0];
    const fanX = [-80, -42, 0, 42, 80];

    return (
        <div
            className="relative w-full h-full flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Ambient glow */}
            <motion.div
                className="absolute w-80 h-80 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)" }}
                animate={{ scale: hovered ? 1.3 : 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            <div className="relative w-64 h-80">
                {noteColors.map((note, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden"
                        style={{ background: note.bg, border: `1.5px solid ${note.border}`, transformOrigin: "bottom center" }}
                        animate={{
                            rotate: hovered ? fanRotations[i] : stackRotations[i],
                            x: hovered ? fanX[i] : stackX[i],
                            y: hovered ? fanY[i] : stackY[i],
                            scale: hovered ? 0.9 : 1 - i * 0.02,
                            zIndex: hovered ? noteColors.length - i : noteColors.length - i,
                        }}
                        transition={{ type: "spring", stiffness: 180, damping: 22, delay: i * 0.03 }}
                        whileHover={hovered ? { scale: 1.0, zIndex: 20, y: (fanY[i] || 0) - 12 } : {}}
                    >
                        <div className="p-5 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <span
                                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: `${note.accent}18`, color: note.accent }}
                                >
                                    {note.tag}
                                </span>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map((d) => (
                                        <div key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: `${note.accent}60` }} />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 flex-1">
                                {[100, 85, 92, 70, 88].map((w, li) => (
                                    <div key={li} className="h-1.5 rounded-full" style={{ background: `${note.accent}22`, width: `${w}%` }} />
                                ))}
                            </div>

                            <div className="mt-auto pt-3 border-t" style={{ borderColor: note.border }}>
                                <p className="text-xs font-semibold" style={{ color: note.accent }}>{note.label}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[10px] text-slate-400">↓ {Math.floor(Math.random() * 900) + 100} downloads</span>
                                    <span className="text-[10px] text-slate-400">★ {(4 + Math.random()).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Hover hint */}
            <AnimatePresence>
                {!hovered && (
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap"
                    >
                        Hover to explore ↑
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── SCROLL PROGRESS BAR ───────────────────────────────────────────────────────

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-0.5 z-[100] origin-left"
            style={{ scaleX, background: "linear-gradient(90deg, #4F46E5, #7C3AED, #06B6D4)" }}
        />
    );
};

// ─── ANIMATED COUNTER ──────────────────────────────────────────────────────────

const Counter = ({ value, suffix }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const triggered = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !triggered.current) {
                triggered.current = true;
                const duration = 2000;
                const steps = 60;
                const increment = value / steps;
                let current = 0;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= value) { current = value; clearInterval(timer); }
                    setCount(Math.floor(current));
                }, duration / steps);
            }
        }, { threshold: 0.4 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <span ref={ref}>
            {count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : count}{suffix}
        </span>
    );
};

// ─── FAQ ITEM ──────────────────────────────────────────────────────────────────

const FAQItem = ({ q, a, idx }) => {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            variants={fadeUp}
            custom={idx}
            className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-indigo-100 transition-colors"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                aria-expanded={open}
            >
                <span className="font-semibold text-slate-800 text-sm sm:text-base">{q}</span>
                <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── STAR RATING ───────────────────────────────────────────────────────────────

const Stars = ({ n = 5 }) => (
    <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-3.5 h-3.5 ${i < n ? "text-amber-400" : "text-slate-200"}`} viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1l2.5 5 5.5.8-4 3.9.9 5.5L8 13.5 3.1 16l.9-5.5L0 6.8 5.5 6z" />
            </svg>
        ))}
    </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

const Landing = () => {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const navBg = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.92)"]);
    const navShadow = useTransform(scrollY, [0, 80], ["0 0 0 0 transparent", "0 1px 0 0 rgba(0,0,0,0.06)"]);

    // ── DATA ────────────────────────────────────────────────────────────────────

    const stats = [
        { icon: "👥", label: "Active Students", value: 12400, suffix: "+" },
        { icon: "📄", label: "Notes Shared", value: 58000, suffix: "+" },
        { icon: "⬇️", label: "Downloads", value: 210000, suffix: "+" },
        { icon: "📂", label: "Subjects Covered", value: 40, suffix: "+" },
    ];

    const features = [
        {
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            ),
            accent: "#4F46E5",
            bg: "#EEF2FF",
            title: "One-click Upload",
            body: "Drag-drop PDFs, images, or docs. We handle compression, OCR indexing, and instant CDN delivery — so your notes are discoverable in seconds.",
            img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=360&fit=crop&crop=center",
            span: "lg:col-span-2",
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
            ),
            accent: "#7C3AED",
            bg: "#F5F3FF",
            title: "Smart Discovery",
            body: "Full-text search across 50K+ notes. Filter by subject, university, file type, or date — and find exactly what you need.",
            img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=360&fit=crop&crop=center",
            span: "lg:col-span-1",
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            accent: "#0891B2",
            bg: "#ECFEFF",
            title: "Real-time Analytics",
            body: "See who's downloading your notes, which subjects trend by semester, and how your contributions impact the community.",
            img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=360&fit=crop&crop=center",
            span: "lg:col-span-1",
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            accent: "#16A34A",
            bg: "#F0FDF4",
            title: "Global Community",
            body: "Connect with students from 120+ universities. Follow top contributors, share feedback, and collaborate on study resources.",
            img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=360&fit=crop&crop=center",
            span: "lg:col-span-2",
        },
    ];

    const steps = [
        {
            n: "01",
            title: "Create your account",
            body: "Sign up in under 30 seconds — no credit card, no friction. Your student dashboard is ready instantly.",
            img: "https://images.unsplash.com/photo-1432888622747-4eb9a8f5a07d?w=600&h=400&fit=crop&crop=center",
        },
        {
            n: "02",
            title: "Upload your notes",
            body: "Drag-drop any file format. We auto-tag subjects, generate previews, and publish your note to the global library.",
            img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop&crop=center",
        },
        {
            n: "03",
            title: "Students discover & learn",
            body: "Others find your note via search or trending feeds. Every download earns you community reputation points.",
            img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop&crop=center",
        },
        {
            n: "04",
            title: "Grow together",
            body: "Your profile builds credibility over time. Top contributors unlock badges, featured placements, and more.",
            img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop&crop=center",
        },
    ];

    const testimonials = [
        {
            name: "Arjun Mehta",
            role: "B.Tech — IIT Bombay",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
            quote: "NotesSaver has been a revelation for exam prep. I found peer-reviewed notes for every subject, and my CGPA jumped by 0.4 points in one semester.",
            rating: 5,
        },
        {
            name: "Priya Nair",
            role: "MBBS — AIIMS Delhi",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
            quote: "Medical school is intense. Having structured anatomy and biochem notes from seniors at the same college changed everything for our batch.",
            rating: 5,
        },
        {
            name: "Liam O'Sullivan",
            role: "MSc Data Science — UCL",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
            quote: "I've tried every study platform out there. NotesSaver is the only one that feels built by someone who's actually been a student. It's brilliant.",
            rating: 5,
        },
        {
            name: "Yuki Tanaka",
            role: "Engineering — Osaka University",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
            quote: "I uploaded my thermodynamics notes on a Sunday and had 200 downloads by Monday morning. The reach of this platform is incredible.",
            rating: 5,
        },
        {
            name: "Sofia Martínez",
            role: "Law — Universidad de Madrid",
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
            quote: "The quality of notes here is so much higher than random PDFs online. Every note has ratings, previews, and real student reviews. Trustworthy.",
            rating: 5,
        },
        {
            name: "Tariq Al-Hassan",
            role: "MBA — INSEAD",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
            quote: "Even at business school the community here helps. Strategy frameworks, case notes, professor summaries — all available, all excellent.",
            rating: 5,
        },
    ];

    const faqs = [
        { q: "Is NotesSaver completely free to use?", a: "Yes — NotesSaver is free for students. Create an account, upload, and download notes with no paywalls. We believe quality education shouldn't be gated by cost." },
        { q: "What file formats are supported?", a: "We support PDFs, Word documents (.doc/.docx), PowerPoint (.pptx), images (PNG/JPEG), and plain text files. We generate in-browser previews for all formats." },
        { q: "How do I know the notes are accurate?", a: "Every note shows its download count, average star rating, and uploader's profile. Top-rated notes are verified by the community — bad content gets flagged and reviewed." },
        { q: "Can I upload notes and keep them private?", a: "Yes. You can set any note to private (visible only to you), unlisted (accessible via direct link), or public (listed in the global library). You control your content." },
        { q: "How does the community reputation system work?", a: "Every download, star rating, and positive review on your notes earns you reputation points. Higher reputation unlocks contributor badges, featured placements, and early access to new features." },
        { q: "Is my personal data safe?", a: "Absolutely. We use industry-standard encryption at rest and in transit. We don't sell your data or use it for advertising. Read our privacy policy for full details." },
    ];

    const logos = [
        { label: "MIT", class: "font-black tracking-tight text-slate-400 text-xl" },
        { label: "Stanford", class: "font-black tracking-tight text-slate-400 text-xl" },
        { label: "Oxford", class: "font-black tracking-tight text-slate-400 text-xl" },
        { label: "IIT", class: "font-black tracking-tight text-slate-400 text-xl" },
        { label: "UCL", class: "font-black tracking-tight text-slate-400 text-xl" },
        { label: "NUS", class: "font-black tracking-tight text-slate-400 text-xl" },
        { label: "BITS", class: "font-black tracking-tight text-slate-400 text-xl" },
    ];

    const navLinks = [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how" },
        { label: "Community", href: "#testimonials" },
        { label: "Browse", to: "/notes" },
    ];

    // ── RENDER ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#F8F9FC] overflow-x-hidden font-sans">
            <ScrollProgress />

            {/* ── NAVIGATION ──────────────────────────────────────────────────────── */}
            <motion.nav
                style={{ backgroundColor: navBg, boxShadow: navShadow }}
                className="fixed top-0.5 left-0 right-0 z-50 backdrop-blur-xl"
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 20 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <motion.div
                            className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200"
                            whileHover={{ rotate: -8, scale: 1.08 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="5" height="6" rx="1" fill="currentColor" />
                                <rect x="9" y="2" width="5" height="4" rx="1" fill="currentColor" opacity=".6" />
                                <rect x="2" y="10" width="12" height="4" rx="1" fill="currentColor" opacity=".4" />
                            </svg>
                        </motion.div>
                        <span className="text-[17px] font-bold text-slate-900 tracking-tight">NotesSaver</span>
                        <span className="hidden sm:block text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">Beta</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((l) =>
                            l.to ? (
                                <Link key={l.label} to={l.to} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/70 transition-all">
                                    {l.label}
                                </Link>
                            ) : (
                                <a key={l.label} href={l.href} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/70 transition-all">
                                    {l.label}
                                </a>
                            )
                        )}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <motion.div whileHover={hoverLift} whileTap={tap}>
                                <Link to="/dashboard" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                    Dashboard
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all">
                                    Sign in
                                </Link>
                                <motion.div whileHover={hoverLift} whileTap={tap}>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                                    >
                                        Get started free
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                    >
                        <div className="w-5 h-4 flex flex-col justify-between">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className="block h-0.5 bg-slate-700 rounded-full"
                                    animate={
                                        i === 0 ? { rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 } :
                                            i === 1 ? { opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 } :
                                                { rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }
                                    }
                                    transition={{ duration: 0.2 }}
                                />
                            ))}
                        </div>
                    </button>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-slate-100"
                        >
                            <div className="px-4 py-5 space-y-1">
                                {navLinks.map((l) =>
                                    l.to ? (
                                        <Link key={l.label} to={l.to} onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                                            {l.label}
                                        </Link>
                                    ) : (
                                        <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                                            {l.label}
                                        </a>
                                    )
                                )}
                                <div className="pt-3 space-y-2">
                                    {!user && (
                                        <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-center text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                            Sign in
                                        </Link>
                                    )}
                                    <Link to={user ? "/dashboard" : "/register"} onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-center text-white bg-slate-900 rounded-xl hover:bg-slate-700 transition-colors">
                                        {user ? "Dashboard" : "Get started free"}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* ── HERO ──────────────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center pt-24 pb-20 px-4 overflow-hidden">
                {/* Ambient background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-gradient-radial from-indigo-100/60 via-purple-50/30 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-gradient-radial from-cyan-100/40 to-transparent rounded-full blur-3xl" />
                    {/* Grid */}
                    <div
                        className="absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage: "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)",
                            backgroundSize: "60px 60px",
                        }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto w-full">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* Left: copy */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="text-center lg:text-left"
                        >
                            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
                                <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                                    12,400+ students learning right now
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeUp}
                                className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight"
                            >
                                Your notes,
                                <br />
                                <span
                                    className="relative inline-block"
                                    style={{
                                        background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #06B6D4 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    the world's
                                </span>
                                <br />
                                classroom.
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="mt-6 text-lg sm:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                            >
                                Upload your study notes and instantly reach thousands of students worldwide.
                                Discover, download, and learn from the best minds at your university — and beyond.
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                className="mt-9 flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3"
                            >
                                <motion.div whileHover={hoverLift} whileTap={tap}>
                                    <Link
                                        to={user ? "/dashboard" : "/register"}
                                        className="group flex items-center gap-2 px-7 py-4 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30"
                                    >
                                        {user ? "Go to Dashboard" : "Start for free"}
                                        <motion.svg
                                            className="w-4 h-4"
                                            viewBox="0 0 16 16" fill="none"
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </motion.svg>
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={hoverLift} whileTap={tap}>
                                    <Link
                                        to="/notes"
                                        className="flex items-center gap-2 px-7 py-4 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-2xl border border-slate-200 transition-all shadow-sm hover:shadow-md"
                                    >
                                        Browse notes
                                    </Link>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400"
                            >
                                {["No credit card needed", "Free forever plan", "Instant access"].map((t, i) => (
                                    <span key={i} className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {t}
                                    </span>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right: floating note stack */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="hidden lg:flex items-center justify-center h-[520px]"
                        >
                            <NoteStack />
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <motion.div
                        className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-transparent rounded-full"
                        animate={{ scaleY: [1, 0.5, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <span className="text-[10px] text-slate-400 tracking-widest uppercase">Scroll</span>
                </motion.div>
            </section>

            {/* ── TRUSTED BY ────────────────────────────────────────────────────────── */}
            <section className="py-10 border-y border-slate-100 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
                        Trusted by students from world-class institutions
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                        {logos.map((l, i) => (
                            <motion.span
                                key={i}
                                className={`${l.class} select-none`}
                                whileHover={{ opacity: 1, scale: 1.08 }}
                                initial={{ opacity: 0.4 }}
                                animate={{ opacity: 0.4 }}
                                transition={{ duration: 0.2 }}
                            >
                                {l.label}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ─────────────────────────────────────────────────────────────── */}
            <section className="py-20 sm:py-24 px-4 bg-[#F8F9FC]">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
                    >
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.label}
                                variants={fadeUp}
                                custom={i}
                                className="group text-center p-6 sm:p-8 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all"
                                whileHover={{ y: -6 }}
                            >
                                <motion.div
                                    className="text-3xl mb-3"
                                    whileHover={{ scale: 1.2, rotate: 12 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {s.icon}
                                </motion.div>
                                <p className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">
                                    <Counter value={s.value} suffix={s.suffix} />
                                </p>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">{s.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES BENTO ────────────────────────────────────────────────────── */}
            <section id="features" className="py-20 sm:py-24 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-14"
                    >
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mb-4">
                            Platform features
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Built for how students
                            <br className="hidden sm:block" /> actually study
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                variants={fadeUp}
                                custom={i}
                                className={`${f.span} relative bg-[#F8F9FC] rounded-2xl border border-slate-100 overflow-hidden group hover:border-slate-200 hover:shadow-xl transition-all`}
                                whileHover={{ y: -6 }}
                            >
                                {/* Image */}
                                <div className="relative h-44 overflow-hidden">
                                    <img
                                        src={f.img}
                                        alt={f.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                </div>

                                <div className="p-6">
                                    <div
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3"
                                        style={{ background: f.bg, color: f.accent }}
                                    >
                                        {f.icon}
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1.5">{f.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>

                                    <motion.div
                                        className="mt-4 flex items-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: f.accent }}
                                        whileHover={{ x: 4 }}
                                    >
                                        Learn more
                                        <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
            <section id="how" className="py-20 sm:py-24 px-4 bg-[#F8F9FC]">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full mb-4">
                            How it works
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Share knowledge in four steps
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s, i) => (
                            <motion.div
                                key={s.n}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -6 }}
                                className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:border-indigo-100 hover:shadow-xl transition-all"
                            >
                                <div className="relative h-40 overflow-hidden">
                                    <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                    <span className="absolute top-3 left-3 text-3xl font-black text-white/30 leading-none">{s.n}</span>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-900 text-base mb-1.5">{s.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/3 -right-3 z-10">
                                        <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
            <section id="testimonials" className="py-20 sm:py-24 px-4 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-14"
                    >
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full mb-4">
                            Student stories
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Loved by students everywhere
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                custom={i}
                                whileHover={{ y: -6 }}
                                className="bg-[#F8F9FC] rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-xl transition-all"
                            >
                                <Stars n={t.rating} />
                                <p className="mt-3 mb-5 text-sm text-slate-600 leading-relaxed">"{t.quote}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white" loading="lazy" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                                        <p className="text-xs text-slate-400">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
            <section className="py-20 sm:py-24 px-4 bg-[#F8F9FC]">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full mb-4">
                            FAQ
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Questions you might have
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-3"
                    >
                        {faqs.map((f, i) => (
                            <FAQItem key={i} q={f.q} a={f.a} idx={i} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden py-20 sm:py-28 px-4">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=1920&h=700&fit=crop&crop=center')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-indigo-950/90 to-violet-950/90" />
                </div>

                {/* Noise texture */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                {/* Floating emoji */}
                {["🎓", "📖", "⭐", "💡", "📐"].map((e, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-3xl opacity-20 pointer-events-none"
                        style={{ left: `${10 + i * 20}%`, top: `${15 + (i % 3) * 25}%` }}
                        animate={{ y: [0, -18, 0], rotate: [0, i % 2 === 0 ? 12 : -12, 0] }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
                    >
                        {e}
                    </motion.div>
                ))}

                <div className="relative max-w-3xl mx-auto text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Join the movement
                        </div>

                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.07] tracking-tight mb-5">
                            Ready to share
                            <br />
                            what you know?
                        </h2>

                        <p className="text-indigo-200 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                            Thousands of students are already learning from each other. Your notes could be the resource someone needs right now.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <motion.div whileHover={hoverLift} whileTap={tap}>
                                <Link
                                    to={user ? "/dashboard" : "/register"}
                                    className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 text-sm font-bold rounded-2xl transition-all shadow-2xl hover:shadow-white/20"
                                >
                                    {user ? "Go to Dashboard" : "Create free account"}
                                    <motion.svg
                                        className="w-4 h-4"
                                        viewBox="0 0 16 16" fill="none"
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.8, repeat: Infinity }}
                                    >
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </motion.svg>
                                </Link>
                            </motion.div>
                            <motion.div whileHover={hoverLift} whileTap={tap}>
                                <Link
                                    to="/notes"
                                    className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-2xl border border-white/20 transition-all backdrop-blur-sm"
                                >
                                    Browse notes first
                                </Link>
                            </motion.div>
                        </div>

                        <p className="mt-6 text-xs text-indigo-400">No credit card · Free forever plan · Cancel anytime</p>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
            <footer className="bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="col-span-full sm:col-span-2 lg:col-span-1">
                            <Link to="/" className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                                        <rect x="2" y="2" width="5" height="6" rx="1" fill="currentColor" />
                                        <rect x="9" y="2" width="5" height="4" rx="1" fill="currentColor" opacity=".6" />
                                        <rect x="2" y="10" width="12" height="4" rx="1" fill="currentColor" opacity=".4" />
                                    </svg>
                                </div>
                                <span className="text-[17px] font-bold text-slate-900 tracking-tight">NotesSaver</span>
                            </Link>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-5">
                                The open platform where students share knowledge and accelerate learning together.
                            </p>
                            <div className="flex items-center gap-2">
                                {[
                                    { label: "GitHub", icon: <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="currentColor" /> },
                                ].map((s, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        aria-label={s.label}
                                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-700"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">{s.icon}</svg>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links columns */}
                        {[
                            {
                                head: "Product",
                                links: [
                                    { label: "Browse Notes", to: "/notes" },
                                    { label: "Upload", to: user ? "/dashboard" : "/register" },
                                    { label: "Dashboard", to: user ? "/dashboard" : "/login" },
                                ],
                            },
                            {
                                head: "Community",
                                links: [
                                    { label: "Top Contributors", to: "/notes" },
                                    { label: "Trending", to: "/notes" },
                                    { label: "All Categories", to: "/notes" },
                                ],
                            },
                            {
                                head: "Account",
                                links: user
                                    ? [{ label: "Dashboard", to: "/dashboard" }]
                                    : [
                                        { label: "Sign in", to: "/login" },
                                        { label: "Create account", to: "/register" },
                                    ],
                            },
                        ].map((col) => (
                            <div key={col.head}>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{col.head}</h4>
                                <ul className="space-y-3">
                                    {col.links.map((l) => (
                                        <li key={l.label}>
                                            <Link to={l.to} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                                                {l.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-4">
                            <span>© {new Date().getFullYear()} NotesSaver</span>
                            <span className="text-slate-200">|</span>
                            <span>Made with ❤️ by Pratik Mohanty</span>
                            <span className="text-slate-200 hidden xs:inline">|</span>
                            <span className="hidden xs:inline">v2.0.0</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            <span>All systems operational</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── GLOBAL STYLES ─────────────────────────────────────────────────────── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        .group:hover .group-hover\\:scale-108 {
          transform: scale(1.08);
        }

        @media (max-width: 374px) {
          .xs\\:flex-row { flex-direction: column; }
          .xs\\:inline { display: none; }
        }
        @media (min-width: 375px) {
          .xs\\:flex-row { flex-direction: row; }
          .xs\\:inline { display: inline; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
        </div>
    );
};

export default Landing;