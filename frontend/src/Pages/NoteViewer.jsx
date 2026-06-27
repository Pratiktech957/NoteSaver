import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

const cardHover = {
    hover: {
        y: -6,
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1
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

const NoteViewer = () => {
    const { id } = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [toast, setToast] = useState(null);
    const [error, setError] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME showToast - NO CHANGES
    const showToast = useCallback((message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // EXACT SAME handleDownload - NO CHANGES
    const handleDownload = useCallback(async () => {
        if (downloading) return;

        try {
            setDownloading(true);
            const response = await API.get(`/notes/${id}/download`);

            if (response.data.success && response.data.fileUrl) {
                let downloadUrl = response.data.fileUrl;

                if (downloadUrl.includes('cloudinary.com')) {
                    downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
                }

                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = response.data.title || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

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

    // EXACT SAME fetchNote - NO CHANGES
    useEffect(() => {
        const fetchNote = async () => {
            try {
                setError(null);
                const res = await API.get(`/notes/${id}`);
                setNote(res.data.note);
            } catch (error) {
                console.error("FETCH NOTE ERROR:", error.response?.data || error.message);
                setError(error.response?.data?.message || "Failed to fetch note");
                showToast("Failed to load note", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [id, showToast]);

    // EXACT SAME handleReport - NO CHANGES
    const handleReport = async () => {
        const reason = prompt("Why are you reporting this note?");
        if (!reason) return;

        try {
            setReportLoading(true);
            await API.post("/reports", {
                noteId: note._id,
                reason
            });
            showToast("Report submitted successfully", "success");
        } catch (error) {
            console.error("REPORT ERROR:", error);
            showToast(
                error.response?.data?.message || "Failed to submit report",
                "error"
            );
        } finally {
            setReportLoading(false);
        }
    };

    // Enhanced Loading Skeleton - B&W Theme
    const LoadingSkeleton = () => (
        <div className="flex min-h-screen bg-gray-50">
            <UserSidebar />
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3 animate-pulse"></div>
                        <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-200 p-4 sm:p-8 overflow-hidden">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                                    <div className="flex-1">
                                        <div className="h-8 sm:h-10 bg-gray-200 rounded w-3/4 mb-3"></div>
                                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-16 sm:w-20"></div>
                                            <div className="h-5 sm:h-6 bg-gray-200 rounded w-20 sm:w-24"></div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 animate-pulse">
                                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 animate-pulse">
                            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4"></div>
                            <div className="h-64 sm:h-96 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Enhanced Empty State - B&W Theme
    const EmptyState = () => (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                }}
                className="text-center"
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
                    <span className="text-4xl sm:text-5xl">📄</span>
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Note Not Found</h2>
                <p className="text-xs sm:text-sm text-gray-500">The note you're looking for doesn't exist or has been removed.</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.history.back()}
                    className="mt-4 px-5 sm:px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition-all shadow-lg"
                >
                    Go Back
                </motion.button>
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

    // EXACT SAME formatFileSize - NO CHANGES
    const formatFileSize = (bytes) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
    };

    // EXACT SAME getFileIcon - NO CHANGES (B&W Theme)
    const getFileIcon = () => {
        if (isPdf) return { icon: "📄", color: "bg-gray-100 text-gray-700" };
        if (isImage) return { icon: "🖼️", color: "bg-gray-100 text-gray-700" };
        if (isDoc) return { icon: "📝", color: "bg-gray-100 text-gray-700" };
        if (isPpt) return { icon: "📊", color: "bg-gray-100 text-gray-700" };
        return { icon: "📁", color: "bg-gray-100 text-gray-700" };
    };

    // EXACT SAME getFileTypeLabel - NO CHANGES
    const getFileTypeLabel = () => {
        if (isPdf) return "PDF Document";
        if (isImage) return "Image";
        if (isDoc) return "Word Document";
        if (isPpt) return "PowerPoint Presentation";
        return "File";
    };

    const fileIcon = getFileIcon();

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

                    {/* Hero Header - B&W SaaS Style */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl mb-6 sm:mb-8 mt-12 lg:mt-0"
                    >
                        {/* Animated background particles */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute top-0 right-0 w-40 sm:w-48 md:w-64 h-40 sm:h-48 md:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 2
                            }}
                            className="absolute bottom-0 left-0 w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"
                        />

                        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-7 lg:py-8">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className={`inline-flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-white/10 ${fileIcon.color.replace('text-', 'text-white/')}`}
                                        >
                                            <span className="text-sm sm:text-base">{fileIcon.icon}</span>
                                            <span className="hidden xs:inline">{getFileTypeLabel()}</span>
                                            <span className="xs:hidden">{getFileTypeLabel().split(' ')[0]}</span>
                                        </motion.span>
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className="inline-flex items-center gap-1 sm:gap-1.5 bg-emerald-500/20 text-emerald-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-emerald-500/20"
                                        >
                                            {note.category?.icon || "📂"}
                                            <span className="hidden xs:inline">{note.category?.name || "General"}</span>
                                            <span className="xs:hidden">{note.category?.name?.slice(0, 6) || "Gen"}</span>
                                        </motion.span>
                                    </div>
                                    <motion.h1
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-1 sm:mb-2"
                                    >
                                        {note.title}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-gray-300 text-xs sm:text-sm"
                                    >
                                        Subject: {note.subject}
                                    </motion.p>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold"
                                            >
                                                {note.owner?.name?.[0]?.toUpperCase() || "U"}
                                            </motion.div>
                                            <span className="text-white/80 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                                                {note.owner?.name || "Unknown"}
                                            </span>
                                        </div>
                                        <span className="text-white/40 text-[10px] sm:text-sm">•</span>
                                        <span className="text-white/60 text-[10px] sm:text-sm">
                                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards - B&W Theme */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
                    >
                        {[
                            { label: "Views", value: note.views || 0, icon: "👁️" },
                            { label: "Downloads", value: note.downloads || 0, icon: "⬇️" },
                            { label: "File Type", value: getFileTypeLabel(), icon: "📋" },
                            { label: "File Size", value: formatFileSize(note.fileSize), icon: "📦" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index + 1}
                                {...cardHover}
                                whileHover="hover"
                                whileTap="tap"
                                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1 sm:mb-2">
                                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">{stat.label}</p>
                                    <motion.span
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-base sm:text-xl flex-shrink-0"
                                    >
                                        {stat.icon}
                                    </motion.span>
                                </div>
                                <motion.p
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: index * 0.1 + 0.4,
                                        type: "spring",
                                        stiffness: 300
                                    }}
                                    className="text-base sm:text-lg lg:text-2xl font-bold text-gray-800 truncate"
                                >
                                    {stat.value}
                                </motion.p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* File Preview - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={5}
                        className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 mb-6 sm:mb-8"
                    >
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                                        <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M5 5h6M5 8h4M5 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">File Preview</h2>
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full">
                                {getFileTypeLabel()}
                            </span>
                        </div>

                        <div className="p-3 sm:p-4 lg:p-6">
                            <AnimatePresence mode="wait">
                                {previewLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center py-12 sm:py-20"
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <svg className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-gray-600" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                            </svg>
                                            <p className="text-xs sm:text-sm text-gray-500">Loading preview...</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 border border-gray-200/60 min-h-[250px] sm:min-h-[400px]">
                                {isPdf && (
                                    <iframe
                                        src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                                            note.fileUrl
                                        )}`}
                                        title="PDF Viewer"
                                        width="100%"
                                        height="500"
                                        className="border-0 min-h-[400px] sm:min-h-[500px]"
                                        onLoad={() => setPreviewLoading(false)}
                                    />
                                )}

                                {isImage && (
                                    <img
                                        src={note.fileUrl}
                                        alt={note.title}
                                        className="w-full object-contain max-h-[400px] sm:max-h-[700px]"
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
                                        height="500"
                                        className="border-0 min-h-[400px] sm:min-h-[500px]"
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
                                        height="500"
                                        className="border-0 min-h-[400px] sm:min-h-[500px]"
                                        onLoad={() => setPreviewLoading(false)}
                                    />
                                )}

                                {!isPdf && !isImage && !isDoc && !isPpt && (
                                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
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
                                            className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mb-3 sm:mb-4"
                                        >
                                            <span className="text-3xl sm:text-5xl">📄</span>
                                        </motion.div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Preview Not Available</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 text-center">This file type cannot be previewed in the browser.</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleDownload}
                                            className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-lg"
                                        >
                                            Download File
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Bar - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={6}
                        className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex"
                        >
                            {downloading ? (
                                <>
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                    </svg>
                                    <span className="hidden xs:inline">Downloading...</span>
                                    <span className="xs:hidden">DL...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 10V1M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Download File
                                </>
                            )}
                        </motion.button>

                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={note.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-lg inline-flex"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4h12M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="hidden xs:inline">Open in New Tab</span>
                            <span className="xs:hidden">Open</span>
                        </motion.a>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReport}
                            disabled={reportLoading}
                            className="flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition-all disabled:opacity-50 shadow-lg inline-flex"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M8 4v4M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            {reportLoading ? "Reporting..." : "Report Note"}
                        </motion.button>
                    </motion.div>

                    {/* Note Details & Activity - B&W Theme */}
                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Note Details */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={7}
                            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 3.5h12M2 8h8M2 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Note Details</h2>
                            </div>

                            <div className="px-4 sm:px-6 py-4 sm:py-5">
                                <div className="grid gap-3 sm:gap-4">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Title</label>
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 mt-0.5 sm:mt-1 break-words">{note.title}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</label>
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 mt-0.5 sm:mt-1 break-words">{note.subject}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 mt-0.5 sm:mt-1 break-words">{note.category?.name || "General"}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</label>
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 mt-0.5 sm:mt-1 break-words">{note.owner?.name || "Unknown"}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Upload Date</label>
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 mt-0.5 sm:mt-1">
                                                {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">File Type</label>
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 mt-0.5 sm:mt-1">{getFileTypeLabel()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Activity Timeline - B&W Theme */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={8}
                            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Activity</h2>
                            </div>

                            <div className="px-4 sm:px-6 py-4 sm:py-5">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="relative flex-shrink-0">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center"
                                            >
                                                <span className="text-base sm:text-lg">📤</span>
                                            </motion.div>
                                            <div className="absolute top-8 sm:top-10 left-1/2 w-0.5 h-8 sm:h-12 -translate-x-1/2 bg-gray-200"></div>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-800">Uploaded Successfully</p>
                                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                                {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="relative flex-shrink-0">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center"
                                            >
                                                <span className="text-base sm:text-lg">👁️</span>
                                            </motion.div>
                                            <div className="absolute top-8 sm:top-10 left-1/2 w-0.5 h-8 sm:h-12 -translate-x-1/2 bg-gray-200"></div>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-800">Viewed {note.views || 0} times</p>
                                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Total views</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex-shrink-0">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center"
                                            >
                                                <span className="text-base sm:text-lg">⬇️</span>
                                            </motion.div>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-800">Downloaded {note.downloads || 0} times</p>
                                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Total downloads</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer note - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={9}
                        className="mt-6 sm:mt-8 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400 break-all">
                            Note ID: {note._id} • File: {note.fileType || "Unknown"}
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

export default NoteViewer;