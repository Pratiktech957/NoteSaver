import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import UserSidebar from "../components/UserSidebar";
import toast, { Toaster } from "react-hot-toast";

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

// Edit Modal Component
const EditModal = ({ isOpen, onClose, note, onUpdate }) => {
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title || "");
            setSubject(note.subject || "");
            setDescription(note.description || "");
            setCategory(note.category?._id || "");
        }
    }, [note]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/categories", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategories(res.data.categories || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !subject.trim()) {
            toast.error("Title and Subject are required");
            return;
        }

        try {
            setUpdating(true);
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `http://localhost:5000/api/notes/${note._id}`,
                {
                    title: title.trim(),
                    subject: subject.trim(),
                    description: description.trim(),
                    category: category || undefined
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                onUpdate(response.data.note);
                toast.success("Note updated successfully");
                onClose();
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Failed to update note");
        } finally {
            setUpdating(false);
        }
    };

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
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Edit Note</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Update your note information</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Enter note title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                            Subject *
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="Enter subject"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.icon || "📚"} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                            placeholder="Enter description (optional)"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
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

const MyNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [socket, setSocket] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    // Connect to Socket.IO
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const newSocket = io("http://localhost:5000", {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        setSocket(newSocket);

        return () => {
            if (newSocket.connected) {
                newSocket.disconnect();
            }
            newSocket.close();
        };
    }, []);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewNote = (data) => {
            setNotes(prev => [data, ...prev]);
            toast.success("New note added in real-time");
        };

        const handleNoteUpdated = (data) => {
            setNotes(prev =>
                prev.map(note =>
                    note._id === data._id ? data : note
                )
            );
            toast.success("Note updated in real-time");
        };

        const handleNoteDeleted = (data) => {
            setNotes(prev =>
                prev.filter(note => note._id !== data.noteId)
            );
            toast.success("Note deleted in real-time");
        };

        const handleNoteDownloaded = (data) => {
            setNotes(prev =>
                prev.map(note =>
                    note._id === data.noteId
                        ? { ...note, downloads: data.downloads }
                        : note
                )
            );
        };

        socket.on("newNote", handleNewNote);
        socket.on("noteUpdated", handleNoteUpdated);
        socket.on("noteDeleted", handleNoteDeleted);
        socket.on("noteDownloaded", handleNoteDownloaded);

        return () => {
            socket.off("newNote", handleNewNote);
            socket.off("noteUpdated", handleNoteUpdated);
            socket.off("noteDeleted", handleNoteDeleted);
            socket.off("noteDownloaded", handleNoteDownloaded);
        };
    }, [socket]);

    // Fetch notes
    useEffect(() => {
        const fetchMyNotes = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:5000/api/notes/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setNotes(res.data.notes || []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load notes");
            } finally {
                setLoading(false);
            }
        };
        fetchMyNotes();
    }, []);

    // Handle download
    const handleDownload = useCallback(async (noteId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5000/api/notes/${noteId}/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

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

                // Update local state
                setNotes(prev =>
                    prev.map(note =>
                        note._id === noteId
                            ? { ...note, downloads: (note.downloads || 0) + 1 }
                            : note
                    )
                );

                toast.success("Download started successfully");
            }
        } catch (error) {
            console.error("Download error:", error);
            toast.error(error.response?.data?.message || "Failed to download file");
        }
    }, []);

    // Handle delete
    const handleDelete = useCallback(async () => {
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
            setNotes(prev => prev.filter(note => note._id !== noteToDelete._id));
            toast.success("Note deleted successfully");
            setIsDeleteModalOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete note");
        } finally {
            setDeletingId(null);
        }
    }, [noteToDelete]);

    // Handle update
    const handleUpdate = useCallback((updatedNote) => {
        setNotes(prev =>
            prev.map(note =>
                note._id === updatedNote._id ? updatedNote : note
            )
        );
    }, []);

    // Filter and sort notes
    const filteredAndSortedNotes = useMemo(() => {
        let filtered = notes.filter((note) =>
            note.title?.toLowerCase().includes(search.toLowerCase()) ||
            note.subject?.toLowerCase().includes(search.toLowerCase()) ||
            note.description?.toLowerCase().includes(search.toLowerCase())
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

    // Calculate statistics
    const stats = useMemo(() => {
        const total = notes.length;
        const totalViews = notes.reduce((sum, note) => sum + (note.views || 0), 0);
        const totalDownloads = notes.reduce((sum, note) => sum + (note.downloads || 0), 0);
        const totalSize = notes.reduce((sum, note) => sum + (note.fileSize || 0), 0);
        const sizeInMB = totalSize / (1024 * 1024);
        return { total, totalViews, totalDownloads, totalSize: sizeInMB.toFixed(2) };
    }, [notes]);

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

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="grid md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                        <div className="flex-1">
                            <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="flex gap-4 mb-3">
                        <div className="h-4 bg-slate-200 rounded w-12"></div>
                        <div className="h-4 bg-slate-200 rounded w-12"></div>
                        <div className="h-4 bg-slate-200 rounded w-12"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="flex gap-2 mt-4">
                        <div className="h-9 bg-slate-200 rounded-xl w-20"></div>
                        <div className="h-9 bg-slate-200 rounded-xl w-20"></div>
                        <div className="h-9 bg-slate-200 rounded-xl w-20"></div>
                        <div className="h-9 bg-slate-200 rounded-xl w-20 ml-auto"></div>
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
                <span className="text-5xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {search ? "No matching notes" : "No Notes Uploaded Yet"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
                {search
                    ? "Try adjusting your search terms."
                    : "Start sharing your knowledge with the community by uploading your first note."}
            </p>
            {!search && (
                <Link to="/upload">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-6 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors inline-flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1v10M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Upload Your First Note
                    </motion.button>
                </Link>
            )}
        </motion.div>
    );

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <Toaster position="top-right" />
            <UserSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* Header Section */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                My Content
                            </span>
                            <span className="text-xs text-slate-400 ml-2">
                                {filteredAndSortedNotes.length} {filteredAndSortedNotes.length === 1 ? "note" : "notes"}
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                                    My Notes
                                </h1>
                                <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                                    Manage and organize all your uploaded educational resources in one place.
                                </p>
                            </div>
                            <Link to="/upload">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1v10M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Upload New Note
                                </motion.button>
                            </Link>
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
                                        {loading ? "..." : stats.total}
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
                                        {loading ? "..." : stats.totalViews}
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
                                        {loading ? "..." : stats.totalDownloads}
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
                                        Storage Used
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600 mt-1">
                                        {loading ? "..." : `${stats.totalSize} MB`}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <span className="text-lg">💾</span>
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
                                    placeholder="Search your notes..."
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

                    {/* Notes Grid */}
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
                                className="grid md:grid-cols-2 gap-5"
                            >
                                {filteredAndSortedNotes.map((note, index) => (
                                    <motion.div
                                        key={note._id}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                        className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                                    >
                                        {/* Note Header */}
                                        <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-100 transition-colors">
                                                <span className="text-lg">
                                                    {getFileIcon(note.fileUrl)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                                    {note.title}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-xs text-slate-600">
                                                        {note.category?.icon || "📂"}
                                                        {note.category?.name || "General"}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Note Stats */}
                                        <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4 text-xs">
                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                <span>👁️</span>
                                                <span>{note.views || 0}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                <span>⬇️</span>
                                                <span>{note.downloads || 0}</span>
                                            </span>
                                            {note.fileSize && (
                                                <span className="flex items-center gap-1.5 text-slate-400">
                                                    <span>📦</span>
                                                    <span>{formatFileSize(note.fileSize)}</span>
                                                </span>
                                            )}
                                            <span className="ml-auto text-slate-400 text-xs">
                                                {note.fileType || "File"}
                                            </span>
                                        </div>

                                        {/* Note Description */}
                                        {note.description && (
                                            <div className="px-5 py-3 border-b border-slate-100">
                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                    {note.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="px-5 py-4 flex flex-wrap gap-2">
                                            <Link to={`/note/${note._id}`}>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                                        <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                                    </svg>
                                                    View
                                                </motion.button>
                                            </Link>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDownload(note._id)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                                    <path d="M8 10V1M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Download
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    setEditingNote(note);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                                    <path d="M11.5 2.5l2 2L4.5 13.5l-3 .5.5-3L11.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Edit
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    setNoteToDelete(note);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                disabled={deletingId === note._id}
                                                className="ml-auto bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                {deletingId === note._id ? (
                                                    <>
                                                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                        </svg>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                                            <path d="M2 3.5h12M6 1h4M3.5 3.5L5 14h6l1.5-10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Delete
                                                    </>
                                                )}
                                            </motion.button>
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

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <EditModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setEditingNote(null);
                        }}
                        note={editingNote}
                        onUpdate={handleUpdate}
                    />
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <DeleteModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => {
                            setIsDeleteModalOpen(false);
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

export default MyNotes;