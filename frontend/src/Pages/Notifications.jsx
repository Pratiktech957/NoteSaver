import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
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

// Mobile menu button component - B&W Theme
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

// Enhanced Toast component - B&W Theme
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
            className={`fixed top-4 right-4 z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border shadow-lg max-w-[calc(100vw-2rem)] sm:max-w-sm mx-4 sm:mx-0 ${bgColor[type] || bgColor.info}`}
        >
            <div className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{iconMap[type] || "ℹ️"}</span>
                <p className="text-xs sm:text-sm font-medium flex-1">{message}</p>
                <button
                    onClick={onClose}
                    className="ml-auto text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
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
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME user from localStorage - NO CHANGES
    const user = useMemo(() => {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }, []);

    // EXACT SAME Socket.IO connection - NO CHANGES
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

    // EXACT SAME fetchNotifications - NO CHANGES
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

    // EXACT SAME Socket event listeners - NO CHANGES
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

    // EXACT SAME showToast - NO CHANGES
    const showToast = useCallback((message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // EXACT SAME markAsRead - NO CHANGES
    const markAsRead = useCallback(async (id) => {
        try {
            setActionLoading(id);
            await API.put(`/notifications/${id}/read`);
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

    // EXACT SAME markAllRead - NO CHANGES
    const markAllRead = useCallback(async () => {
        const unreadNotifications = notifications.filter((n) => !n.isRead);
        if (unreadNotifications.length === 0) {
            showToast("No unread notifications", "info");
            return;
        }

        try {
            setActionLoading("all");
            await API.put("/notifications/mark-all-read");
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

    // EXACT SAME deleteNotification - NO CHANGES
    const deleteNotification = useCallback(async (id) => {
        try {
            setActionLoading(id);
            await API.delete(`/notifications/${id}`);
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

    // REMOVED: deleteAllRead and deleteAllNotifications functions

    // EXACT SAME getTypeBadge - NO CHANGES (B&W Theme)
    const getTypeBadge = useCallback((type) => {
        const typeMap = {
            UPLOAD: { label: "📤 Upload", color: "bg-gray-100 text-gray-700 border-gray-200" },
            DOWNLOAD: { label: "📥 Download", color: "bg-gray-100 text-gray-700 border-gray-200" },
            BOOKMARK: { label: "🔖 Bookmark", color: "bg-gray-100 text-gray-700 border-gray-200" },
            LIKE: { label: "❤️ Like", color: "bg-gray-100 text-gray-700 border-gray-200" },
            REPORT: { label: "🚨 Report", color: "bg-gray-100 text-gray-700 border-gray-200" },
            REPORT_REVIEWED: { label: "✅ Reviewed", color: "bg-gray-100 text-gray-700 border-gray-200" },
            ADMIN: { label: "🛡️ Admin", color: "bg-gray-100 text-gray-700 border-gray-200" },
            GENERAL: { label: "📌 General", color: "bg-gray-100 text-gray-700 border-gray-200" }
        };
        return typeMap[type] || typeMap.GENERAL;
    }, []);

    // EXACT SAME timeAgo - NO CHANGES
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

    // EXACT SAME filter and sort - NO CHANGES
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

    // EXACT SAME statistics - NO CHANGES
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

    // Enhanced Loading Skeleton - B&W Theme
    const LoadingSkeleton = useCallback(() => (
        <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                            <div className="flex-1">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <div className="h-5 bg-gray-200 rounded w-2/3 sm:w-3/4"></div>
                                            <div className="h-5 bg-gray-200 rounded w-16"></div>
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24 mt-2"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                                <div className="h-10 bg-gray-200 rounded-xl w-24 sm:w-28"></div>
                                <div className="h-10 bg-gray-200 rounded-xl w-12 sm:w-14"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    ), []);

    // Enhanced Empty State - B&W Theme
    const EmptyState = useCallback(() => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
            }}
            className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm p-8 sm:p-20 text-center"
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
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
                <span className="text-4xl sm:text-5xl">🎉</span>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? "No matching notifications" : "No Notifications"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {searchTerm
                    ? "Try adjusting your search terms."
                    : "You're all caught up. We'll notify you when there's something new."}
            </p>
        </motion.div>
    ), [searchTerm]);

    // Stat cards data - B&W Theme
    const statCards = [
        { label: "Total", value: statistics.total, icon: "📬" },
        { label: "Unread", value: statistics.unread, icon: "🔴" },
        { label: "Read", value: statistics.read, icon: "✅" },
        { label: "Today", value: statistics.today, icon: "📅" }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 relative">
            {/* Mobile Sidebar Overlay */}
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

            {/* Mobile Sidebar */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: showMobileSidebar ? 0 : -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-2xl"
            >
                <UserSidebar />
            </motion.div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <UserSidebar />
            </div>

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

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                    {/* Mobile Menu Button */}
                    <MobileMenuButton
                        showSidebar={showMobileSidebar}
                        setShowSidebar={setShowMobileSidebar}
                    />

                    {/* Header Section - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-6 sm:mb-8 mt-12 lg:mt-0"
                    >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                            >
                                Activity
                            </motion.span>
                            {!loading && statistics.unread > 0 && (
                                <motion.span
                                    {...pulseBadge}
                                    animate="animate"
                                    className="text-[10px] sm:text-xs font-medium text-white bg-red-500 px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm shadow-red-200"
                                >
                                    {statistics.unread} new
                                </motion.span>
                            )}
                            {isConnected && (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="hidden xs:inline">Live</span>
                                    <span className="xs:hidden">●</span>
                                </motion.span>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <motion.h1
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight"
                                >
                                    Notifications
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xs sm:text-sm text-gray-500 mt-1.5"
                                >
                                    Stay updated with your activity and important updates.
                                </motion.p>
                            </div>
                            {!loading && notifications.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-wrap gap-2"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={markAllRead}
                                        disabled={actionLoading === "all" || statistics.unread === 0}
                                        className="flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-[10px] sm:text-sm font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex"
                                    >
                                        {actionLoading === "all" ? (
                                            <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                                <path d="M14 4L6 12L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        <span className="hidden xs:inline">Mark All Read</span>
                                        <span className="xs:hidden">Mark All</span>
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Error Message - B&W Theme */}
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

                    {/* Statistics Cards - B&W Theme */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
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
                                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">
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
                                            className="text-lg sm:text-2xl font-bold mt-1 text-gray-800 truncate"
                                        >
                                            {loading ? "..." : stat.value}
                                        </motion.p>
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                    >
                                        <span className="text-base sm:text-lg">{stat.icon}</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Search and Filter Bar - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-6 sm:mb-8"
                    >
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
                                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                />
                                {searchTerm && (
                                    <motion.button
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        ✕
                                    </motion.button>
                                )}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer hover:bg-gray-100"
                                >
                                    <option value="all">📋 All</option>
                                    <option value="unread">🔴 Unread</option>
                                    <option value="read">✅ Read</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer hover:bg-gray-100"
                                >
                                    <option value="newest">🆕 Newest</option>
                                    <option value="oldest">📅 Oldest</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications List - B&W Theme */}
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
                                className="space-y-3 sm:space-y-4"
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
                                            className={`relative overflow-hidden bg-white rounded-xl sm:rounded-2xl border ${notification.isRead
                                                ? "border-gray-200"
                                                : "border-gray-300 shadow-[0_1px_8px_0_rgba(0,0,0,0.08)]"
                                                } shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${!notification.isRead && "bg-gradient-to-r from-gray-50/30 to-white"
                                                }`}
                                        >
                                            {/* Unread indicator bar */}
                                            {!notification.isRead && (
                                                <motion.div
                                                    className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-600 to-gray-800"
                                                    initial={{ scaleY: 0 }}
                                                    animate={{ scaleY: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            )}

                                            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <motion.div
                                                            className="flex-shrink-0 mt-0.5"
                                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                                        >
                                                            <span className="text-base sm:text-xl">
                                                                {notification.isRead ? "✅" : "🔔"}
                                                            </span>
                                                        </motion.div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                                                                <h3 className={`text-xs sm:text-sm font-semibold ${!notification.isRead
                                                                    ? "text-gray-800"
                                                                    : "text-gray-900"
                                                                    }`}>
                                                                    {notification.title}
                                                                </h3>
                                                                <motion.span
                                                                    whileHover={{ scale: 1.05 }}
                                                                    className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded-full border ${typeBadge.color} truncate max-w-[80px] sm:max-w-none`}
                                                                >
                                                                    {typeBadge.label}
                                                                </motion.span>
                                                                {!notification.isRead && (
                                                                    <motion.span
                                                                        {...pulseBadge}
                                                                        animate="animate"
                                                                        className="text-[10px] sm:text-xs font-medium text-white bg-red-500 px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm shadow-red-200"
                                                                    >
                                                                        New
                                                                    </motion.span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">
                                                                {notification.message}
                                                            </p>
                                                            <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                                                                <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                                                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 16 16" fill="none">
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
                                                            className="flex-1 sm:flex-none px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-[10px] sm:text-sm font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                                                        >
                                                            {actionLoading === notification._id ? (
                                                                <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                                </svg>
                                                            ) : (
                                                                <><span className="hidden xs:inline">Mark Read</span><span className="xs:hidden">Read</span></>
                                                            )}
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => deleteNotification(notification._id)}
                                                        disabled={actionLoading === notification._id}
                                                        className="px-2 sm:px-4 py-1.5 sm:py-2.5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl text-xs sm:text-sm font-medium transition-all disabled:opacity-50 inline-flex items-center justify-center"
                                                        title="Delete notification"
                                                    >
                                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
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

                    {/* Footer note - B&W Theme */}
                    {!loading && filteredAndSortedNotifications.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-[10px] sm:text-xs text-gray-400">
                                Showing {filteredAndSortedNotifications.length} of {notifications.length} notifications
                                {searchTerm && ` matching "${searchTerm}"`}
                                {filter !== "all" && ` • ${filter}`}
                            </p>
                        </motion.div>
                    )}

                    {/* Footer - B&W Theme */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 sm:mt-10 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            NotesSaver • Notifications • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>

            {/* Shimmer animation styles */}
            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(200%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                @media (max-width: 375px) {
                    .xs\\:inline {
                        display: inline;
                    }
                    .xs\\:hidden {
                        display: none;
                    }
                }
                @media (min-width: 376px) {
                    .xs\\:inline {
                        display: inline;
                    }
                    .xs\\:hidden {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default Notifications;