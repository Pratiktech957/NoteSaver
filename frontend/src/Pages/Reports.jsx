import { useEffect, useState } from "react";
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
            staggerChildren: 0.06,
            delayChildren: 0.2
        }
    }
};

const cardHover = {
    hover: {
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
    }
};

const pulseBadge = {
    animate: {
        scale: [1, 1.1, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
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

// Delete Confirmation Modal - B&W Theme
const DeleteModal = ({ isOpen, onClose, onConfirm, reportInfo }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-700 to-gray-900"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                />
                <div className="p-4 sm:p-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1
                        }}
                        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 mx-auto mb-4"
                    >
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </motion.div>
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2"
                    >
                        Delete Report?
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-xs sm:text-sm text-gray-500 text-center"
                    >
                        Are you sure you want to delete this report for "<span className="font-medium text-gray-700">{reportInfo}</span>"?
                        This action cannot be undone.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-3 mt-6"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "#dc2626" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition-all"
                        >
                            Delete
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [error, setError] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME fetchReports - NO CHANGES
    const fetchReports = async () => {
        try {
            setError(null);
            const res = await API.get("/reports");
            setReports(res.data.reports || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("REPORT FETCH ERROR:", error);
            setError(error.response?.data?.message || "Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    // EXACT SAME useEffect - NO CHANGES
    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 5000);
        return () => clearInterval(interval);
    }, []);

    // EXACT SAME handleResolve - NO CHANGES
    const handleResolve = async (id) => {
        try {
            setActionLoading(id);
            await API.put(`/reports/${id}`, { status: "resolved" });
            await fetchReports();
        } catch (error) {
            console.error("RESOLVE ERROR:", error);
            setError(error.response?.data?.message || "Failed to resolve report");
        } finally {
            setActionLoading(null);
        }
    };

    // EXACT SAME handleDelete - NO CHANGES
    const handleDelete = async () => {
        if (!reportToDelete) return;

        try {
            setActionLoading(reportToDelete._id);
            await API.delete(`/reports/${reportToDelete._id}`);
            setDeleteModalOpen(false);
            setReportToDelete(null);
            await fetchReports();
        } catch (error) {
            console.error("DELETE ERROR:", error);
            setError(error.response?.data?.message || "Failed to delete report");
        } finally {
            setActionLoading(null);
        }
    };

    // EXACT SAME filteredReports - NO CHANGES
    const filteredReports = reports.filter((report) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            report.note?.title?.toLowerCase().includes(searchLower) ||
            report.note?.subject?.toLowerCase().includes(searchLower) ||
            report.reportedBy?.name?.toLowerCase().includes(searchLower) ||
            report.reportedBy?.email?.toLowerCase().includes(searchLower) ||
            report.reason?.toLowerCase().includes(searchLower);

        const matchesFilter = filter === "all" || report.status === filter;
        return matchesSearch && matchesFilter;
    });

    // EXACT SAME statistics - NO CHANGES
    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === "pending").length;
    const resolvedReports = reports.filter(r => r.status === "resolved").length;

    // Loading skeleton with shimmer - B&W Theme
    const LoadingSkeleton = () => (
        <div className="space-y-3 sm:space-y-4">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                                    <div>
                                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
                                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                    <div>
                                        <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                                    </div>
                                    <div>
                                        <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                                        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-6 sm:h-8 bg-gray-200 rounded-full w-20 sm:w-24"></div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-gray-100">
                            <div className="h-9 sm:h-10 bg-gray-200 rounded-xl w-20 sm:w-24"></div>
                            <div className="h-9 sm:h-10 bg-gray-200 rounded-xl w-20 sm:w-24"></div>
                            <div className="h-9 sm:h-10 bg-gray-200 rounded-xl w-20 sm:w-24"></div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // Empty state - B&W Theme
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
            }}
            className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-16 text-center"
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
                <span className="text-4xl sm:text-5xl">🚨</span>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {search || filter !== "all" ? "No matching reports" : "No Reports Found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {search || filter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Reports will appear here when users report notes."}
            </p>
        </motion.div>
    );

    // Stat cards data - B&W Theme
    const statCards = [
        { label: "Total Reports", value: totalReports, icon: "📊" },
        { label: "Pending", value: pendingReports, icon: "⏳" },
        { label: "Resolved", value: resolvedReports, icon: "✅" }
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

                    {/* Header - B&W Theme */}
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
                                Admin
                            </motion.span>
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                            >
                                {totalReports} Reports
                            </motion.span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <motion.h1
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight"
                                >
                                    Reports Management
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xs sm:text-sm text-gray-500 mt-1.5"
                                >
                                    Review and manage reported notes • {totalReports} total reports
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-200 shadow-sm"
                            >
                                <span className="font-medium text-gray-700">{totalReports}</span>
                                <span>Reports</span>
                                <span className="w-px h-3 sm:h-4 bg-gray-200 mx-1 sm:mx-2"></span>
                                <motion.span
                                    {...pulseBadge}
                                    animate="animate"
                                    className="text-amber-600 font-medium"
                                >
                                    {pendingReports}
                                </motion.span>
                                <span>Pending</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Error Message - B&W Theme */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                            >
                                <span className="text-lg flex-shrink-0">⚠️</span>
                                <span className="text-xs sm:text-sm flex-1">{error}</span>
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
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
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
                                            className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1"
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
                                    placeholder="Search by note title, subject, reporter..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                />
                                {search && (
                                    <motion.button
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        ✕
                                    </motion.button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer hover:bg-gray-100"
                                >
                                    <option value="all">📋 All Reports</option>
                                    <option value="pending">⏳ Pending</option>
                                    <option value="resolved">✅ Resolved</option>
                                </select>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchReports}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                        <path d="M14 2v4h-4M2 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    Refresh
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Reports List - B&W Theme */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSkeleton key="loading" />
                        ) : filteredReports.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <motion.div
                                key="reports"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-3 sm:space-y-4"
                            >
                                {filteredReports.map((report, index) => (
                                    <motion.div
                                        key={report._id}
                                        variants={fadeInUp}
                                        custom={index}
                                        {...cardHover}
                                        whileHover="hover"
                                        className={`bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${report.status === "pending"
                                                ? "border-l-4 border-l-amber-500"
                                                : "border-l-4 border-l-emerald-500"
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                                    >
                                                        <span className="text-base sm:text-lg">🚨</span>
                                                    </motion.div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                            {report.note?.title || "Unknown Note"}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                            Subject: {report.note?.subject || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
                                                    <div>
                                                        <span className="text-[10px] sm:text-xs text-gray-400">Reported By</span>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                                            {report.reportedBy?.name || "Unknown"}
                                                        </p>
                                                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                                                            {report.reportedBy?.email || "No email"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] sm:text-xs text-gray-400">Reason</span>
                                                        <p className="text-xs sm:text-sm text-gray-700 break-words">
                                                            {report.reason || "No reason provided"}
                                                        </p>
                                                        <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 16 16" fill="none">
                                                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                                                <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            </svg>
                                                            {new Date(report.createdAt).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0">
                                                {report.status === "resolved" ? (
                                                    <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                        Resolved
                                                    </span>
                                                ) : (
                                                    <motion.span
                                                        {...pulseBadge}
                                                        animate="animate"
                                                        className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-amber-700 bg-amber-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                                        Pending
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                                            {report.status !== "resolved" && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleResolve(report._id)}
                                                    disabled={actionLoading === report._id}
                                                    className="flex-1 sm:flex-none items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-[10px] sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex"
                                                >
                                                    {actionLoading === report._id ? (
                                                        <>
                                                            <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                            </svg>
                                                            <span className="hidden xs:inline">Processing...</span>
                                                            <span className="xs:hidden">...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                                                <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            Resolve
                                                        </>
                                                    )}
                                                </motion.button>
                                            )}

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setReportToDelete(report);
                                                    setDeleteModalOpen(true);
                                                }}
                                                disabled={actionLoading === report._id}
                                                className="flex-1 sm:flex-none items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex"
                                            >
                                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                                    <path d="M2 3.5h12M6 1h4M3.5 3.5L5 14h6l1.5-10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Delete
                                            </motion.button>

                                            {report.note && (
                                                <motion.a
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    href={`/note/${report.note._id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex-1 sm:flex-none items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] sm:text-sm font-medium transition-all inline-flex"
                                                >
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" />
                                                        <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                                    </svg>
                                                    <span className="hidden xs:inline">View Note</span>
                                                    <span className="xs:hidden">Note</span>
                                                </motion.a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count - B&W Theme */}
                    {!loading && filteredReports.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-[10px] sm:text-xs text-gray-400">
                                Showing {filteredReports.length} of {reports.length} reports
                                {search && ` matching "${search}"`}
                                {filter !== "all" && ` • ${filter}`}
                            </p>
                        </motion.div>
                    )}

                    {/* Last updated - B&W Theme */}
                    {!loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-4 text-center"
                        >
                            <p className="text-[10px] sm:text-xs text-gray-400 flex items-center justify-center gap-2">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                    Live
                                </span>
                            </p>
                        </motion.div>
                    )}

                    {/* Footer - B&W Theme */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-8 sm:mt-10 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            NotesSaver • Reports Management • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModalOpen && (
                    <DeleteModal
                        isOpen={deleteModalOpen}
                        onClose={() => {
                            setDeleteModalOpen(false);
                            setReportToDelete(null);
                        }}
                        onConfirm={handleDelete}
                        reportInfo={reportToDelete?.note?.title || "Unknown Note"}
                    />
                )}
            </AnimatePresence>

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

export default Reports;