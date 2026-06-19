import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserSidebar from "../Components/UserSidebar";
import API from "../Services/api";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
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
            delayChildren: 0.2
        }
    }
};

const cardHover = {
    hover: {
        y: -8,
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

const NotesList = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get("category");
    const [categoryName, setCategoryName] = useState("");
    const [downloading, setDownloading] = useState(null);
    const [toast, setToast] = useState(null);
    const [totalDownloads, setTotalDownloads] = useState(0);
    const [error, setError] = useState(null);
    const notesPerPage = 9;

    // Show toast
    const showToast = useCallback((message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Handle download
    const handleDownload = useCallback(async (noteId) => {
        if (downloading === noteId) return;

        try {
            setDownloading(noteId);
            const response = await API.get(`/notes/${noteId}/download`);

            if (response.data.success && response.data.fileUrl) {
                let downloadUrl = response.data.fileUrl;

                // Convert Cloudinary URL to force download
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

                // Update downloads count in state
                setNotes(prevNotes =>
                    prevNotes.map(note =>
                        note._id === noteId
                            ? { ...note, downloads: (note.downloads || 0) + 1 }
                            : note
                    )
                );

                // Update total downloads
                setTotalDownloads(prev => prev + 1);

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
            setDownloading(null);
        }
    }, [downloading, showToast]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setError(null);
                const url = categoryId
                    ? `/notes?category=${categoryId}`
                    : "/notes";

                const res = await API.get(url);
                setNotes(res.data.notes || []);

                if (categoryId && res.data.notes && res.data.notes.length > 0) {
                    setCategoryName(res.data.notes[0]?.category?.name || "Category");
                } else if (categoryId) {
                    setCategoryName("Category");
                } else {
                    setCategoryName("");
                }
            } catch (error) {
                console.error("FETCH NOTES ERROR:", error.response?.data || error.message);
                setError(error.response?.data?.message || "Failed to fetch notes");
                showToast("Failed to load notes", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [categoryId, showToast]);

    // Filter and sort notes
    const filteredAndSortedNotes = useMemo(() => {
        let filtered = notes.filter((note) =>
            note.title?.toLowerCase().includes(search.toLowerCase()) ||
            note.subject?.toLowerCase().includes(search.toLowerCase()) ||
            note.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
            note.owner?.name?.toLowerCase().includes(search.toLowerCase())
        );

        switch (sortBy) {
            case "latest":
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "oldest":
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "most-downloaded":
                filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
                break;
            case "most-viewed":
                filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case "alphabetical":
                filtered.sort((a, b) => a.title?.localeCompare(b.title || "") || 0);
                break;
            default:
                break;
        }

        return filtered;
    }, [notes, search, sortBy]);

    // Calculate statistics
    const totalNotes = filteredAndSortedNotes.length;
    const totalViews = filteredAndSortedNotes.reduce((sum, note) => sum + (note.views || 0), 0);
    const uniqueCategories = new Set(filteredAndSortedNotes.map(note => note.category?._id)).size;

    // Update total downloads when notes change
    useEffect(() => {
        const sum = filteredAndSortedNotes.reduce((acc, note) => acc + (note.downloads || 0), 0);
        setTotalDownloads(sum);
    }, [filteredAndSortedNotes]);

    // Pagination
    const totalPages = Math.ceil(totalNotes / notesPerPage);
    const indexOfLastNote = currentPage * notesPerPage;
    const indexOfFirstNote = indexOfLastNote - notesPerPage;
    const currentNotes = filteredAndSortedNotes.slice(indexOfFirstNote, indexOfLastNote);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, sortBy, categoryId]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get file icon with color
    const getFileIcon = (filename) => {
        const ext = filename?.split(".").pop()?.toLowerCase();
        const icons = {
            pdf: { icon: "📄", color: "bg-red-50 text-red-600" },
            doc: { icon: "📝", color: "bg-blue-50 text-blue-600" },
            docx: { icon: "📝", color: "bg-blue-50 text-blue-600" },
            ppt: { icon: "📊", color: "bg-orange-50 text-orange-600" },
            pptx: { icon: "📊", color: "bg-orange-50 text-orange-600" },
            png: { icon: "🖼️", color: "bg-green-50 text-green-600" },
            jpg: { icon: "🖼️", color: "bg-green-50 text-green-600" },
            jpeg: { icon: "🖼️", color: "bg-green-50 text-green-600" },
            default: { icon: "📁", color: "bg-slate-50 text-slate-600" }
        };
        return icons[ext] || icons.default;
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
    };

    // Loading skeleton with shimmer
    const LoadingSkeleton = () => (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                            <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="h-7 bg-slate-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                        <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-4 bg-slate-200 rounded w-20"></div>
                                <div className="h-4 bg-slate-200 rounded w-16"></div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-9 bg-slate-200 rounded-xl flex-1"></div>
                                <div className="h-9 bg-slate-200 rounded-xl flex-1"></div>
                            </div>
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
                className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"
            >
                <span className="text-4xl">🔍</span>
            </motion.div>
            <h3 className="text-lg font-semibold text-slate-800">No Notes Found</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                {search ? "Try searching with a different keyword or browse all notes." : "There are no notes available in this category yet."}
            </p>
            {search && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearch("")}
                    className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1"
                >
                    <span>Clear search</span>
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </motion.button>
            )}
        </motion.div>
    );

    // Pagination component
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        return (
            <div className="flex items-center justify-center gap-2 mt-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </motion.button>
                {pages.map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-slate-400">…</span>
                    ) : (
                        <motion.button
                            key={page}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${currentPage === page
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {page}
                        </motion.button>
                    )
                ))}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </motion.button>
            </div>
        );
    };

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
                <div className="max-w-7xl mx-auto px-6 py-10">

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
                                {categoryName ? "Category" : "Explore"}
                            </motion.span>
                            {categoryName && (
                                <span className="text-xs text-slate-400 ml-2">
                                    {categoryName}
                                </span>
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
                                    {categoryName ? `${categoryName} Notes` : "Notes Library"}
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-slate-500 mt-1.5 max-w-2xl"
                                >
                                    {categoryName
                                        ? `Browse all notes in the ${categoryName} category.`
                                        : "Discover and learn from notes shared by students and educators across all subjects."}
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm"
                            >
                                <span className="font-medium text-slate-700">{totalNotes}</span>
                                <span>Notes</span>
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
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {[
                            { label: "Total Notes", value: totalNotes, icon: "📚", color: "indigo" },
                            { label: "Total Downloads", value: totalDownloads, icon: "⬇️", color: "emerald" },
                            { label: "Total Views", value: totalViews, icon: "👁️", color: "violet" },
                            { label: "Categories", value: uniqueCategories, icon: "🏷️", color: "amber" }
                        ].map((stat, index) => (
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

                    {/* Search and Sort Bar */}
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
                                    placeholder="Search by title, subject, category or owner..."
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
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-100"
                                >
                                    <option value="latest">🆕 Latest</option>
                                    <option value="oldest">📅 Oldest</option>
                                    <option value="most-downloaded">⬇️ Most Downloaded</option>
                                    <option value="most-viewed">👁️ Most Viewed</option>
                                    <option value="alphabetical">🔤 A-Z</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notes Grid */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSkeleton key="loading" />
                        ) : currentNotes.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <motion.div
                                key="notes"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
                            >
                                {currentNotes.map((note, index) => {
                                    const fileIcon = getFileIcon(note.fileUrl);
                                    return (
                                        <motion.div
                                            key={note._id}
                                            variants={fadeInUp}
                                            custom={index}
                                            {...cardHover}
                                            whileHover="hover"
                                            whileTap="tap"
                                            className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300"
                                        >
                                            <div className="p-5">
                                                {/* Header with category and file type */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <motion.span
                                                        whileHover={{ scale: 1.05 }}
                                                        className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium group-hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <span>{note.category?.icon || "📂"}</span>
                                                        <span>{note.category?.name || "General"}</span>
                                                    </motion.span>
                                                    <span className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${fileIcon.color}`}>
                                                        <span className="text-base">{fileIcon.icon}</span>
                                                        <span>{note.fileType || "File"}</span>
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                    {note.title}
                                                </h2>

                                                {/* Subject */}
                                                <p className="text-sm text-slate-500 mb-3 flex items-center gap-1.5">
                                                    <span>📖</span>
                                                    <span>{note.subject}</span>
                                                </p>

                                                {/* Description */}
                                                {note.description && (
                                                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                                        {note.description}
                                                    </p>
                                                )}

                                                {/* Owner and Stats */}
                                                <div className="border-t border-slate-100 pt-4">
                                                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <span>👤</span>
                                                            <span>{note.owner?.name || "Unknown"}</span>
                                                        </span>
                                                        {note.fileSize && (
                                                            <span className="flex items-center gap-1">
                                                                <span>📦</span>
                                                                <span>{formatFileSize(note.fileSize)}</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <span>👁️</span>
                                                            <span>{note.views || 0}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span>⬇️</span>
                                                            <span>{note.downloads || 0}</span>
                                                        </span>
                                                        <span className="ml-auto text-slate-400">
                                                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3 mt-4">
                                                    <Link to={`/note/${note._id}`} className="flex-1">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                                                        >
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                                                <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                                                <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                                            </svg>
                                                            View
                                                        </motion.button>
                                                    </Link>

                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDownload(note._id)}
                                                        disabled={downloading === note._id}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                                    >
                                                        {downloading === note._id ? (
                                                            <>
                                                                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                                </svg>
                                                                Downloading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                                                    <path d="M8 10V1M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                Download
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count and Pagination */}
                    {!loading && currentNotes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="mt-6 text-center">
                                <p className="text-xs text-slate-400">
                                    Showing {indexOfFirstNote + 1} - {Math.min(indexOfLastNote, totalNotes)} of {totalNotes} notes
                                    {search && ` matching "${search}"`}
                                </p>
                            </div>
                            <Pagination />
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
                            NotesSaver • Notes Library • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default NotesList;