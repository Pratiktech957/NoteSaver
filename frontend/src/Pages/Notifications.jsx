import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import UserSidebar from "../Components/UserSidebar";
import API from "../services/api";

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

const slideIn = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

// Toast notification component with enhanced animations
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = {
        success: "bg-emerald-50 border-emerald-200 text-emerald-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    const iconMap = {
        success: "✅",
        error: "❌",
        info: "ℹ️"
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl border shadow-lg max-w-sm ${bgColor[type] || bgColor.info}`}
        >
            <div className="flex items-center gap-3">
                <span className="text-lg">{iconMap[type] || "ℹ️"}</span>
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
                >
                    ✕
                </button>
            </div>
        </motion.div>
    );
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [toast, setToast] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Get user from localStorage
    const user = useMemo(() => {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }, []);

    // Connect to Socket.IO with environment variable
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');
        const newSocket = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on("connect", () => {
            console.log("🔗 Socket connected:", newSocket.id);
            setIsConnected(true);

            // Join user room
            if (user?._id) {
                newSocket.emit("joinRoom", user._id);
                console.log(`📡 Joined room: ${user._id}`);
            }
        });

        newSocket.on("disconnect", () => {
            console.log("🔌 Socket disconnected");
            setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            if (newSocket.connected) {
                newSocket.disconnect();
            }
            newSocket.close();
        };
    }, [user]);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setError(null);
            const res = await API.get("/notifications");
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error("❌ Fetch notifications error:", error);
            setError(error.response?.data?.message || "Failed to fetch notifications");
            showToast("Failed to load notifications", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data) => {
            console.log("📨 New notification received:", data);
            setNotifications(prev => {
                const exists = prev.some(n => n._id === data.notification._id);
                if (exists) return prev;
                return [data.notification, ...prev];
            });
            showToast("New notification received!", "info");
        };

        const handleNotificationRead = (data) => {
            console.log("📖 Notification marked as read:", data);
            setNotifications(prev =>
                prev.map(n =>
                    n._id === data.notificationId
                        ? { ...n, isRead: true }
                        : n
                )
            );
        };

        const handleAllNotificationsRead = (data) => {
            console.log("📚 All notifications marked as read:", data);
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            showToast("All notifications marked as read", "success");
        };

        const handleNotificationDeleted = (data) => {
            console.log("🗑️ Notification deleted:", data);
            setNotifications(prev =>
                prev.filter(n => n._id !== data.notificationId)
            );
            showToast("Notification deleted", "success");
        };

        const handleReadNotificationsDeleted = (data) => {
            console.log("🧹 Read notifications deleted:", data);
            setNotifications(prev =>
                prev.filter(n => !n.isRead)
            );
            showToast(`${data.deletedCount} read notifications deleted`, "success");
        };

        socket.on("newNotification", handleNewNotification);
        socket.on("notificationRead", handleNotificationRead);
        socket.on("allNotificationsRead", handleAllNotificationsRead);
        socket.on("notificationDeleted", handleNotificationDeleted);
        socket.on("readNotificationsDeleted", handleReadNotificationsDeleted);

        return () => {
            socket.off("newNotification", handleNewNotification);
            socket.off("notificationRead", handleNotificationRead);
            socket.off("allNotificationsRead", handleAllNotificationsRead);
            socket.off("notificationDeleted", handleNotificationDeleted);
            socket.off("readNotificationsDeleted", handleReadNotificationsDeleted);
        };
    }, [socket]);

    // Show toast
    const showToast = useCallback((message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Mark as read
    const markAsRead = useCallback(async (id) => {
        try {
            setActionLoading(id);
            await API.put(`/notifications/${id}/read`);
            // Optimistic update
            setNotifications(prev =>
                prev.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                )
            );
            showToast("Notification marked as read", "success");
        } catch (error) {
            console.error("❌ Mark as read error:", error);
            showToast("Failed to mark as read", "error");
            await fetchNotifications();
        } finally {
            setActionLoading(null);
        }
    }, [fetchNotifications, showToast]);

    // Mark all read
    const markAllRead = useCallback(async () => {
        const unreadNotifications = notifications.filter((n) => !n.isRead);
        if (unreadNotifications.length === 0) {
            showToast("No unread notifications", "info");
            return;
        }

        try {
            setActionLoading("all");
            await API.put("/notifications/mark-all-read");
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            showToast("All notifications marked as read", "success");
        } catch (error) {
            console.error("❌ Mark all read error:", error);
            showToast("Failed to mark all as read", "error");
            await fetchNotifications();
        } finally {
            setActionLoading(null);
        }
    }, [notifications, fetchNotifications, showToast]);

    // Delete notification
    const deleteNotification = useCallback(async (id) => {
        try {
            setActionLoading(id);
            await API.delete(`/notifications/${id}`);
            // Optimistic update
            setNotifications(prev =>
                prev.filter(n => n._id !== id)
            );
            showToast("Notification deleted", "success");
        } catch (error) {
            console.error("❌ Delete notification error:", error);
            showToast("Failed to delete notification", "error");
            await fetchNotifications();
        } finally {
            setActionLoading(null);
        }
    }, [fetchNotifications, showToast]);

    // Delete all read
    const deleteAllRead = useCallback(async () => {
        const readNotifications = notifications.filter((n) => n.isRead);
        if (readNotifications.length === 0) {
            showToast("No read notifications to delete", "info");
            return;
        }

        if (window.confirm(`Delete ${readNotifications.length} read notification(s)?`)) {
            try {
                setActionLoading("delete-read");
                await API.delete("/notifications/delete-read");
                // Optimistic update
                setNotifications(prev =>
                    prev.filter(n => !n.isRead)
                );
                showToast(`${readNotifications.length} read notifications deleted`, "success");
            } catch (error) {
                console.error("❌ Delete all read error:", error);
                showToast("Failed to delete read notifications", "error");
                await fetchNotifications();
            } finally {
                setActionLoading(null);
            }
        }
    }, [notifications, fetchNotifications, showToast]);

    // Get type badge with enhanced styling
    const getTypeBadge = useCallback((type) => {
        const typeMap = {
            UPLOAD: { label: "📤 Upload", color: "bg-blue-50 text-blue-700 border-blue-200" },
            DOWNLOAD: { label: "📥 Download", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            BOOKMARK: { label: "🔖 Bookmark", color: "bg-violet-50 text-violet-700 border-violet-200" },
            LIKE: { label: "❤️ Like", color: "bg-red-50 text-red-700 border-red-200" },
            REPORT: { label: "🚨 Report", color: "bg-orange-50 text-orange-700 border-orange-200" },
            REPORT_REVIEWED: { label: "✅ Reviewed", color: "bg-purple-50 text-purple-700 border-purple-200" },
            ADMIN: { label: "🛡️ Admin", color: "bg-slate-50 text-slate-700 border-slate-200" },
            GENERAL: { label: "📌 General", color: "bg-gray-50 text-gray-700 border-gray-200" }
        };
        return typeMap[type] || typeMap.GENERAL;
    }, []);

    // Get time ago
    const timeAgo = useCallback((date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, []);

    // Filter and sort notifications
    const filteredAndSortedNotifications = useMemo(() => {
        let filtered = notifications;

        if (filter === "unread") {
            filtered = filtered.filter(n => !n.isRead);
        } else if (filter === "read") {
            filtered = filtered.filter(n => n.isRead);
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(search) ||
                n.message.toLowerCase().includes(search)
            );
        }

        filtered.sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });

        return filtered;
    }, [notifications, filter, searchTerm, sortBy]);

    // Statistics
    const statistics = useMemo(() => {
        const total = notifications.length;
        const unread = notifications.filter(n => !n.isRead).length;
        const read = notifications.filter(n => n.isRead).length;
        const today = notifications.filter(n => {
            const todayDate = new Date();
            const notifDate = new Date(n.createdAt);
            return notifDate.toDateString() === todayDate.toDateString();
        }).length;
        return { total, unread, read, today };
    }, [notifications]);

    // Loading skeleton with shimmer
    const LoadingSkeleton = useCallback(() => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                        <div className="flex justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                    <div className="flex-1">
                                        <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    </div>
                                </div>
                                <div className="h-3 bg-slate-200 rounded w-32"></div>
                            </div>
                            <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    ), []);

    // Empty state with animation
    const EmptyState = useCallback(() => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-20 text-center"
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
                className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6"
            >
                <span className="text-5xl">🎉</span>
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? "No matching notifications" : "No Notifications"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {searchTerm
                    ? "Try adjusting your search terms."
                    : "You're all caught up. We'll notify you when there's something new."}
            </p>
        </motion.div>
    ), [searchTerm]);

    // Stat cards data
    const statCards = [
        { label: "Total", value: statistics.total, icon: "📬", color: "indigo" },
        { label: "Unread", value: statistics.unread, icon: "🔴", color: "red" },
        { label: "Read", value: statistics.read, icon: "✅", color: "emerald" },
        { label: "Today", value: statistics.today, icon: "📅", color: "violet" }
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <UserSidebar />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* Header Section */}
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
                                Activity
                            </motion.span>
                            {!loading && statistics.unread > 0 && (
                                <motion.span
                                    {...pulseBadge}
                                    animate="animate"
                                    className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm shadow-red-200"
                                >
                                    {statistics.unread} new
                                </motion.span>
                            )}
                            {isConnected && (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Live
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
                                    Notifications
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-slate-500 mt-1.5"
                                >
                                    Stay updated with your activity and important updates.
                                </motion.p>
                            </div>
                            {!loading && notifications.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex gap-2 flex-wrap"
                                >
                                    {statistics.read > 0 && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={deleteAllRead}
                                            disabled={actionLoading === "delete-read"}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                                <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M12 4v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4h8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {actionLoading === "delete-read" ? "Deleting..." : "Clear Read"}
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={markAllRead}
                                        disabled={actionLoading === "all" || statistics.unread === 0}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-indigo-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                </motion.div>
                            )}
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

                    {/* Statistics Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-xl transition-all duration-300 cursor-pointer"
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

                    {/* Search and Filter Bar */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-4 mb-8"
                    >
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 16 16" fill="none">
                                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                {searchTerm && (
                                    <motion.button
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        ✕
                                    </motion.button>
                                )}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-100"
                                >
                                    <option value="all">📋 All</option>
                                    <option value="unread">🔴 Unread</option>
                                    <option value="read">✅ Read</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-100"
                                >
                                    <option value="newest">🆕 Newest</option>
                                    <option value="oldest">📅 Oldest</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications List */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSkeleton key="loading" />
                        ) : filteredAndSortedNotifications.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <motion.div
                                key="notifications"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {filteredAndSortedNotifications.map((notification, index) => {
                                    const typeBadge = getTypeBadge(notification.type);
                                    return (
                                        <motion.div
                                            key={notification._id}
                                            variants={fadeInUp}
                                            custom={index}
                                            layout
                                            whileHover={{
                                                y: -4,
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
                                                                    {typeBadge.label}
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
                                                            <div className="flex items-center gap-4 mt-3">
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                                                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                                    </svg>
                                                                    {timeAgo(notification.createdAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                                                    {!notification.isRead && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => markAsRead(notification._id)}
                                                            disabled={actionLoading === notification._id}
                                                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-indigo-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => deleteNotification(notification._id)}
                                                        disabled={actionLoading === notification._id}
                                                        className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                                        title="Delete notification"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                                            <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M12 4v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4h8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer note */}
                    {!loading && filteredAndSortedNotifications.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Showing {filteredAndSortedNotifications.length} of {notifications.length} notifications
                                {searchTerm && ` matching "${searchTerm}"`}
                                {filter !== "all" && ` • ${filter}`}
                            </p>
                        </motion.div>
                    )}

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-10 text-center"
                    >
                        <p className="text-xs text-slate-400">
                            NotesSaver • Notifications • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Notifications;