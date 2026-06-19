import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../Components/AdminSidebar";
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

const scaleOnHover = {
    hover: {
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
        scale: 0.95,
        transition: { duration: 0.1 }
    }
};

// Animation for notification badges
const pulseBadge = {
    animate: {
        scale: [1, 1.1, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState("all");
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setError(null);
            const res = await API.get("/notifications");
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error("FETCH NOTIFICATIONS ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to fetch notifications");
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
            await API.put(`/notifications/${id}/read`);
            await fetchNotifications();
        } catch (error) {
            console.error("MARK READ ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to mark notification as read");
        } finally {
            setActionLoading(null);
        }
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        if (unread.length === 0) return;

        try {
            setActionLoading("all");
            await API.put("/notifications/mark-all-read");
            await fetchNotifications();
        } catch (error) {
            console.error("MARK ALL READ ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to mark all as read");
        } finally {
            setActionLoading(null);
        }
    };

    const getTypeBadge = (type) => {
        const typeMap = {
            UPLOAD: { label: "Upload", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "📤" },
            DOWNLOAD: { label: "Download", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "📥" },
            BOOKMARK: { label: "Bookmark", color: "bg-violet-50 text-violet-700 border-violet-200", icon: "🔖" },
            LIKE: { label: "Like", color: "bg-red-50 text-red-700 border-red-200", icon: "❤️" },
            REPORT: { label: "Report", color: "bg-orange-50 text-orange-700 border-orange-200", icon: "🚨" },
            REPORT_REVIEWED: { label: "Reviewed", color: "bg-purple-50 text-purple-700 border-purple-200", icon: "✅" },
            ADMIN: { label: "Admin", color: "bg-slate-50 text-slate-700 border-slate-200", icon: "🛡️" },
            GENERAL: { label: "General", color: "bg-gray-50 text-gray-700 border-gray-200", icon: "📌" }
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

    // Loading skeleton with shimmer
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer"></div>
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
                </motion.div>
            ))}
        </div>
    );

    // Empty state
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
            }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-16 text-center"
        >
            <motion.div
                animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6"
            >
                <span className="text-5xl">🔔</span>
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {filter !== "all" ? "No matching notifications" : "No Notifications"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {filter !== "all" ? "Try changing your filter." : "Notifications will appear here when there's activity."}
            </p>
        </motion.div>
    );

    // Stat cards data
    const statCards = [
        { label: "Total Notifications", value: totalCount, icon: "📬", color: "indigo" },
        { label: "Unread", value: unreadCount, icon: "🔴", color: "red" },
        { label: "Read", value: readCount, icon: "✅", color: "emerald" }
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
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
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full"
                            >
                                Admin
                            </motion.span>
                            {!loading && unreadCount > 0 && (
                                <motion.span
                                    {...pulseBadge}
                                    animate="animate"
                                    className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm shadow-red-200"
                                >
                                    {unreadCount} unread
                                </motion.span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <motion.h1
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight"
                                >
                                    Admin Notifications
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-slate-500 mt-1.5"
                                >
                                    Stay updated with platform activity and admin alerts.
                                </motion.p>
                            </div>
                            {!loading && unreadCount > 0 && (
                                <motion.button
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={markAllRead}
                                    disabled={actionLoading === "all"}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                    >
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index + 1}
                                whileHover={{
                                    y: -6,
                                    scale: 1.02,
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {stat.label}
                                        </p>
                                        <motion.p
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{
                                                delay: index * 0.1 + 0.4,
                                                type: "spring",
                                                stiffness: 300
                                            }}
                                            className={`text-2xl font-bold mt-1 text-${stat.color}-500`}
                                        >
                                            {loading ? "..." : stat.value}
                                        </motion.p>
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}
                                    >
                                        <span className="text-lg">{stat.icon}</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Filter Bar */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-4 mb-8"
                    >
                        <div className="flex flex-wrap gap-2 items-center">
                            {["all", "unread", "read"].map((filterOption) => (
                                <motion.button
                                    key={filterOption}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFilter(filterOption)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === filterOption
                                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200"
                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                        }`}
                                >
                                    {filterOption === "all" ? "All" : filterOption}
                                    {filterOption !== "all" && (
                                        <span className="ml-1 text-xs opacity-75">
                                            ({filterOption === "unread" ? unreadCount : readCount})
                                        </span>
                                    )}
                                </motion.button>
                            ))}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="ml-auto text-sm text-slate-400 flex items-center gap-1"
                            >
                                <span className="font-medium text-slate-600">{filteredNotifications.length}</span>
                                notifications
                            </motion.span>
                        </div>
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
                                            whileHover={{
                                                y: -4,
                                                scale: 1.005,
                                                transition: { duration: 0.2 }
                                            }}
                                            className={`relative overflow-hidden bg-white rounded-2xl border ${notification.isRead
                                                ? "border-slate-200/80"
                                                : "border-indigo-200/80 shadow-[0_1px_8px_0_rgba(99,102,241,0.12)]"
                                                } shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] p-6 hover:shadow-xl transition-all duration-300 ${!notification.isRead && "bg-gradient-to-r from-indigo-50/30 to-white"
                                                }`}
                                        >
                                            {/* Unread indicator bar */}
                                            {!notification.isRead && (
                                                <motion.div
                                                    className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"
                                                    initial={{ scaleY: 0 }}
                                                    animate={{ scaleY: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            )}

                                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-3">
                                                        <motion.div
                                                            className="flex-shrink-0 mt-1"
                                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                                        >
                                                            <span className="text-xl">
                                                                {notification.isRead ? "✅" : "🔔"}
                                                            </span>
                                                        </motion.div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                                <h3 className={`font-semibold ${!notification.isRead
                                                                    ? "text-indigo-700"
                                                                    : "text-slate-900"
                                                                    }`}>
                                                                    {notification.title}
                                                                </h3>
                                                                <motion.span
                                                                    whileHover={{ scale: 1.05 }}
                                                                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}
                                                                >
                                                                    {typeBadge.icon} {typeBadge.label}
                                                                </motion.span>
                                                                {!notification.isRead && (
                                                                    <motion.span
                                                                        {...pulseBadge}
                                                                        animate="animate"
                                                                        className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm shadow-red-200"
                                                                    >
                                                                        New
                                                                    </motion.span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                                {notification.message}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                                                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                                    </svg>
                                                                    {new Date(notification.createdAt).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                                                                        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                                                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                                                    </svg>
                                                                    From: {notification.user?.name || "System"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!notification.isRead && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => markAsRead(notification._id)}
                                                        disabled={actionLoading === notification._id}
                                                        className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading === notification._id ? (
                                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                            </svg>
                                                        ) : (
                                                            "Mark Read"
                                                        )}
                                                    </motion.button>
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
                            transition={{ delay: 0.5 }}
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