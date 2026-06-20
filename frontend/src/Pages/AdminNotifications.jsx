import { useEffect, useState, useMemo, useCallback } from "react";
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

// Loading skeleton component
const NotificationSkeleton = () => (
    <div className="bg-white rounded-xl border border-slate-200/80 p-3 overflow-hidden">
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer"></div>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                        <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                    </div>
                    <div className="h-3.5 bg-slate-200 rounded w-full max-w-md"></div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="h-3 bg-slate-200 rounded w-20"></div>
                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-8 bg-slate-200 rounded-lg w-16"></div>
                    <div className="h-8 bg-slate-200 rounded-lg w-8"></div>
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
    const [deleteAllType, setDeleteAllType] = useState(null); // 'all' or 'read'
    const [expandedMessages, setExpandedMessages] = useState({});

    const ITEMS_PER_PAGE = 10;

    const fetchNotifications = useCallback(async () => {
        try {
            setError(null);
            const res = await API.get("/notifications");
            // Sort by createdAt descending (newest first)
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

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Reset page when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

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

    const deleteAllRead = useCallback(async () => {
        setDeleteAllType('read');
        setShowDeleteModal(true);
    }, []);

    const deleteAllNotifications = useCallback(async () => {
        setDeleteAllType('all');
        setShowDeleteModal(true);
    }, []);

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

    const toggleMessageExpand = useCallback((id) => {
        setExpandedMessages(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }, []);

    const getTypeBadge = useCallback((type) => {
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
    }, []);

    // Filter and search notifications
    const filteredNotifications = useMemo(() => {
        let result = notifications;

        // Apply type filter
        if (filter === "unread") {
            result = result.filter(n => !n.isRead);
        } else if (filter === "read") {
            result = result.filter(n => n.isRead);
        } else if (filter !== "all") {
            // Type-specific filters (UPLOAD, DOWNLOAD, REPORT, ADMIN)
            result = result.filter(n => n.type === filter);
        }

        // Apply search filter
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

    // Pagination
    const paginatedNotifications = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredNotifications.slice(start, end);
    }, [filteredNotifications, currentPage]);

    const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);

    // Statistics
    const totalCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

    // Get unique notification types for filter dropdown
    const uniqueTypes = useMemo(() => {
        const types = new Set(notifications.map(n => n.type));
        return Array.from(types);
    }, [notifications]);

    // Pagination controls
    const PaginationControls = () => (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200/80 rounded-xl">
            <div className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{Math.min(filteredNotifications.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> -{" "}
                <span className="font-medium text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)}</span> of{" "}
                <span className="font-medium text-slate-700">{filteredNotifications.length}</span> notifications
            </div>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                                ? "bg-indigo-600 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );

    // Delete All Confirmation Modal
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
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {deleteAllType === 'read' ? 'Delete All Read Notifications?' : 'Delete All Notifications?'}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {deleteAllType === 'read'
                                ? `This will permanently delete ${readCount} read notifications.`
                                : `This will permanently delete all ${totalCount} notifications.`}
                        </p>
                    </div>
                </div>
                <p className="text-sm text-red-600 mb-6">
                    This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDeleteAll}
                        disabled={actionLoading === 'delete-all'}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {actionLoading === 'delete-all' ? 'Deleting...' : 'Delete All'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );

    // Empty state
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-12 text-center"
        >
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔔</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {filter !== "all" || searchQuery ? "No matching notifications" : "No Notifications"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {filter !== "all" || searchQuery
                    ? "Try adjusting your filters or search query."
                    : "Notifications will appear here when there's activity."}
            </p>
        </motion.div>
    );

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <AdminSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

                    {/* Header with Stats */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Notifications</h1>
                                <p className="text-sm text-slate-500 mt-0.5">Manage all platform notifications</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80">
                                    Total: {totalCount}
                                </span>
                                <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200/80">
                                    Unread: {unreadCount}
                                </span>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80">
                                    Read: {readCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Action Bar */}
                    <div className="sticky top-0 z-10 bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4] pt-2 pb-4 -mt-2">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search notifications..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filter Dropdown */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            disabled={actionLoading === 'all-read'}
                                            className="px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === 'all-read' ? '...' : 'Mark All Read'}
                                        </button>
                                    )}
                                    {readCount > 0 && (
                                        <button
                                            onClick={deleteAllRead}
                                            className="px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
                                        >
                                            Delete Read
                                        </button>
                                    )}
                                    {totalCount > 0 && (
                                        <button
                                            onClick={deleteAllNotifications}
                                            className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                        >
                                            Delete All
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm"
                            >
                                <span>⚠️</span>
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

                    {/* Notifications List */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-3"
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
                                    className="space-y-2.5"
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
                                                        ? 'border-slate-200/80'
                                                        : 'border-indigo-200/80 shadow-[0_1px_4px_0_rgba(99,102,241,0.08)]'
                                                    }`}
                                            >
                                                {/* Unread indicator */}
                                                {!notification.isRead && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-xl" />
                                                )}

                                                <div className="p-3 sm:p-4">
                                                    <div className="flex items-start gap-3">
                                                        {/* Icon */}
                                                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg mt-0.5">
                                                            {typeBadge.icon}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                                                <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-indigo-700' : 'text-slate-900'}`}>
                                                                    {notification.title || 'Notification'}
                                                                </h4>
                                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeBadge.color}`}>
                                                                    {typeBadge.label}
                                                                </span>
                                                                {!notification.isRead && (
                                                                    <span className="text-[10px] font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Message with Read More */}
                                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                                {displayMessage}
                                                                {shouldTruncate && !isExpanded && (
                                                                    <button
                                                                        onClick={() => toggleMessageExpand(notification._id)}
                                                                        className="text-indigo-600 hover:text-indigo-800 font-medium ml-1 text-xs"
                                                                    >
                                                                        Read More
                                                                    </button>
                                                                )}
                                                                {isExpanded && (
                                                                    <button
                                                                        onClick={() => toggleMessageExpand(notification._id)}
                                                                        className="text-indigo-600 hover:text-indigo-800 font-medium ml-1 text-xs"
                                                                    >
                                                                        Show Less
                                                                    </button>
                                                                )}
                                                            </p>

                                                            {/* Meta info */}
                                                            <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                                                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                                    </svg>
                                                                    {timeAgo}
                                                                </span>
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                                                                        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                                                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                                                    </svg>
                                                                    {notification.user?.name || 'System'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                                            {notification.isRead ? (
                                                                <button
                                                                    onClick={() => markAsUnread(notification._id)}
                                                                    disabled={actionLoading === notification._id}
                                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                                                    title="Mark as unread"
                                                                >
                                                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => markAsRead(notification._id)}
                                                                    disabled={actionLoading === notification._id}
                                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                                                                    title="Mark as read"
                                                                >
                                                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notification._id)}
                                                                disabled={actionLoading === notification._id}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                            {actionLoading === notification._id && (
                                                                <svg className="animate-spin w-4 h-4 text-slate-400" viewBox="0 0 24 24">
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
                                    <div className="mt-6">
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

                    {/* Footer */}
                    {!loading && filteredNotifications.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Showing {paginatedNotifications.length} of {filteredNotifications.length} notifications
                                {filter !== "all" && ` • ${filter}`}
                                {searchQuery && ` • "${searchQuery}"`}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;