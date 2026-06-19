import { useEffect, useState } from "react";
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

// Delete Confirmation Modal with enhanced animations
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
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                />
                <div className="p-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1
                        }}
                        className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mx-auto mb-4"
                    >
                        <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </motion.div>
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-slate-900 text-center mb-2"
                    >
                        Delete Report?
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-sm text-slate-500 text-center"
                    >
                        Are you sure you want to delete this report for "<span className="font-medium text-slate-700">{reportInfo}</span>"?
                        This action cannot be undone.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-3 mt-6"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "#dc2626" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all"
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

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 5000);
        return () => clearInterval(interval);
    }, []);

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

    // Filter reports
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

    // Statistics
    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === "pending").length;
    const resolvedReports = reports.filter(r => r.status === "resolved").length;

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
                                <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-32 mb-3"></div>
                                <div className="h-4 bg-slate-200 rounded w-40 mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-56 mb-3"></div>
                                <div className="h-4 bg-slate-200 rounded w-64"></div>
                            </div>
                            <div className="h-8 bg-slate-200 rounded-full w-24"></div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
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
                <span className="text-5xl">🚨</span>
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {search || filter !== "all" ? "No matching reports" : "No Reports Found"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {search || filter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Reports will appear here when users report notes."}
            </p>
        </motion.div>
    );

    // Stat cards data
    const statCards = [
        { label: "Total Reports", value: totalReports, icon: "📊", color: "indigo" },
        { label: "Pending", value: pendingReports, icon: "⏳", color: "amber" },
        { label: "Resolved", value: resolvedReports, icon: "✅", color: "emerald" }
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
                                className="text-xs font-semibold uppercase tracking-widest text-red-500 bg-red-50 px-2.5 py-1 rounded-full"
                            >
                                Admin
                            </motion.span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <motion.h1
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight"
                                >
                                    Reports Management
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-slate-500 mt-1.5"
                                >
                                    Review and manage reported notes • {totalReports} total reports
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm"
                            >
                                <span className="font-medium text-slate-700">{totalReports}</span>
                                <span>Reports</span>
                                <span className="w-px h-4 bg-slate-200 mx-2"></span>
                                <motion.span
                                    {...pulseBadge}
                                    animate="animate"
                                    className="text-amber-600"
                                >
                                    {pendingReports}
                                </motion.span>
                                <span>Pending</span>
                            </motion.div>
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
                                            className={`text-2xl font-bold mt-1 text-${stat.color}-600`}
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
                                    placeholder="Search by note title, subject, reporter..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                {search && (
                                    <motion.button
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        ✕
                                    </motion.button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-100"
                                >
                                    <option value="all">📋 All Reports</option>
                                    <option value="pending">⏳ Pending</option>
                                    <option value="resolved">✅ Resolved</option>
                                </select>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchReports}
                                    className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                        <path d="M14 2v4h-4M2 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    Refresh
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Reports List */}
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
                                className="space-y-4"
                            >
                                {filteredReports.map((report, index) => (
                                    <motion.div
                                        key={report._id}
                                        variants={fadeInUp}
                                        custom={index}
                                        {...cardHover}
                                        whileHover="hover"
                                        className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-xl transition-all duration-300 ${report.status === "pending" ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500"
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                                        className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0"
                                                    >
                                                        <span className="text-lg">🚨</span>
                                                    </motion.div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">
                                                            {report.note?.title || "Unknown Note"}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">
                                                            Subject: {report.note?.subject || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                                    <div>
                                                        <span className="text-xs text-slate-400">Reported By</span>
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {report.reportedBy?.name || "Unknown"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {report.reportedBy?.email || "No email"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-slate-400">Reason</span>
                                                        <p className="text-sm text-slate-700">
                                                            {report.reason || "No reason provided"}
                                                        </p>
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
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

                                            <div className="flex flex-col items-end gap-3">
                                                {report.status === "resolved" ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                        Resolved
                                                    </span>
                                                ) : (
                                                    <motion.span
                                                        {...pulseBadge}
                                                        animate="animate"
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                                        Pending
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100">
                                            {report.status !== "resolved" && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleResolve(report._id)}
                                                    disabled={actionLoading === report._id}
                                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-emerald-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                >
                                                    {actionLoading === report._id ? (
                                                        <>
                                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                            </svg>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
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
                                                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
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
                                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" />
                                                        <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                                    </svg>
                                                    View Note
                                                </motion.a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count */}
                    {!loading && filteredReports.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Showing {filteredReports.length} of {reports.length} reports
                                {search && ` matching "${search}"`}
                                {filter !== "all" && ` • ${filter}`}
                            </p>
                        </motion.div>
                    )}

                    {/* Last updated */}
                    {!loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-4 text-center"
                        >
                            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                    Live
                                </span>
                            </p>
                        </motion.div>
                    )}

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-10 text-center"
                    >
                        <p className="text-xs text-slate-400">
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
        </div>
    );
};

export default Reports;