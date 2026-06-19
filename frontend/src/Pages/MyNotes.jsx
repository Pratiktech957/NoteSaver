import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import UserSidebar from "../Components/UserSidebar";
import API from "../services/api";
import toast, { Toaster } from "react-hot-toast";

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

// Edit Modal Component with enhanced animations
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
                setLoading(true);
                const res = await API.get("/categories");
                setCategories(res.data.categories || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                toast.error("Failed to load categories");
            } finally {
                setLoading(false);
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
            const response = await API.put(`/notes/${note._id}`, {
                title: title.trim(),
                subject: subject.trim(),
                description: description.trim(),
                category: category || undefined
            });

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
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                />
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
                            disabled={loading}
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
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={updating}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {updating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
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
                    <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Note?</h3>
                    <p className="text-sm text-slate-500 text-center">
                        Are you sure you want to delete "<span className="font-medium text-slate-700">{noteTitle}</span>"?
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-3 mt-6">
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
    const [error, setError] = useState(null);

    // Connect to Socket.IO with environment variable
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');
        const newSocket = io(SOCKET_URL, {
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
                setError(null);
                const res = await API.get("/notes/my");
                setNotes(res.data.notes || []);
            } catch (error) {
                console.error("FETCH NOTES ERROR:", error.response?.data || error.message);
                setError(error.response?.data?.message || "Failed to load notes");
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
            const response = await API.get(`/notes/${noteId}/download`);

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
            await API.delete(`/notes/${noteToDelete._id}`);
            setNotes(prev => prev.filter(note => note._id !== noteToDelete._id));
            toast.success("Note deleted successfully");
            setIsDeleteModalOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            console.error("DELETE ERROR:", error);
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
        <div className="grid md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer"></div>
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
                <span className="text-5xl">📝</span>
            </motion.div>
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors inline-flex items-center gap-2 shadow-md hover:shadow-lg"
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
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
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
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full"
                            >
                                My Content
                            </motion.span>
                            <span className="text-xs text-slate-400 ml-2">
                                {filteredAndSortedNotes.length} {filteredAndSortedNotes.length === 1 ? "note" : "notes"}
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <motion.h1
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight"
                                >
                                    My Notes
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-slate-500 mt-1.5 max-w-2xl"
                                >
                                    Manage and organize all your uploaded educational resources in one place.
                                </motion.p>
                            </div>
                            <Link to="/upload">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1v10M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Upload New Note
                                </motion.button>
                            </Link>
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
                            { label: "Total Notes", value: stats.total, icon: "📚", color: "indigo" },
                            { label: "Total Views", value: stats.totalViews, icon: "👁️", color: "violet" },
                            { label: "Total Downloads", value: stats.totalDownloads, icon: "⬇️", color: "emerald" },
                            { label: "Storage Used", value: `${stats.totalSize} MB`, icon: "💾", color: "amber" }
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
                                    placeholder="Search your notes..."
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
                                    <option value="most-viewed">👁️ Most Viewed</option>
                                    <option value="most-downloaded">⬇️ Most Downloaded</option>
                                    <option value="alphabetical">🔤 A-Z</option>
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
                                {filteredAndSortedNotes.map((note, index) => {
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
                                            {/* Note Header */}
                                            <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                                    className={`w-10 h-10 rounded-xl ${fileIcon.color} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-all duration-300`}
                                                >
                                                    <span className="text-lg">{fileIcon.icon}</span>
                                                </motion.div>
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
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
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
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDownload(note._id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                                        <path d="M8 10V1M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    Download
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
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
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
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
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count */}
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

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-10 text-center"
                    >
                        <p className="text-xs text-slate-400">
                            NotesSaver • My Notes • {new Date().getFullYear()}
                        </p>
                    </motion.div>

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