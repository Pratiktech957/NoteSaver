import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserSidebar from "../Components/UserSidebar";
import API from "../Services/api";

// Animation variants
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

// Card hover animations
const cardHover = {
    hover: {
        y: -6,
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1
        }
    }
};

// Stats card hover
const statsHover = {
    hover: {
        y: -4,
        scale: 1.03,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    }
};

// Animation for welcome text
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

const Dashboard = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);

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

    const totalViews = notes.reduce(
        (total, note) => total + (note.views || 0),
        0
    );

    const totalDownloads = notes.reduce(
        (total, note) => total + (note.downloads || 0),
        0
    );

    // Quick action items with enhanced data
    const quickActions = [
        { icon: "⬆️", label: "Upload Notes", path: "/upload", color: "indigo", description: "Share your knowledge" },
        { icon: "📚", label: "Browse Notes", path: "/notes", color: "emerald", description: "Explore resources" },
        { icon: "🔔", label: "Notifications", path: "/notifications", color: "violet", description: "Stay updated" },
        { icon: "👤", label: "Profile", path: "/profile", color: "orange", description: "Manage account" }
    ];

    // Stats cards with enhanced data
    const stats = [
        { label: "Total Notes", value: notes.length, icon: "📚", color: "indigo", gradient: "from-indigo-500 to-indigo-600" },
        { label: "Total Views", value: totalViews, icon: "👁️", color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
        { label: "Downloads", value: totalDownloads, icon: "⬇️", color: "violet", gradient: "from-violet-500 to-violet-600" },
        { label: "Uploads", value: user?.uploadCount || 0, icon: "📤", color: "orange", gradient: "from-orange-500 to-orange-600" }
    ];

    const getColorClass = (color) => {
        const map = {
            indigo: "bg-indigo-50 text-indigo-600",
            emerald: "bg-emerald-50 text-emerald-600",
            violet: "bg-violet-50 text-violet-600",
            orange: "bg-orange-50 text-orange-600"
        };
        return map[color] || map.indigo;
    };

    const getHoverBorder = (color) => {
        const map = {
            indigo: "hover:border-indigo-300",
            emerald: "hover:border-emerald-300",
            violet: "hover:border-violet-300",
            orange: "hover:border-orange-300"
        };
        return map[color] || map.indigo;
    };

    const getGradient = (color) => {
        const map = {
            indigo: "from-indigo-500 to-purple-600",
            emerald: "from-emerald-500 to-teal-600",
            violet: "from-violet-500 to-purple-600",
            orange: "from-orange-500 to-amber-600"
        };
        return map[color] || map.indigo;
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <UserSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* Hero Section with enhanced animation */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-10"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full"
                            >
                                Dashboard
                            </motion.span>
                            {!loading && notes.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"
                                >
                                    {notes.length} notes
                                </motion.span>
                            )}
                        </div>
                        <motion.h1
                            variants={welcomeText}
                            initial="hidden"
                            animate="visible"
                            className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight mt-2"
                        >
                            Welcome back, {user?.name} 👋
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm text-slate-500 mt-1.5 max-w-2xl"
                        >
                            Manage your notes, track your uploads, and grow your learning journey.
                        </motion.p>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                            >
                                <span className="text-lg">⚠️</span>
                                <span className="text-sm">{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stats Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index + 1}
                                {...statsHover}
                                whileHover="hover"
                                whileTap="tap"
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {stat.label}
                                    </p>
                                    <motion.span
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-8 h-8 rounded-xl ${getColorClass(stat.color)} flex items-center justify-center text-base`}
                                    >
                                        {stat.icon}
                                    </motion.span>
                                </div>
                                <motion.p
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: index * 0.1 + 0.4,
                                        type: "spring",
                                        stiffness: 300
                                    }}
                                    className={`text-2xl font-bold text-${stat.color}-600 mt-2`}
                                >
                                    {stat.value}
                                </motion.p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Quick Actions with enhanced animations */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {quickActions.map((action, index) => (
                            <Link key={action.label} to={action.path}>
                                <motion.div
                                    variants={fadeInUp}
                                    custom={index + 5}
                                    {...cardHover}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-4 text-center cursor-pointer ${getHoverBorder(action.color)} hover:shadow-lg transition-all duration-300`}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(action.color)} flex items-center justify-center mx-auto mb-2 shadow-md`}
                                    >
                                        <span className="text-xl">{action.icon}</span>
                                    </motion.div>
                                    <p className={`text-sm font-semibold text-slate-700`}>
                                        {action.label}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {action.description}
                                    </p>
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>

                    {/* Profile + Activity Section */}
                    <div className="grid lg:grid-cols-2 gap-4 mb-8">
                        {/* Profile Summary */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={9}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md"
                                >
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-sm font-semibold text-slate-800">Profile Summary</h2>
                            </div>

                            <div className="px-6 py-5 space-y-3">
                                {[
                                    { label: "Name", value: user?.name, icon: "👤" },
                                    { label: "Email", value: user?.email, icon: "📧" },
                                    { label: "Phone", value: user?.phone || "Not Added", icon: "📱" },
                                    {
                                        label: "Status", value: user?.isVerified ? "Verified ✓" : "Unverified", icon: "✅",
                                        color: user?.isVerified ? "text-emerald-600" : "text-amber-600"
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.5 }}
                                        className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0"
                                    >
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                            <span>{item.icon}</span>
                                            {item.label}
                                        </span>
                                        <span className={`text-sm font-semibold ${item.color || "text-slate-800"}`}>
                                            {item.value}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Activity Summary */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={10}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md"
                                >
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <path d="M1 12.5l3.5-3.5 3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 6.5h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-sm font-semibold text-slate-800">Activity Summary</h2>
                            </div>

                            <div className="px-6 py-5 space-y-3">
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
                                        className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0"
                                    >
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
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
                                            className="text-sm font-bold text-slate-800"
                                        >
                                            {item.value}
                                        </motion.span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Notes */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={11}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md"
                            >
                                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                    <rect x="1" y="1" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M5 5h6M5 8h4M5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                            </motion.div>
                            <h2 className="text-sm font-semibold text-slate-800">Recent Notes</h2>
                            {!loading && notes.length > 0 && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="ml-auto text-xs text-slate-400"
                                >
                                    Showing {Math.min(5, notes.length)} of {notes.length}
                                </motion.span>
                            )}
                        </div>

                        <div className="px-6 py-5">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center py-12"
                                    >
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                            </svg>
                                            <span className="text-sm">Loading notes...</span>
                                        </div>
                                    </motion.div>
                                ) : notes.length === 0 ? (
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
                                            className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"
                                        >
                                            <span className="text-2xl">📝</span>
                                        </motion.div>
                                        <p className="text-sm text-slate-500">No notes uploaded yet.</p>
                                        <p className="text-xs text-slate-400 mt-1">Start sharing your knowledge with the community.</p>
                                        <Link to="/upload">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                                            >
                                                Upload Your First Note
                                            </motion.button>
                                        </Link>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="notes"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-3"
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
                                                className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors"
                                                >
                                                    <span className="text-sm">📄</span>
                                                </motion.div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                                        {note.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {note.subject}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
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
                                                    <span className="hidden sm:inline text-slate-300">·</span>
                                                    <span className="hidden sm:inline text-slate-400">
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

                        {/* View All Link */}
                        {!loading && notes.length > 5 && (
                            <div className="px-6 py-3 border-t border-slate-100">
                                <Link to="/notes">
                                    <motion.button
                                        whileHover={{ x: 4 }}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5"
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

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-10 text-center"
                    >
                        <p className="text-xs text-slate-400">
                            NotesSaver Dashboard • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;