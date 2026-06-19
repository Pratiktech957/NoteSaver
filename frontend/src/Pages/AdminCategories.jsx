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
const DeleteModal = ({ isOpen, onClose, onConfirm, categoryName }) => {
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
                    <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Category?</h3>
                    <p className="text-sm text-slate-500 text-center">
                        Are you sure you want to delete "{categoryName}"? This action cannot be undone.
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

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/categories");
            setCategories(res.data.categories || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert("Category name is required");
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");

            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/categories/${editingId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            } else {
                await axios.post(
                    "http://localhost:5000/api/categories",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }

            setFormData({
                name: "",
                description: "",
                icon: ""
            });
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: category.description || "",
            icon: category.icon || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:5000/api/categories/${categoryToDelete._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Delete failed");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            icon: ""
        });
    };

    // Filter categories
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
    );

    // Statistics
    const totalCategories = categories.length;
    const totalNotes = categories.reduce((sum, cat) => sum + (cat.noteCount || 0), 0);

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                        <div className="flex-1">
                            <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-20"></div>
                        </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2">
                        <div className="h-9 bg-slate-200 rounded-xl w-16"></div>
                        <div className="h-9 bg-slate-200 rounded-xl w-16"></div>
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
                <span className="text-5xl">📂</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {search ? "No matching categories" : "No Categories Found"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {search ? "Try adjusting your search terms." : "Categories will appear here once created."}
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
                                    Category Management
                                </h1>
                                <p className="text-sm text-slate-500 mt-1.5">
                                    Organize notes with categories • {totalCategories} total categories
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm">
                                <span className="font-medium text-slate-700">{totalCategories}</span>
                                <span>Categories</span>
                                <span className="w-px h-4 bg-slate-200 mx-2"></span>
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
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                    >
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total Categories
                                    </p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                                        {loading ? "..." : totalCategories}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <span className="text-lg">📂</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Total Notes in Categories
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                                        {loading ? "..." : totalNotes}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <span className="text-lg">📚</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden mb-8"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1v10M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">
                                    {editingId ? "Edit Category" : "Add New Category"}
                                </h2>
                            </div>
                            {editingId && (
                                <button
                                    onClick={cancelEdit}
                                    className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter category name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        name="icon"
                                        placeholder="📚"
                                        value={formData.icon}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="Category description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        editingId ? "Update Category" : "Add Category"
                                    )}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
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
                                    placeholder="Search categories..."
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
                            <div className="flex items-center text-sm text-slate-400 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                                <span className="font-medium text-slate-700 mr-1">{filteredCategories.length}</span>
                                results
                            </div>
                        </div>
                    </motion.div>

                    {/* Categories Grid */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSkeleton key="loading" />
                        ) : filteredCategories.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <motion.div
                                key="categories"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredCategories.map((category, index) => (
                                    <motion.div
                                        key={category._id}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                    {category.icon || "📚"}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">
                                                        {category.name}
                                                    </h3>
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                                        📝 {category.noteCount || 0} notes
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                            {category.description || "No description provided"}
                                        </p>

                                        <div className="flex gap-2 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="flex-1 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-medium transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCategoryToDelete(category);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count */}
                    {!loading && filteredCategories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Showing {filteredCategories.length} of {categories.length} categories
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
                            setCategoryToDelete(null);
                        }}
                        onConfirm={handleDelete}
                        categoryName={categoryToDelete?.name}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCategories;