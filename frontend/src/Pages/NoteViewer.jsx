import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import UserSidebar from "../components/UserSidebar";

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

const NoteViewer = () => {
    const { id } = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [toast, setToast] = useState(null);

    // Show toast
    const showToast = useCallback((message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Handle download
    const handleDownload = useCallback(async () => {
        if (downloading) return;

        try {
            setDownloading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/api/notes/${id}/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success && response.data.fileUrl) {
                let downloadUrl = response.data.fileUrl;

                // Convert Cloudinary URL to force download
                // Replace /upload/ with /upload/fl_attachment/
                if (downloadUrl.includes('cloudinary.com')) {
                    downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
                }

                // Create download link
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = response.data.title || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Update note state
                setNote(prev => ({
                    ...prev,
                    downloads: (prev?.downloads || 0) + 1
                }));

                showToast("Download started successfully", "success");
            } else {
                showToast("Failed to download file", "error");
            }
        } catch (error) {
            console.error("Download error:", error);
            showToast(
                error.response?.data?.message || "Failed to download file",
                "error"
            );
        } finally {
            setDownloading(false);
        }
    }, [id, downloading, showToast]);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `http://localhost:5000/api/notes/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setNote(res.data.note);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [id]);

    const handleReport = async () => {
        const reason = prompt("Why are you reporting this note?");
        if (!reason) return;

        try {
            setReportLoading(true);
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/api/reports",
                {
                    noteId: note._id,
                    reason
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert("Report submitted successfully");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit report");
        } finally {
            setReportLoading(false);
        }
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <UserSidebar />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="space-y-6">
                        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse"></div>
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 animate-pulse">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="h-10 bg-slate-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-slate-200 rounded w-20"></div>
                                        <div className="h-6 bg-slate-200 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse">
                                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 animate-pulse">
                            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
                            <div className="h-96 bg-slate-200 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Empty state
    const EmptyState = () => (
        <div className="flex items-center justify-center min-h-screen bg-[#F7F8FA]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">📄</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Note Not Found</h2>
                <p className="text-slate-500">The note you're looking for doesn't exist or has been removed.</p>
            </motion.div>
        </div>
    );

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!note) {
        return <EmptyState />;
    }

    const fileType = note.fileType || "";
    const fileUrl = note.fileUrl?.toLowerCase() || "";

    const isPdf = fileType === "application/pdf" || fileUrl.includes(".pdf");
    const isImage = fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
    const isDoc = fileType.includes("wordprocessingml") || fileUrl.includes(".docx");
    const isPpt = fileType.includes("presentationml") || fileUrl.includes(".pptx");

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
    };

    // Get file icon
    const getFileIcon = () => {
        if (isPdf) return "📄";
        if (isImage) return "🖼️";
        if (isDoc) return "📝";
        if (isPpt) return "📊";
        return "📁";
    };

    // Get file type label
    const getFileTypeLabel = () => {
        if (isPdf) return "PDF Document";
        if (isImage) return "Image";
        if (isDoc) return "Word Document";
        if (isPpt) return "PowerPoint Presentation";
        return "File";
    };

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
                <div className="max-w-7xl mx-auto px-6 py-10">

                    {/* Hero Header */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl shadow-xl mb-8"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                        <div className="relative px-8 py-8">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                            <span className="text-base">{getFileIcon()}</span>
                                            <span>{getFileTypeLabel()}</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                                            {note.category?.name || "General"}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                                        {note.title}
                                    </h1>
                                    <p className="text-indigo-200 text-sm">
                                        Subject: {note.subject}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-semibold">
                                                {note.owner?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <span className="text-white/80 text-sm">
                                                {note.owner?.name || "Unknown"}
                                            </span>
                                        </div>
                                        <span className="text-white/40 text-sm">•</span>
                                        <span className="text-white/60 text-sm">
                                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <motion.div
                            variants={fadeInUp}
                            custom={1}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Views</p>
                                <span className="text-xl">👁️</span>
                            </div>
                            <p className="text-2xl font-bold text-indigo-600">{note.views || 0}</p>
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            custom={2}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Downloads</p>
                                <span className="text-xl">⬇️</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{note.downloads || 0}</p>
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            custom={3}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">File Type</p>
                                <span className="text-xl">📋</span>
                            </div>
                            <p className="text-2xl font-bold text-violet-600">{getFileTypeLabel()}</p>
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            custom={4}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">File Size</p>
                                <span className="text-xl">📦</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-600">{formatFileSize(note.fileSize)}</p>
                        </motion.div>
                    </motion.div>

                    {/* File Preview */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={5}
                        className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden mb-8"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 16 16" fill="none">
                                        <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M5 5h6M5 8h4M5 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">File Preview</h2>
                            </div>
                            <span className="text-xs text-slate-400">{getFileTypeLabel()}</span>
                        </div>

                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {previewLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center py-20"
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <svg className="animate-spin w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                            </svg>
                                            <p className="text-sm text-slate-500">Loading preview...</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 min-h-[400px]">
                                {isPdf && (
                                    <iframe
                                        src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                                            note.fileUrl
                                        )}`}
                                        title="PDF Viewer"
                                        width="100%"
                                        height="700"
                                        className="border-0"
                                        onLoad={() => setPreviewLoading(false)}
                                    />
                                )}

                                {isImage && (
                                    <img
                                        src={note.fileUrl}
                                        alt={note.title}
                                        className="w-full object-contain max-h-[700px]"
                                        onLoad={() => setPreviewLoading(false)}
                                    />
                                )}

                                {isDoc && (
                                    <iframe
                                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                            note.fileUrl
                                        )}`}
                                        title="DOCX Viewer"
                                        width="100%"
                                        height="700"
                                        className="border-0"
                                        onLoad={() => setPreviewLoading(false)}
                                    />
                                )}

                                {isPpt && (
                                    <iframe
                                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                            note.fileUrl
                                        )}`}
                                        title="PPTX Viewer"
                                        width="100%"
                                        height="700"
                                        className="border-0"
                                        onLoad={() => setPreviewLoading(false)}
                                    />
                                )}

                                {!isPdf && !isImage && !isDoc && !isPpt && (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                                            <span className="text-5xl">📄</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Preview Not Available</h3>
                                        <p className="text-sm text-slate-500">This file type cannot be previewed in the browser.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Bar */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={6}
                        className="flex flex-wrap gap-4 mb-8"
                    >
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                    </svg>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 10V1M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Download File
                                </>
                            )}
                        </button>

                        <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-slate-200"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4h12M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Open in New Tab
                        </a>

                        <button
                            onClick={handleReport}
                            disabled={reportLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M8 4v4M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            {reportLoading ? "Reporting..." : "Report Note"}
                        </button>
                    </motion.div>

                    {/* Note Details & Activity */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Note Details */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={7}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 3.5h12M2 8h8M2 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Note Details</h2>
                            </div>

                            <div className="px-6 py-5">
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Title</label>
                                            <p className="text-sm font-medium text-slate-800 mt-1">{note.title}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Subject</label>
                                            <p className="text-sm font-medium text-slate-800 mt-1">{note.subject}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Category</label>
                                            <p className="text-sm font-medium text-slate-800 mt-1">{note.category?.name || "General"}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Owner</label>
                                            <p className="text-sm font-medium text-slate-800 mt-1">{note.owner?.name || "Unknown"}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">Upload Date</label>
                                            <p className="text-sm font-medium text-slate-800 mt-1">
                                                {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">File Type</label>
                                            <p className="text-sm font-medium text-slate-800 mt-1">{getFileTypeLabel()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Activity Timeline */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={8}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-violet-600" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Activity</h2>
                            </div>

                            <div className="px-6 py-5">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                <span className="text-lg">📤</span>
                                            </div>
                                            <div className="absolute top-10 left-1/2 w-0.5 h-12 -translate-x-1/2 bg-slate-200"></div>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-sm font-semibold text-slate-800">Uploaded Successfully</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                <span className="text-lg">👁️</span>
                                            </div>
                                            <div className="absolute top-10 left-1/2 w-0.5 h-12 -translate-x-1/2 bg-slate-200"></div>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-sm font-semibold text-slate-800">Viewed {note.views || 0} times</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Total views</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                                <span className="text-lg">⬇️</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-sm font-semibold text-slate-800">Downloaded {note.downloads || 0} times</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Total downloads</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer note */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={9}
                        className="mt-8 text-center"
                    >
                        <p className="text-xs text-slate-400">
                            Note ID: {note._id} • File: {note.fileType || "Unknown"}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default NoteViewer;