import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
                        Delete Note?
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-xs sm:text-sm text-gray-500 text-center"
                    >
                        Are you sure you want to delete "<span className="font-medium text-gray-700">{noteTitle}</span>"?
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

const AdminNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [error, setError] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME useEffect - NO CHANGES
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

    // EXACT SAME handleDelete - NO CHANGES
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

    // EXACT SAME formatFileSize - NO CHANGES
    const formatFileSize = (bytes) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
    };

    // EXACT SAME getFileIcon - NO CHANGES
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

    // EXACT SAME getFileColor - NO CHANGES
    const getFileColor = (filename) => {
        const ext = filename?.split(".").pop()?.toLowerCase();
        const colors = {
            pdf: "bg-gray-100 text-gray-700",
            doc: "bg-gray-100 text-gray-700",
            docx: "bg-gray-100 text-gray-700",
            ppt: "bg-gray-100 text-gray-700",
            pptx: "bg-gray-100 text-gray-700",
            png: "bg-gray-100 text-gray-700",
            jpg: "bg-gray-100 text-gray-700",
            jpeg: "bg-gray-100 text-gray-700",
            mp4: "bg-gray-100 text-gray-700",
            mp3: "bg-gray-100 text-gray-700",
            default: "bg-gray-100 text-gray-700"
        };
        return colors[ext] || colors.default;
    };

    // EXACT SAME filter and sort - NO CHANGES
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

    // EXACT SAME statistics - NO CHANGES
    const totalNotes = notes.length;
    const totalViews = notes.reduce((sum, n) => sum + (n.views || 0), 0);
    const totalDownloads = notes.reduce((sum, n) => sum + (n.downloads || 0), 0);
    const uniqueCategories = new Set(notes.map(n => n.category?._id)).size;

    // Loading skeleton with shimmer - B&W Theme
    const LoadingSkeleton = () => (
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
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                                    </div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-32 sm:w-40 mb-2"></div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="h-9 sm:h-10 bg-gray-200 rounded-xl w-16 sm:w-20"></div>
                                <div className="h-9 sm:h-10 bg-gray-200 rounded-xl w-16 sm:w-20"></div>
                            </div>
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
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
                <span className="text-4xl sm:text-5xl">📚</span>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {search ? "No matching notes" : "No Notes Found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {search ? "Try adjusting your search terms." : "Notes will appear here once uploaded by users."}
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
                                {totalNotes} Notes
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
                                    Note Management
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xs sm:text-sm text-gray-500 mt-1.5"
                                >
                                    Manage all notes across the platform • {totalNotes} total notes
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-200 shadow-sm flex-shrink-0"
                            >
                                <span className="font-medium text-gray-700">{totalNotes}</span>
                                <span>Notes</span>
                            </motion.div>
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
                            { label: "Total Notes", value: totalNotes, icon: "📚" },
                            { label: "Total Views", value: totalViews, icon: "👁️" },
                            { label: "Total Downloads", value: totalDownloads, icon: "⬇️" },
                            { label: "Categories", value: uniqueCategories, icon: "🏷️" }
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
                                            className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 text-gray-900"
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

                    {/* Search and Sort Bar - B&W Theme */}
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
                                    placeholder="Search by title, subject, owner..."
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

                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer hover:bg-gray-100"
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

                    {/* Notes List - B&W Theme */}
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
                                className="space-y-3 sm:space-y-4"
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
                                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${getFileColor(note.fileUrl)} flex items-center justify-center flex-shrink-0`}
                                                    >
                                                        <span className="text-base sm:text-lg">{getFileIcon(note.fileUrl)}</span>
                                                    </motion.div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                            {note.title}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                            Subject: {note.subject || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                                                    <motion.span
                                                        whileHover={{ scale: 1.05 }}
                                                        className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-700 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                                                    >
                                                        {note.category?.icon || "📂"} {note.category?.name || "General"}
                                                    </motion.span>
                                                    <motion.span
                                                        whileHover={{ scale: 1.05 }}
                                                        className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-700 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                                                    >
                                                        👤 {note.owner?.name || "Unknown"}
                                                    </motion.span>
                                                    {note.fileSize && (
                                                        <motion.span
                                                            whileHover={{ scale: 1.05 }}
                                                            className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                                                        >
                                                            📦 {formatFileSize(note.fileSize)}
                                                        </motion.span>
                                                    )}
                                                    {note.isPublic && (
                                                        <motion.span
                                                            whileHover={{ scale: 1.05 }}
                                                            className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-700 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                                                        >
                                                            🌐 Public
                                                        </motion.span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-[10px] sm:text-xs text-gray-400">
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

                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                <Link to={`/note/${note._id}`}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-[10px] sm:text-sm font-medium transition-all"
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
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deletingId === note._id ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg className="animate-spin w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none">
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

                    {/* Results count - B&W Theme */}
                    {!loading && filteredAndSortedNotes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-[10px] sm:text-xs text-gray-400">
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

export default AdminNotes;