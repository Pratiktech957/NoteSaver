import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
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

// Toast notification component
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

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl border shadow-lg max-w-sm ${bgColor[type] || bgColor.info}`}
        >
            <div className="flex items-center gap-3">
                <span className="text-lg">
                    {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}
                </span>
                <p className="text-sm font-medium">{message}</p>
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

    // Get user from localStorage
    const user = useMemo(() => {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }, []);

    // Connect to Socket.IO
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const newSocket = io("http://localhost:5000", {
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
            console.error("❌ Fetch notifications error:", error);
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
                // Prevent duplicates
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
            // Optimistic update
            setNotifications(prev =>
                prev.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                )
            );
        } catch (error) {
            console.error("❌ Mark as read error:", error);
            showToast("Failed to mark as read", "error");
            fetchNotifications();
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
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error("❌ Mark all read error:", error);
            showToast("Failed to mark all as read", "error");
            fetchNotifications();
        }
    }, [notifications, fetchNotifications, showToast]);

    // Delete notification
    const deleteNotification = useCallback(async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:5000/api/notifications/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // Optimistic update
            setNotifications(prev =>
                prev.filter(n => n._id !== id)
            );
        } catch (error) {
            console.error("❌ Delete notification error:", error);
            showToast("Failed to delete notification", "error");
            fetchNotifications();
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
                const token = localStorage.getItem("token");
                await axios.delete(
                    "http://localhost:5000/api/notifications/delete-read",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                // Optimistic update
                setNotifications(prev =>
                    prev.filter(n => !n.isRead)
                );
            } catch (error) {
                console.error("❌ Delete all read error:", error);
                showToast("Failed to delete read notifications", "error");
                fetchNotifications();
            }
        }
    }, [notifications, fetchNotifications, showToast]);

    // Get type badge
    const getTypeBadge = useCallback((type) => {
        const typeMap = {
            UPLOAD: { label: "Upload", color: "bg-blue-50 text-blue-700" },
            DOWNLOAD: { label: "Download", color: "bg-emerald-50 text-emerald-700" },
            BOOKMARK: { label: "Bookmark", color: "bg-violet-50 text-violet-700" },
            LIKE: { label: "Like", color: "bg-red-50 text-red-700" },
            REPORT: { label: "Report", color: "bg-orange-50 text-orange-700" },
            REPORT_REVIEWED: { label: "Reviewed", color: "bg-purple-50 text-purple-700" },
            ADMIN: { label: "Admin", color: "bg-slate-50 text-slate-700" },
            GENERAL: { label: "General", color: "bg-gray-50 text-gray-700" }
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

        // Apply filter
        if (filter === "unread") {
            filtered = filtered.filter(n => !n.isRead);
        } else if (filter === "read") {
            filtered = filtered.filter(n => n.isRead);
        }

        // Apply search
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(search) ||
                n.message.toLowerCase().includes(search)
            );
        }

        // Apply sorting
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

    // Loading skeleton
    const LoadingSkeleton = useCallback(() => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
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
            ))}
        </div>
    ), []);

    // Empty state
    const EmptyState = useCallback(() => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-20 text-center"
        >
            <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🎉</span>
            </div>
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

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
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
                            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                Activity
                            </span>
                            {!loading && statistics.unread > 0 && (
                                <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">
                                    {statistics.unread} new
                                </span>
                            )}
                            {isConnected && (
                                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    ● Live
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                                    Notifications
                                </h1>
                                <p className="text-sm text-slate-500 mt-1.5">
                                    Stay updated with your activity and important updates.
                                </p>
                            </div>
                            {!loading && notifications.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {statistics.read > 0 && (
                                        <button
                                            onClick={deleteAllRead}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                                <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M12 4v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4h8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Clear Read
                                        </button>
                                    )}
                                    <button
                                        onClick={markAllRead}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-200"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                            <path d="M14 4L6 12L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Mark All Read
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total
                                    </p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                                        {loading ? "..." : statistics.total}
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
                                        {loading ? "..." : statistics.unread}
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
                                        {loading ? "..." : statistics.read}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <span className="text-lg">✅</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Today
                                    </p>
                                    <p className="text-2xl font-bold text-violet-500 mt-1">
                                        {loading ? "..." : statistics.today}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <span className="text-lg">📅</span>
                                </div>
                            </div>
                        </div>
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
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="all">All</option>
                                    <option value="unread">Unread</option>
                                    <option value="read">Read</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
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
                                                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeBadge.color}`}>
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
                                                                    {timeAgo(notification.createdAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-200/50"
                                                        >
                                                            Mark Read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification._id)}
                                                        className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-sm font-medium transition-all"
                                                        title="Delete notification"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                                            <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M12 4v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4h8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
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
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Showing {filteredAndSortedNotifications.length} of {notifications.length} notifications
                                {searchTerm && ` matching "${searchTerm}"`}
                                {filter !== "all" && ` • ${filter}`}
                            </p>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Notifications;