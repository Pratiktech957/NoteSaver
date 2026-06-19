import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import UserSidebar from "../Components/UserSidebar";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }
    })
};

const Dashboard = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyNotes = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:5000/api/notes/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setNotes(res.data.notes || []);
            } catch (error) {
                console.error(error);
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

    // Quick action items
    const quickActions = [
        { icon: "⬆️", label: "Upload Notes", path: "/upload", color: "indigo" },
        { icon: "📚", label: "Browse Notes", path: "/notes", color: "emerald" },
        { icon: "🔔", label: "Notifications", path: "/notifications", color: "violet" },
        { icon: "👤", label: "Profile", path: "/profile", color: "orange" }
    ];

    // Stats cards
    const stats = [
        { label: "Total Notes", value: notes.length, icon: "📚", color: "indigo" },
        { label: "Total Views", value: totalViews, icon: "👁️", color: "emerald" },
        { label: "Downloads", value: user?.downloadCount || 0, icon: "⬇️", color: "violet" },
        { label: "Uploads", value: user?.uploadCount || 0, icon: "📤", color: "orange" }
    ];

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <UserSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* Hero Section */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-10"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                Dashboard
                            </span>
                        </div>
                        <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight mt-2">
                            Welcome back, {user?.name} 👋
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                            Manage your notes, track your uploads, and grow your learning journey.
                        </p>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {stat.label}
                                    </p>
                                    <span className="text-base">{stat.icon}</span>
                                </div>
                                <p className={`text-2xl font-bold text-${stat.color}-600 mt-2`}>
                                    {stat.value}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {quickActions.map((action) => (
                            <Link key={action.label} to={action.path}>
                                <motion.div
                                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-4 text-center cursor-pointer hover:border-${action.color}-300 hover:shadow-md transition-all`}
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-${action.color}-50 flex items-center justify-center mx-auto mb-2`}>
                                        <span className="text-lg">{action.icon}</span>
                                    </div>
                                    <p className={`text-sm font-semibold text-slate-700`}>
                                        {action.label}
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
                            custom={3}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Profile Summary</h2>
                            </div>

                            <div className="px-6 py-5 space-y-3">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</span>
                                    <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</span>
                                    <span className="text-sm text-slate-600">{user?.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</span>
                                    <span className="text-sm text-slate-600">{user?.phone || "Not Added"}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Verified</span>
                                    <span className={`text-sm font-semibold ${user?.isVerified ? "text-emerald-600" : "text-amber-600"}`}>
                                        {user?.isVerified ? "Yes ✓" : "No"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Activity Summary */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={4}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <path d="M1 12.5l3.5-3.5 3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 6.5h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Activity Summary</h2>
                            </div>

                            <div className="px-6 py-5 space-y-3">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">📚 Notes Created</span>
                                    <span className="text-sm font-semibold text-slate-800">{notes.length}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">👁️ Views Generated</span>
                                    <span className="text-sm font-semibold text-slate-800">{totalViews}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">📤 Upload Count</span>
                                    <span className="text-sm font-semibold text-slate-800">{user?.uploadCount || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">⬇️ Download Count</span>
                                    <span className="text-sm font-semibold text-slate-800">{user?.downloadCount || 0}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Notes */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={5}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                    <rect x="1" y="1" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                    <path d="M5 5h6M5 8h4M5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                            </div>
                            <h2 className="text-sm font-semibold text-slate-800">Recent Notes</h2>
                            {!loading && notes.length > 0 && (
                                <span className="ml-auto text-xs text-slate-400">
                                    Showing {Math.min(5, notes.length)} of {notes.length}
                                </span>
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
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">📝</span>
                                        </div>
                                        <p className="text-sm text-slate-500">No notes uploaded yet.</p>
                                        <p className="text-xs text-slate-400 mt-1">Start sharing your knowledge with the community.</p>
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
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                                                    <span className="text-sm">📄</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                                        {note.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {note.subject}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
                                                    <span className="flex items-center gap-1">
                                                        👁️ {note.views || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        ⬇️ {note.downloads || 0}
                                                    </span>
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;