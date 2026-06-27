import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../Components/AdminSidebar";
import API from "../Services/api";

// Enhanced animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            delay: i * 0.05,
            ease: [0.22, 1, 0.36, 1]
        }
    })
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1
        }
    }
};

// Mobile menu button component
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

// Loading skeleton component - B&W Theme
const NotificationSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 overflow-hidden">
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full animate-shimmer"></div>
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <div className="h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </div>
                    <div className="h-3.5 bg-gray-200 rounded w-full max-w-md"></div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="h-3 bg-gray-200 rounded w-16 sm:w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-20 sm:w-24"></div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="h-8 bg-gray-200 rounded-lg w-8"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-8"></div>
                </div>
            </div>
        </div>
    </div>
);

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteAllType, setDeleteAllType] = useState(null);
    const [expandedMessages, setExpandedMessages] = useState({});
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const ITEMS_PER_PAGE = 10;

    // EXACT SAME fetchNotifications - NO CHANGES
    const fetchNotifications = useCallback(async () => {
        try {
            setError(null);
            const res = await API.get("/notifications");
            const sorted = (res.data.notifications || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setNotifications(sorted);
        } catch (error) {
            console.error("FETCH NOTIFICATIONS ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    // EXACT SAME useEffect - NO CHANGES
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // EXACT SAME useEffect for pagination reset - NO CHANGES
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

    // EXACT SAME markAsRead - NO CHANGES
    const markAsRead = useCallback(async (id) => {
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
    }, [fetchNotifications]);

    // EXACT SAME markAsUnread - NO CHANGES
    const markAsUnread = useCallback(async (id) => {
        try {
            setActionLoading(id);
            await API.put(`/notifications/${id}/unread`);
            await fetchNotifications();
        } catch (error) {
            console.error("MARK UNREAD ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to mark notification as unread");
        } finally {
            setActionLoading(null);
        }
    }, [fetchNotifications]);

    // EXACT SAME deleteNotification - NO CHANGES
    const deleteNotification = useCallback(async (id) => {
        if (!window.confirm("Are you sure you want to delete this notification?")) return;
        try {
            setActionLoading(id);
            await API.delete(`/notifications/${id}`);
            await fetchNotifications();
        } catch (error) {
            console.error("DELETE ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to delete notification");
        } finally {
            setActionLoading(null);
        }
    }, [fetchNotifications]);

    // EXACT SAME deleteAllRead - NO CHANGES
    const deleteAllRead = useCallback(async () => {
        setDeleteAllType('read');
        setShowDeleteModal(true);
    }, []);

    // EXACT SAME deleteAllNotifications - NO CHANGES
    const deleteAllNotifications = useCallback(async () => {
        setDeleteAllType('all');
        setShowDeleteModal(true);
    }, []);

    // EXACT SAME confirmDeleteAll - NO CHANGES
    const confirmDeleteAll = useCallback(async () => {
        try {
            setActionLoading('delete-all');
            if (deleteAllType === 'read') {
                await API.delete('/notifications/delete-read');
            } else {
                await API.delete('/notifications/delete-all');
            }
            await fetchNotifications();
            setShowDeleteModal(false);
            setDeleteAllType(null);
        } catch (error) {
            console.error("DELETE ALL ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to delete notifications");
        } finally {
            setActionLoading(null);
        }
    }, [deleteAllType, fetchNotifications]);

    // EXACT SAME markAllRead - NO CHANGES
    const markAllRead = useCallback(async () => {
        const unread = notifications.filter(n => !n.isRead);
        if (unread.length === 0) return;

        try {
            setActionLoading("all-read");
            await API.put("/notifications/mark-all-read");
            await fetchNotifications();
        } catch (error) {
            console.error("MARK ALL READ ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to mark all as read");
        } finally {
            setActionLoading(null);
        }
    }, [notifications, fetchNotifications]);

    // EXACT SAME toggleMessageExpand - NO CHANGES
    const toggleMessageExpand = useCallback((id) => {
        setExpandedMessages(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }, []);

    // EXACT SAME getTypeBadge - NO CHANGES
    const getTypeBadge = useCallback((type) => {
        const typeMap = {
            UPLOAD: { label: "Upload", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "📤" },
            DOWNLOAD: { label: "Download", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "📥" },
            BOOKMARK: { label: "Bookmark", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "🔖" },
            LIKE: { label: "Like", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "❤️" },
            REPORT: { label: "Report", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "🚨" },
            REPORT_REVIEWED: { label: "Reviewed", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "✅" },
            ADMIN: { label: "Admin", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "🛡️" },
            GENERAL: { label: "General", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "📌" }
        };
        return typeMap[type] || typeMap.GENERAL;
    }, []);

    // EXACT SAME filteredNotifications - NO CHANGES
    const filteredNotifications = useMemo(() => {
        let result = notifications;

        if (filter === "unread") {
            result = result.filter(n => !n.isRead);
        } else if (filter === "read") {
            result = result.filter(n => n.isRead);
        } else if (filter !== "all") {
            result = result.filter(n => n.type === filter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(n =>
                n.title?.toLowerCase().includes(query) ||
                n.message?.toLowerCase().includes(query) ||
                n.type?.toLowerCase().includes(query) ||
                n.user?.name?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [notifications, filter, searchQuery]);

    // EXACT SAME paginatedNotifications - NO CHANGES
    const paginatedNotifications = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredNotifications.slice(start, end);
    }, [filteredNotifications, currentPage]);

    const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);

    // EXACT SAME statistics - NO CHANGES
    const totalCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

    // EXACT SAME uniqueTypes - NO CHANGES
    const uniqueTypes = useMemo(() => {
        const types = new Set(notifications.map(n => n.type));
        return Array.from(types);
    }, [notifications]);

    // Pagination controls - ENHANCED B&W
    const PaginationControls = () => (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Showing <span className="font-medium text-gray-700">{Math.min(filteredNotifications.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> -{" "}
                <span className="font-medium text-gray-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)}</span> of{" "}
                <span className="font-medium text-gray-700">{filteredNotifications.length}</span> notifications
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = currentPage - 2 + i;
                    }
                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                                ? "bg-gray-800 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );

    // Delete Confirmation Modal - B&W Theme
    const DeleteConfirmationModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl sm:text-2xl">⚠️</span>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            {deleteAllType === 'read' ? 'Delete All Read Notifications?' : 'Delete All Notifications?'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                            {deleteAllType === 'read'
                                ? `This will permanently delete ${readCount} read notifications.`
                                : `This will permanently delete all ${totalCount} notifications.`}
                        </p>
                    </div>
                </div>
                <p className="text-xs sm:text-sm text-red-600 mb-4 sm:mb-6">
                    This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDeleteAll}
                        disabled={actionLoading === 'delete-all'}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {actionLoading === 'delete-all' ? 'Deleting...' : 'Delete All'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );

    // Empty state - B&W Theme
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center"
        >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl">🔔</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                {filter !== "all" || searchQuery ? "No matching notifications" : "No Notifications"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {filter !== "all" || searchQuery
                    ? "Try adjusting your filters or search query."
                    : "Notifications will appear here when there's activity."}
            </p>
        </motion.div>
    );

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
                <AdminSidebar />
            </motion.div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                    {/* Mobile Menu Button */}
                    <MobileMenuButton
                        showSidebar={showMobileSidebar}
                        setShowSidebar={setShowMobileSidebar}
                    />

                    {/* Header with Stats - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-6 sm:mb-8 mt-12 lg:mt-0"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
                                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                        Admin
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage all platform notifications</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-200">
                                    Total: {totalCount}
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-amber-200">
                                    Unread: {unreadCount}
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-200">
                                    Read: {readCount}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sticky Action Bar - B&W Theme */}
                    <div className="sticky top-0 z-10 bg-gray-50 pt-2 pb-4 -mt-2">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="flex-1 min-w-[180px] sm:min-w-[200px]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search notifications..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-10 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                    />
                                    <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filter Dropdown & Actions */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                >
                                    <option value="all">All</option>
                                    <option value="unread">Unread</option>
                                    <option value="read">Read</option>
                                    {uniqueTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.charAt(0) + type.slice(1).toLowerCase()}
                                        </option>
                                    ))}
                                </select>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-1">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            disabled={actionLoading === 'all-read'}
                                            className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === 'all-read' ? '...' : 'Mark All Read'}
                                        </button>
                                    )}
                                    {readCount > 0 && (
                                        <button>

                                        </button>
                                    )}
                                    {totalCount > 0 && (
                                        <button
                                            onClick={deleteAllNotifications}
                                            className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                        >
                                            Delete All
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message - B&W Theme */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-xs sm:text-sm"
                            >
                                <span className="flex-shrink-0">⚠️</span>
                                <span className="flex-1">{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Notifications List - B&W Theme */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-2.5 sm:space-y-3"
                            >
                                {[...Array(5)].map((_, i) => (
                                    <NotificationSkeleton key={i} />
                                ))}
                            </motion.div>
                        ) : filteredNotifications.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <>
                                <motion.div
                                    key="notifications"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-2 sm:space-y-2.5"
                                >
                                    {paginatedNotifications.map((notification, index) => {
                                        const typeBadge = getTypeBadge(notification.type);
                                        const isExpanded = expandedMessages[notification._id] || false;
                                        const message = notification.message || '';
                                        const shouldTruncate = message.length > 100;
                                        const displayMessage = isExpanded ? message : message.slice(0, 100);
                                        const timeAgo = new Date(notification.createdAt).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });

                                        return (
                                            <motion.div
                                                key={notification._id}
                                                variants={fadeInUp}
                                                custom={index}
                                                className={`group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${notification.isRead
                                                    ? 'border-gray-200'
                                                    : 'border-gray-300 shadow-[0_1px_4px_0_rgba(0,0,0,0.08)]'
                                                    }`}
                                            >
                                                {/* Unread indicator */}
                                                {!notification.isRead && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-700 rounded-l-xl" />
                                                )}

                                                <div className="p-3 sm:p-4">
                                                    <div className="flex items-start gap-2.5 sm:gap-3">
                                                        {/* Icon */}
                                                        <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base sm:text-lg mt-0.5">
                                                            {typeBadge.icon}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-0.5">
                                                                <h4 className={`text-xs sm:text-sm font-semibold ${!notification.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
                                                                    {notification.title || 'Notification'}
                                                                </h4>
                                                                <span className={`text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full border ${typeBadge.color}`}>
                                                                    {typeBadge.label}
                                                                </span>
                                                                {!notification.isRead && (
                                                                    <span className="text-[10px] font-medium text-white bg-gray-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Message with Read More */}
                                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                                {displayMessage}
                                                                {shouldTruncate && !isExpanded && (
                                                                    <button
                                                                        onClick={() => toggleMessageExpand(notification._id)}
                                                                        className="text-gray-700 hover:text-gray-900 font-medium ml-1 text-[10px] sm:text-xs"
                                                                    >
                                                                        Read More
                                                                    </button>
                                                                )}
                                                                {isExpanded && (
                                                                    <button
                                                                        onClick={() => toggleMessageExpand(notification._id)}
                                                                        className="text-gray-700 hover:text-gray-900 font-medium ml-1 text-[10px] sm:text-xs"
                                                                    >
                                                                        Show Less
                                                                    </button>
                                                                )}
                                                            </p>

                                                            {/* Meta info */}
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                                                <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                                                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 16 16" fill="none">
                                                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                                    </svg>
                                                                    {timeAgo}
                                                                </span>
                                                                <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                                                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 16 16" fill="none">
                                                                        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                                                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                                                    </svg>
                                                                    {notification.user?.name || 'System'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1 flex-shrink-0 ml-1 sm:ml-2">
                                                            {notification.isRead ? (
                                                                <button
                                                                    onClick={() => markAsUnread(notification._id)}
                                                                    disabled={actionLoading === notification._id}
                                                                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                                                    title="Mark as unread"
                                                                >
                                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => markAsRead(notification._id)}
                                                                    disabled={actionLoading === notification._id}
                                                                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                                                    title="Mark as read"
                                                                >
                                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notification._id)}
                                                                disabled={actionLoading === notification._id}
                                                                className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                            {actionLoading === notification._id && (
                                                                <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-4 sm:mt-6">
                                        <PaginationControls />
                                    </div>
                                )}
                            </>
                        )}
                    </AnimatePresence>

                    {/* Delete Confirmation Modal */}
                    <AnimatePresence>
                        {showDeleteModal && <DeleteConfirmationModal />}
                    </AnimatePresence>

                    {/* Footer - B&W Theme */}
                    {!loading && filteredNotifications.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-center"
                        >
                            <p className="text-[10px] sm:text-xs text-gray-400">
                                Showing {paginatedNotifications.length} of {filteredNotifications.length} notifications
                                {filter !== "all" && ` • ${filter}`}
                                {searchQuery && ` • "${searchQuery}"`}
                            </p>
                        </motion.div>
                    )}

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 sm:mt-10 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            NotesSaver • Notifications Management • {new Date().getFullYear()}
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

export default AdminNotifications;