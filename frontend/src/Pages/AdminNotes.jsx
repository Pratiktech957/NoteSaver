import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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
                    <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Note?</h3>
                    <p className="text-sm text-slate-500 text-center">
                        Are you sure you want to delete "{noteTitle}"? This action cannot be undone.
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

const AdminNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:5000/api/admin/notes",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setNotes(res.data.notes || []);
            } catch (error) {
                console.error("FETCH NOTES ERROR:", error.response?.data || error.message);
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
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:5000/api/notes/${noteToDelete._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setNotes((prev) => prev.filter((note) => note._id !== noteToDelete._id));
            setDeleteModalOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            console.error("DELETE ERROR:", error.response?.data || error.message);
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

    // Get file icon
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
            default: "📁"
        };
        return icons[ext] || icons.default;
    };

    // Filter and sort notes
    const filteredAndSortedNotes = useMemo(() => {
        let filtered = notes.filter((note) =>
            note.title?.toLowerCase().includes(search.toLowerCase()) ||
            note.subject?.toLowerCase().includes(search.toLowerCase()) ||
            note.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
            note.owner?.email?.toLowerCase().includes(search.toLowerCase())
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

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
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
                <span className="text-5xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {search ? "No matching notes" : "No Notes Found"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {search ? "Try adjusting your search terms." : "Notes will appear here once uploaded by users."}
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
                            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                Admin
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                                    Note Management
                                </h1>
                                <p className="text-sm text-slate-500 mt-1.5">
                                    Manage all notes across the platform • {totalNotes} total notes
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm">
                                <span className="font-medium text-slate-700">{totalNotes}</span>
                                <span>Notes</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total Notes
                                    </p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                                        {loading ? "..." : totalNotes}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <span className="text-lg">📚</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total Views
                                    </p>
                                    <p className="text-2xl font-bold text-violet-600 mt-1">
                                        {loading ? "..." : totalViews}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <span className="text-lg">👁️</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total Downloads
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                                        {loading ? "..." : totalDownloads}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <span className="text-lg">⬇️</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Categories
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600 mt-1">
                                        {loading ? "..." : uniqueCategories}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <span className="text-lg">🏷️</span>
                                </div>
                            </div>
                        </div>
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
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
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

                    {/* Notes List */}
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
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-lg">{getFileIcon(note.fileUrl)}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-slate-900 truncate">
                                                            {note.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 truncate">
                                                            Subject: {note.subject}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                                                        {note.category?.icon || "📂"} {note.category?.name || "General"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                                                        👤 {note.owner?.name || "Unknown"}
                                                    </span>
                                                    {note.fileSize && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                                                            📦 {formatFileSize(note.fileSize)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                                                    <span>👁️ {note.views || 0}</span>
                                                    <span>⬇️ {note.downloads || 0}</span>
                                                    <span>{new Date(note.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Link to={`/note/${note._id}`}>
                                                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-all">
                                                        View
                                                    </button>
                                                </Link>
                                                <button
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
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count */}
                    {!loading && filteredAndSortedNotes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
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