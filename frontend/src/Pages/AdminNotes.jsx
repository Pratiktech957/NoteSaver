import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

// Enhanced scale and hover variants
const scaleOnHover = {
    hover: {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.1 }
    }
};

// Delete Confirmation Modal with enhanced animations
const DeleteModal = ({ isOpen, onClose, onConfirm, noteTitle }) => {
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
                        Delete Note?
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-sm text-slate-500 text-center"
                    >
                        Are you sure you want to delete "<span className="font-medium text-slate-700">{noteTitle}</span>"?
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

const AdminNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setError(null);
                const res = await API.get("/admin/notes");
                setNotes(res.data.notes || []);
            } catch (error) {
                console.error("FETCH NOTES ERROR:", error.response?.data || error.message);
                setError(error.response?.data?.message || "Failed to fetch notes");
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const handleDelete = async () => {
        if (!noteToDelete) return;

        try {
            setDeletingId(noteToDelete._id);
            await API.delete(`/notes/${noteToDelete._id}`);
            setNotes((prev) => prev.filter((note) => note._id !== noteToDelete._id));
            setDeleteModalOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            console.error("DELETE ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to delete note");
        } finally {
            setDeletingId(null);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
    };

    // Get file icon with enhanced mapping
    const getFileIcon = (filename) => {
        const ext = filename?.split(".").pop()?.toLowerCase();
        const icons = {
            pdf: "📄",
            doc: "📝",
            docx: "📝",
            ppt: "📊",
            pptx: "📊",
            png: "🖼️",
            jpg: "🖼️",
            jpeg: "🖼️",
            mp4: "🎬",
            mp3: "🎵",
            zip: "📦",
            rar: "📦",
            default: "📁"
        };
        return icons[ext] || icons.default;
    };

    // Get file color
    const getFileColor = (filename) => {
        const ext = filename?.split(".").pop()?.toLowerCase();
        const colors = {
            pdf: "bg-red-50 text-red-600",
            doc: "bg-blue-50 text-blue-600",
            docx: "bg-blue-50 text-blue-600",
            ppt: "bg-orange-50 text-orange-600",
            pptx: "bg-orange-50 text-orange-600",
            png: "bg-green-50 text-green-600",
            jpg: "bg-green-50 text-green-600",
            jpeg: "bg-green-50 text-green-600",
            mp4: "bg-purple-50 text-purple-600",
            mp3: "bg-pink-50 text-pink-600",
            default: "bg-slate-50 text-slate-600"
        };
        return colors[ext] || colors.default;
    };

    // Filter and sort notes
    const filteredAndSortedNotes = useMemo(() => {
        let filtered = notes.filter((note) =>
            note.title?.toLowerCase().includes(search.toLowerCase()) ||
            note.subject?.toLowerCase().includes(search.toLowerCase()) ||
            note.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
            note.owner?.email?.toLowerCase().includes(search.toLowerCase()) ||
            note.category?.name?.toLowerCase().includes(search.toLowerCase())
        );

        switch (sortBy) {
            case "latest":
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "oldest":
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "most-viewed":
                filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case "most-downloaded":
                filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
                break;
            case "alphabetical":
                filtered.sort((a, b) => a.title?.localeCompare(b.title || "") || 0);
                break;
            default:
                break;
        }

        return filtered;
    }, [notes, search, sortBy]);

    // Statistics
    const totalNotes = notes.length;
    const totalViews = notes.reduce((sum, n) => sum + (n.views || 0), 0);
    const totalDownloads = notes.reduce((sum, n) => sum + (n.downloads || 0), 0);
    const uniqueCategories = new Set(notes.map(n => n.category?._id)).size;

    // Loading skeleton with shimmer effect
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                                    <div>
                                        <div className="h-5 bg-slate-200 rounded w-48 mb-2"></div>
                                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                                    </div>
                                </div>
                                <div className="h-4 bg-slate-200 rounded w-40 mb-2"></div>
                                <div className="flex gap-2">
                                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-10 bg-slate-200 rounded-xl w-20"></div>
                                <div className="h-10 bg-slate-200 rounded-xl w-20"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // Empty state with animation
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
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6"
            >
                <span className="text-5xl">📚</span>
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {search ? "No matching notes" : "No Notes Found"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {search ? "Try adjusting your search terms." : "Notes will appear here once uploaded by users."}
            </p>
        </motion.div>
    );

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <AdminSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">

                    {/* Header with enhanced animation */}
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
                                    Note Management
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-slate-500 mt-1.5"
                                >
                                    Manage all notes across the platform • {totalNotes} total notes
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

                    {/* Statistics Cards with enhanced animations */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {[
                            { label: "Total Notes", value: totalNotes, icon: "📚", color: "indigo" },
                            { label: "Total Views", value: totalViews, icon: "👁️", color: "violet" },
                            { label: "Total Downloads", value: totalDownloads, icon: "⬇️", color: "emerald" },
                            { label: "Categories", value: uniqueCategories, icon: "🏷️", color: "amber" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index + 1}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
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
                                    placeholder="Search by title, subject, owner..."
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
                                    <option value="latest">Latest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="most-viewed">Most Viewed</option>
                                    <option value="most-downloaded">Most Downloaded</option>
                                    <option value="alphabetical">A-Z</option>
                                </select>
                            </div>
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
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Notes List with enhanced animations */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSkeleton key="loading" />
                        ) : filteredAndSortedNotes.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <motion.div
                                key="notes"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {filteredAndSortedNotes.map((note, index) => (
                                    <motion.div
                                        key={note._id}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{
                                            y: -4,
                                            transition: { duration: 0.2 }
                                        }}
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                                        className={`w-10 h-10 rounded-xl ${getFileColor(note.fileUrl)} flex items-center justify-center flex-shrink-0`}
                                                    >
                                                        <span className="text-lg">{getFileIcon(note.fileUrl)}</span>
                                                    </motion.div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-slate-900 truncate">
                                                            {note.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 truncate">
                                                            Subject: {note.subject || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <motion.span
                                                        whileHover={{ scale: 1.05 }}
                                                        className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full"
                                                    >
                                                        {note.category?.icon || "📂"} {note.category?.name || "General"}
                                                    </motion.span>
                                                    <motion.span
                                                        whileHover={{ scale: 1.05 }}
                                                        className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full"
                                                    >
                                                        👤 {note.owner?.name || "Unknown"}
                                                    </motion.span>
                                                    {note.fileSize && (
                                                        <motion.span
                                                            whileHover={{ scale: 1.05 }}
                                                            className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full"
                                                        >
                                                            📦 {formatFileSize(note.fileSize)}
                                                        </motion.span>
                                                    )}
                                                    {note.isPublic && (
                                                        <motion.span
                                                            whileHover={{ scale: 1.05 }}
                                                            className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full"
                                                        >
                                                            🌐 Public
                                                        </motion.span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                                                    <motion.span
                                                        whileHover={{ scale: 1.1 }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        👁️ {note.views || 0}
                                                    </motion.span>
                                                    <motion.span
                                                        whileHover={{ scale: 1.1 }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        ⬇️ {note.downloads || 0}
                                                    </motion.span>
                                                    <span>
                                                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Link to={`/note/${note._id}`}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-all"
                                                    >
                                                        View
                                                    </motion.button>
                                                </Link>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setNoteToDelete(note);
                                                        setDeleteModalOpen(true);
                                                    }}
                                                    disabled={deletingId === note._id}
                                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deletingId === note._id ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                            </svg>
                                                            Deleting...
                                                        </span>
                                                    ) : (
                                                        "Delete"
                                                    )}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count with animation */}
                    {!loading && filteredAndSortedNotes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Showing {filteredAndSortedNotes.length} of {notes.length} notes
                                {search && ` matching "${search}"`}
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
                            setNoteToDelete(null);
                        }}
                        onConfirm={handleDelete}
                        noteTitle={noteToDelete?.title}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminNotes;