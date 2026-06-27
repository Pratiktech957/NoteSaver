import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../Components/AdminSidebar";
import API from "../Services/api";

// Enhanced animation variants
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
                className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 mx-auto mb-4">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">Delete Category?</h3>
                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                        Are you sure you want to delete "<span className="font-medium text-gray-700">{categoryName}</span>"? This action cannot be undone.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition-all"
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
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME fetchCategories - NO CHANGES
    const fetchCategories = async () => {
        try {
            const res = await API.get("/categories");
            setCategories(res.data.categories || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // EXACT SAME useEffect - NO CHANGES
    useEffect(() => {
        fetchCategories();
    }, []);

    // EXACT SAME handleChange - NO CHANGES
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // EXACT SAME handleSubmit - NO CHANGES
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert("Category name is required");
            return;
        }

        try {
            setSubmitting(true);

            if (editingId) {
                await API.put(`/categories/${editingId}`, formData);
            } else {
                await API.post("/categories", formData);
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

    // EXACT SAME handleEdit - NO CHANGES
    const handleEdit = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: category.description || "",
            icon: category.icon || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // EXACT SAME handleDelete - NO CHANGES
    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await API.delete(`/categories/${categoryToDelete._id}`);
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Delete failed");
        }
    };

    // EXACT SAME cancelEdit - NO CHANGES
    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            icon: ""
        });
    };

    // EXACT SAME filteredCategories - NO CHANGES
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
    );

    // EXACT SAME statistics - NO CHANGES
    const totalCategories = categories.length;
    const totalNotes = categories.reduce((sum, cat) => sum + (cat.noteCount || 0), 0);

    // Loading skeleton - B&W Theme
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-24 sm:w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 sm:w-20"></div>
                        </div>
                    </div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2">
                        <div className="h-8 sm:h-9 bg-gray-200 rounded-xl w-16"></div>
                        <div className="h-8 sm:h-9 bg-gray-200 rounded-xl w-16"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Empty state - B&W Theme
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-16 text-center"
        >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl">📂</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {search ? "No matching categories" : "No Categories Found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {search ? "Try adjusting your search terms." : "Categories will appear here once created."}
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
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                Admin
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                {totalCategories} Categories
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                                    Category Management
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                                    Organize notes with categories • {totalCategories} total categories
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
                                <span className="font-medium text-gray-700">{totalCategories}</span>
                                <span>Categories</span>
                                <span className="w-px h-3 sm:h-4 bg-gray-200 mx-1 sm:mx-2"></span>
                                <span className="font-medium text-gray-700">{totalNotes}</span>
                                <span>Notes</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
                    >
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total Categories
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
                                        {loading ? "..." : totalCategories}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <span className="text-base sm:text-lg">📂</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total Notes in Categories
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
                                        {loading ? "..." : totalNotes}
                                    </p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <span className="text-base sm:text-lg">📚</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Card - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6 sm:mb-8"
                    >
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1v10M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">
                                    {editingId ? "Edit Category" : "Add New Category"}
                                </h2>
                            </div>
                            {editingId && (
                                <button
                                    onClick={cancelEdit}
                                    className="text-[10px] sm:text-sm text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 sm:py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter category name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        name="icon"
                                        placeholder="📚"
                                        value={formData.icon}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="Category description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
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
                                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>

                    {/* Search Bar - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
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
                                    placeholder="Search categories..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-400 bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-gray-200 flex-shrink-0">
                                <span className="font-medium text-gray-700 mr-1">{filteredCategories.length}</span>
                                results
                            </div>
                        </div>
                    </motion.div>

                    {/* Categories Grid - B&W Theme */}
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
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
                            >
                                {filteredCategories.map((category, index) => (
                                    <motion.div
                                        key={category._id}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-100 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                                                    {category.icon || "📚"}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                                                        {category.name}
                                                    </h3>
                                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full">
                                                        📝 {category.noteCount || 0} notes
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-4 min-h-[2.5rem] sm:min-h-[3rem]">
                                            {category.description || "No description provided"}
                                        </p>

                                        <div className="flex gap-2 pt-3 sm:pt-4 border-t border-gray-100">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] sm:text-sm font-medium transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCategoryToDelete(category);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] sm:text-sm font-medium transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count - B&W Theme */}
                    {!loading && filteredCategories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-[10px] sm:text-xs text-gray-400">
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

export default AdminCategories;