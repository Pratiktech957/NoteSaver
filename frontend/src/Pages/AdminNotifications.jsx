import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }
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

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState("all");

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "http://localhost:5000/api/notifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            setActionLoading(id);
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5000/api/notifications/${id}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchNotifications();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        if (unread.length === 0) return;

        try {
            setActionLoading("all");
            const token = localStorage.getItem("token");
            await axios.put(
                "http://localhost:5000/api/notifications/mark-all-read",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchNotifications();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const getTypeBadge = (type) => {
        const typeMap = {
            UPLOAD: { label: "Upload", color: "bg-blue-50 text-blue-700 border-blue-100" },
            DOWNLOAD: { label: "Download", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            BOOKMARK: { label: "Bookmark", color: "bg-violet-50 text-violet-700 border-violet-100" },
            LIKE: { label: "Like", color: "bg-red-50 text-red-700 border-red-100" },
            REPORT: { label: "Report", color: "bg-orange-50 text-orange-700 border-orange-100" },
            REPORT_REVIEWED: { label: "Reviewed", color: "bg-purple-50 text-purple-700 border-purple-100" },
            ADMIN: { label: "Admin", color: "bg-slate-50 text-slate-700 border-slate-100" },
            GENERAL: { label: "General", color: "bg-gray-50 text-gray-700 border-gray-100" }
        };
        return typeMap[type] || typeMap.GENERAL;
    };

    const filteredNotifications = useMemo(() => {
        if (filter === "all") return notifications;
        if (filter === "unread") return notifications.filter(n => !n.isRead);
        if (filter === "read") return notifications.filter(n => n.isRead);
        return notifications;
    }, [notifications, filter]);

    const totalCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                                <div>
                                    <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                                </div>
                            </div>
                            <div className="h-3 bg-slate-200 rounded w-40"></div>
                        </div>
                        <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Empty state
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-16 text-center"
        >
            <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔔</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {filter !== "all" ? "No matching notifications" : "No Notifications"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {filter !== "all" ? "Try changing your filter." : "Notifications will appear here when there's activity."}
            </p>
        </motion.div>
    );

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <AdminSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">

                    {/* Header */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                Admin
                            </span>
                            {!loading && unreadCount > 0 && (
                                <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                                    Admin Notifications
                                </h1>
                                <p className="text-sm text-slate-500 mt-1.5">
                                    Stay updated with platform activity and admin alerts.
                                </p>
                            </div>
                            {!loading && unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    disabled={actionLoading === "all"}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50"
                                >
                                    {actionLoading === "all" ? (
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                            <path d="M14 4L6 12L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    Mark All Read
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                    >
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total Notifications
                                    </p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                                        {loading ? "..." : totalCount}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <span className="text-lg">📬</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Unread
                                    </p>
                                    <p className="text-2xl font-bold text-red-500 mt-1">
                                        {loading ? "..." : unreadCount}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <span className="text-lg">🔴</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Read
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-500 mt-1">
                                        {loading ? "..." : readCount}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <span className="text-lg">✅</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filter Bar */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-4 mb-8"
                    >
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "all"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter("unread")}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "unread"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                Unread
                            </button>
                            <button
                                onClick={() => setFilter("read")}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "read"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                Read
                            </button>
                            <span className="ml-auto text-sm text-slate-400 flex items-center">
                                {filteredNotifications.length} notifications
                            </span>
                        </div>
                    </motion.div>

                    {/* Notifications List */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSkeleton key="loading" />
                        ) : filteredNotifications.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <motion.div
                                key="notifications"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {filteredNotifications.map((notification, index) => {
                                    const typeBadge = getTypeBadge(notification.type);
                                    return (
                                        <motion.div
                                            key={notification._id}
                                            variants={fadeInUp}
                                            custom={index}
                                            className={`bg-white rounded-2xl border ${notification.isRead
                                                ? "border-slate-200/80"
                                                : "border-indigo-200/80 shadow-[0_1px_8px_0_rgba(99,102,241,0.1)]"
                                                } shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] p-6 hover:shadow-lg transition-all duration-300 ${!notification.isRead && "bg-gradient-to-r from-indigo-50/30 to-white"
                                                }`}
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 mt-1">
                                                            <span className="text-xl">
                                                                {notification.isRead ? "✅" : "🔔"}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                                <h3 className={`font-semibold text-slate-900 ${!notification.isRead && "text-indigo-700"
                                                                    }`}>
                                                                    {notification.title}
                                                                </h3>
                                                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}>
                                                                    {typeBadge.label}
                                                                </span>
                                                                {!notification.isRead && (
                                                                    <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                                {notification.message}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-3">
                                                                <span className="text-xs text-slate-400">
                                                                    {new Date(notification.createdAt).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                                <span className="text-xs text-slate-400">
                                                                    From: {notification.user?.name || "System"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification._id)}
                                                        disabled={actionLoading === notification._id}
                                                        className="flex-shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading === notification._id ? (
                                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                            </svg>
                                                        ) : (
                                                            "Mark Read"
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer note */}
                    {!loading && filteredNotifications.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Showing {filteredNotifications.length} of {notifications.length} notifications
                                {filter !== "all" && ` • ${filter}`}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;