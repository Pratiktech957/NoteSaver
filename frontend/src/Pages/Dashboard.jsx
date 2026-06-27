import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserSidebar from "../Components/UserSidebar";
import API from "../Services/api";

// Enhanced animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: i * 0.06,
            ease: [0.22, 1, 0.36, 1]
        }
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

// Enhanced card hover animations
const cardHover = {
    hover: {
        y: -8,
        scale: 1.03,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    tap: {
        scale: 0.97,
        transition: {
            duration: 0.1
        }
    }
};

// Stats card hover
const statsHover = {
    hover: {
        y: -6,
        scale: 1.04,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    },
    tap: {
        scale: 0.96,
        transition: {
            duration: 0.1
        }
    }
};

// Welcome text animation
const welcomeText = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

// Get avatar URL (using UI Avatars API - no backend change)
const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=4B5563&color=fff&size=80&bold=true`;
};

// Mobile menu toggle button - B&W Theme
const MobileMenuButton = ({ showSidebar, setShowSidebar }) => (
    <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all rounded-xl"
        aria-label="Toggle sidebar"
    >
        <div className="w-5 h-4 flex flex-col justify-between">
            <motion.span
                className="block w-full h-0.5 bg-gray-800 rounded-full"
                animate={{
                    rotate: showSidebar ? 45 : 0,
                    y: showSidebar ? 6 : 0
                }}
                transition={{ duration: 0.3 }}
            />
            <motion.span
                className="block w-full h-0.5 bg-gray-800 rounded-full"
                animate={{
                    opacity: showSidebar ? 0 : 1,
                    scale: showSidebar ? 0 : 1
                }}
                transition={{ duration: 0.3 }}
            />
            <motion.span
                className="block w-full h-0.5 bg-gray-800 rounded-full"
                animate={{
                    rotate: showSidebar ? -45 : 0,
                    y: showSidebar ? -6 : 0
                }}
                transition={{ duration: 0.3 }}
            />
        </div>
    </button>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME useEffect - NO CHANGES
    useEffect(() => {
        const fetchMyNotes = async () => {
            try {
                setError(null);
                const res = await API.get("/notes/my");
                setNotes(res.data.notes || []);

                // Fetch recent activity
                try {
                    const activityRes = await API.get("/notes/recent");
                    setRecentActivity(activityRes.data.activities || []);
                } catch (err) {
                    console.error("Failed to fetch activity:", err);
                }
            } catch (error) {
                console.error("FETCH NOTES ERROR:", error.response?.data || error.message);
                setError(error.response?.data?.message || "Failed to fetch your notes");
            } finally {
                setLoading(false);
            }
        };
        fetchMyNotes();
    }, []);

    // EXACT SAME calculations - NO CHANGES
    const totalViews = notes.reduce(
        (total, note) => total + (note.views || 0),
        0
    );

    const totalDownloads = notes.reduce(
        (total, note) => total + (note.downloads || 0),
        0
    );

    // EXACT SAME data - NO CHANGES
    const quickActions = [
        { icon: "⬆️", label: "Upload Notes", path: "/upload", description: "Share your knowledge" },
        { icon: "📚", label: "Browse Notes", path: "/notes", description: "Explore resources" },
        { icon: "🔔", label: "Notifications", path: "/notifications", description: "Stay updated" },
        { icon: "👤", label: "Profile", path: "/profile", description: "Manage account" }
    ];

    // EXACT SAME stats - NO CHANGES
    const stats = [
        { label: "Total Notes", value: notes.length, icon: "📚" },
        { label: "Total Views", value: totalViews, icon: "👁️" },
        { label: "Downloads", value: totalDownloads, icon: "⬇️" },
        { label: "Uploads", value: user?.uploadCount || 0, icon: "📤" }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 relative">
            {/* Mobile Sidebar Overlay - UI ONLY */}
            <AnimatePresence>
                {showMobileSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMobileSidebar(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar - UI ONLY */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: showMobileSidebar ? 0 : -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-2xl"
            >
                <UserSidebar />
            </motion.div>

            {/* Desktop Sidebar - UNCHANGED */}
            <div className="hidden lg:block">
                <UserSidebar />
            </div>

            {/* Main Content - ENHANCED UI ONLY */}
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                    {/* Mobile Menu Button */}
                    <MobileMenuButton
                        showSidebar={showMobileSidebar}
                        setShowSidebar={setShowMobileSidebar}
                    />

                    {/* Hero Section - ENHANCED UI */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-6 sm:mb-8 lg:mb-10 mt-12 lg:mt-0"
                    >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                            >
                                Dashboard
                            </motion.span>
                            {/* EXACT SAME conditional rendering - NO CHANGES */}
                            {!loading && notes.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"
                                >
                                    {notes.length} notes
                                </motion.span>
                            )}
                            {/* NEW: Verified badge - UI ONLY */}
                            {user?.isVerified && (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.35 }}
                                    className="text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1"
                                >
                                    <span className="text-xs">✅</span> Verified
                                </motion.span>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                {/* EXACT SAME welcome text - NO CHANGES */}
                                <motion.h1
                                    variants={welcomeText}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight"
                                >
                                    Welcome back, {user?.name} 👋
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl"
                                >
                                    Manage your notes, track your uploads, and grow your learning journey.
                                </motion.p>
                            </div>

                            {/* NEW: Quick upload button - UI ONLY */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link to="/upload">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <span className="text-base sm:text-lg">+</span> Upload New Note
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Error Message - EXACT SAME, only UI enhancements */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-xs sm:text-sm"
                            >
                                <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
                                <span className="flex-1">{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-500 hover:text-red-700 transition-colors p-1 flex-shrink-0"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stats Cards - B&W Theme */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
                    >
                        {/* EXACT SAME stats mapping - NO CHANGES */}
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index + 1}
                                {...statsHover}
                                whileHover="hover"
                                whileTap="tap"
                                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">
                                        {stat.label}
                                    </p>
                                    <motion.span
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center text-sm sm:text-base flex-shrink-0"
                                    >
                                        {stat.icon}
                                    </motion.span>
                                </div>
                                {/* EXACT SAME value display - NO CHANGES */}
                                <motion.p
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: index * 0.1 + 0.4,
                                        type: "spring",
                                        stiffness: 300
                                    }}
                                    className="text-xl sm:text-2xl font-bold text-gray-900 mt-2"
                                >
                                    {stat.value}
                                </motion.p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Quick Actions - B&W Theme */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
                    >
                        {/* EXACT SAME actions mapping - NO CHANGES */}
                        {quickActions.map((action, index) => (
                            <Link key={action.label} to={action.path}>
                                <motion.div
                                    variants={fadeInUp}
                                    custom={index + 5}
                                    {...cardHover}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="relative overflow-hidden bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 text-center cursor-pointer hover:shadow-lg transition-all duration-300 group"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-2 shadow-md"
                                    >
                                        <span className="text-xl sm:text-2xl">{action.icon}</span>
                                    </motion.div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {action.label}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                        {action.description}
                                    </p>
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>

                    {/* Profile + Activity Section - B&W Theme */}
                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Profile Summary - B&W with avatar */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={9}
                            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center shadow-md flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Profile Summary</h2>
                            </div>

                            <div className="px-4 sm:px-6 py-4 sm:py-5">
                                {/* NEW: Profile Avatar - UI ONLY */}
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                                    className="flex items-center gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-100"
                                >
                                    <div className="relative">
                                        <img
                                            src={getAvatarUrl(user?.name || 'User')}
                                            alt={user?.name}
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-gray-200 shadow-lg"
                                            loading="lazy"
                                        />
                                        <motion.div
                                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{user?.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                </motion.div>

                                {/* EXACT SAME profile data - NO CHANGES */}
                                <div className="space-y-2 sm:space-y-3">
                                    {[
                                        { label: "Email", value: user?.email, icon: "📧" },
                                        { label: "Phone", value: user?.phone || "Not Added", icon: "📱" },
                                        {
                                            label: "Status",
                                            value: user?.isVerified ? "Verified ✓" : "Unverified",
                                            icon: "✅",
                                            color: user?.isVerified ? "text-emerald-600" : "text-amber-600"
                                        },
                                        { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A", icon: "📅" }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 + 0.5 }}
                                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-gray-50 last:border-0 gap-1 sm:gap-0"
                                        >
                                            <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                                <span className="text-xs sm:text-sm">{item.icon}</span>
                                                {item.label}
                                            </span>
                                            <span className={`text-xs sm:text-sm font-semibold ${item.color || "text-gray-800"} truncate`}>
                                                {item.value}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Activity Summary - B&W Theme */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={10}
                            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center shadow-md flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <path d="M1 12.5l3.5-3.5 3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 6.5h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Activity Summary</h2>
                            </div>

                            {/* EXACT SAME activity data - NO CHANGES */}
                            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-2 sm:space-y-3">
                                {[
                                    { label: "📚 Notes Created", value: notes.length },
                                    { label: "👁️ Views Generated", value: totalViews },
                                    { label: "📤 Upload Count", value: user?.uploadCount || 0 },
                                    { label: "⬇️ Download Count", value: totalDownloads }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.6 }}
                                        className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                                    >
                                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                                            {item.label}
                                        </span>
                                        <motion.span
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{
                                                delay: index * 0.1 + 0.8,
                                                type: "spring",
                                                stiffness: 300
                                            }}
                                            className="text-base sm:text-lg font-bold text-gray-800"
                                        >
                                            {item.value}
                                        </motion.span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Notes - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={11}
                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-wrap items-center gap-2 sm:gap-3">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center shadow-md flex-shrink-0"
                            >
                                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                    <rect x="1" y="1" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M5 5h6M5 8h4M5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                            </motion.div>
                            <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Recent Notes</h2>
                            {/* EXACT SAME conditional rendering - NO CHANGES */}
                            {!loading && notes.length > 0 && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="ml-auto text-[10px] sm:text-xs text-gray-400"
                                >
                                    Showing {Math.min(5, notes.length)} of {notes.length}
                                </motion.span>
                            )}
                        </div>

                        <div className="px-4 sm:px-6 py-4 sm:py-5">
                            <AnimatePresence mode="wait">
                                {/* EXACT SAME loading state - NO CHANGES */}
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center py-12"
                                    >
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <svg className="animate-spin w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                            </svg>
                                            <span className="text-sm">Loading your notes...</span>
                                        </div>
                                    </motion.div>
                                ) : notes.length === 0 ? (
                                    /* EXACT SAME empty state - NO CHANGES */
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 5, -5, 0]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4"
                                        >
                                            <span className="text-3xl sm:text-4xl">📝</span>
                                        </motion.div>
                                        <p className="text-sm sm:text-base text-gray-500 font-medium">No notes uploaded yet.</p>
                                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Start sharing your knowledge with the community.</p>
                                        <Link to="/upload">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="mt-4 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-lg"
                                            >
                                                Upload Your First Note
                                            </motion.button>
                                        </Link>
                                    </motion.div>
                                ) : (
                                    /* EXACT SAME notes rendering - NO CHANGES to data mapping */
                                    <motion.div
                                        key="notes"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-2 sm:space-y-3"
                                    >
                                        {notes.slice(0, 5).map((note, index) => (
                                            <motion.div
                                                key={note._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{
                                                    x: 4,
                                                    backgroundColor: "#f8fafc",
                                                    transition: { duration: 0.2 }
                                                }}
                                                className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-3.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors"
                                                >
                                                    <span className="text-xs sm:text-sm">📄</span>
                                                </motion.div>

                                                {/* EXACT SAME note data - NO CHANGES */}
                                                <div className="flex-1 min-w-0 w-full">
                                                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 truncate group-hover:text-gray-900 transition-colors">
                                                        {note.title}
                                                    </h3>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                                                        {note.subject} {note.category && `• ${note.category}`}
                                                    </p>
                                                </div>

                                                {/* EXACT SAME note metadata - NO CHANGES */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400 flex-shrink-0 w-full sm:w-auto">
                                                    <motion.span
                                                        whileHover={{ scale: 1.1 }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        👁️ {note.views || 0}
                                                    </motion.span>
                                                    <motion.span
                                                        whileHover={{ scale: 1.1 }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        ⬇️ {note.downloads || 0}
                                                    </motion.span>
                                                    <span className="hidden sm:inline text-gray-300">·</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* View All Link - EXACT SAME logic */}
                        {!loading && notes.length > 5 && (
                            <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
                                <Link to="/notes">
                                    <motion.button
                                        whileHover={{ x: 4 }}
                                        className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
                                    >
                                        View all notes
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Footer - ENHANCED UI */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 sm:mt-10 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            NotesSaver Dashboard • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;