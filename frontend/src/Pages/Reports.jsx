import { useEffect, useState } from "react";
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
            staggerChildren: 0.06,
            delayChildren: 0.2
        }
    }
};

// Delete Confirmation Modal
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
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Report?</h3>
                    <p className="text-sm text-slate-500 text-center">
                        Are you sure you want to delete this report for "{reportInfo}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all"
                        >
                            Delete
                        </button>
                    </div>
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

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "http://localhost:5000/api/reports",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setReports(res.data.reports || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("REPORT FETCH ERROR:", error);
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
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5000/api/reports/${id}`,
                { status: "resolved" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchReports();
        } catch (error) {
            console.error(error);
            alert("Failed to resolve report");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!reportToDelete) return;

        try {
            setActionLoading(reportToDelete._id);
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:5000/api/reports/${reportToDelete._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setDeleteModalOpen(false);
            setReportToDelete(null);
            fetchReports();
        } catch (error) {
            console.error(error);
            alert("Failed to delete report");
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

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
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
                <span className="text-5xl">🚨</span>
            </div>
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
                            <span className="text-xs font-semibold uppercase tracking-widest text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                                Admin
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                                    Reports Management
                                </h1>
                                <p className="text-sm text-slate-500 mt-1.5">
                                    Review and manage reported notes • {totalReports} total reports
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm">
                                <span className="font-medium text-slate-700">{totalReports}</span>
                                <span>Reports</span>
                                <span className="w-px h-4 bg-slate-200 mx-2"></span>
                                <span className="text-amber-600">{pendingReports}</span>
                                <span>Pending</span>
                            </div>
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
                                        Total Reports
                                    </p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                                        {loading ? "..." : totalReports}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <span className="text-lg">📊</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Pending
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600 mt-1">
                                        {loading ? "..." : pendingReports}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <span className="text-lg">⏳</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Resolved
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                                        {loading ? "..." : resolvedReports}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <span className="text-lg">✅</span>
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
                                    placeholder="Search by note title, subject, reporter..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="all">All Reports</option>
                                    <option value="pending">Pending</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                                <button
                                    onClick={fetchReports}
                                    className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                        <path d="M14 2v4h-4M2 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    Refresh
                                </button>
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
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-lg">🚨</span>
                                                    </div>
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
                                                        <p className="text-xs text-slate-400">
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
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100">
                                            {report.status !== "resolved" && (
                                                <button
                                                    onClick={() => handleResolve(report._id)}
                                                    disabled={actionLoading === report._id}
                                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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
                                                </button>
                                            )}

                                            <button
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
                                            </button>

                                            {report.note && (
                                                <a
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
                                                </a>
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
                            className="mt-4 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                                <span className="ml-2 inline-flex items-center gap-1.5 text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                    Live
                                </span>
                            </p>
                        </motion.div>
                    )}
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