import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../Components/UserSidebar";

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

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("popular");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/categories/counts"
                );
                setCategories(res.data.categories || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Calculate statistics
    const totalCategories = categories.length;
    const totalNotes = categories.reduce((sum, cat) => sum + (cat.noteCount || 0), 0);
    const mostPopular = categories.length > 0
        ? categories.reduce((a, b) => (a.noteCount || 0) > (b.noteCount || 0) ? a : b)
        : null;

    // Filter and sort categories
    const filteredAndSortedCategories = useMemo(() => {
        let filtered = categories.filter(cat =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        switch (sortBy) {
            case "popular":
                filtered.sort((a, b) => (b.noteCount || 0) - (a.noteCount || 0));
                break;
            case "newest":
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "alphabetical":
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        return filtered;
    }, [categories, searchTerm, sortBy]);

    // Handle category click
    const handleCategoryClick = (categoryId) => {
        navigate(`/notes?category=${categoryId}`);
    };

    // Category icon mapping
    const getCategoryIcon = (icon) => {
        const iconMap = {
            "math": "📐",
            "science": "🔬",
            "history": "📜",
            "literature": "📖",
            "technology": "💻",
            "business": "📊",
            "art": "🎨",
            "music": "🎵",
            "language": "🌍",
            "programming": "⚛️",
            "design": "✏️",
            "photography": "📷",
            "psychology": "🧠",
            "philosophy": "🤔",
            "economics": "💰",
            "biology": "🧬",
            "chemistry": "🧪",
            "physics": "⚡",
            "geography": "🌎",
            "sports": "⚽",
            "health": "💪",
            "education": "🎓"
        };
        return iconMap[icon?.toLowerCase()] || icon || "📚";
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
                        <div className="w-12 h-8 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
            ))}
        </div>
    );

    // Empty state
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
        >
            <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No Categories Found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {searchTerm ? "No categories match your search criteria." : "Categories will appear here once added."}
            </p>
        </motion.div>
    );

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <UserSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* Hero Section */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                Browse
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                                    Categories
                                </h1>
                                <p className="text-sm text-slate-500 mt-1.5">
                                    Explore study resources by category • {totalCategories} categories available
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
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
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
                                        Total Notes
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                                        {loading ? "..." : totalNotes}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <span className="text-lg">📝</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Most Popular
                                    </p>
                                    <p className="text-2xl font-bold text-violet-600 mt-1 truncate max-w-[180px]">
                                        {loading ? "..." : (mostPopular?.name || "N/A")}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <span className="text-lg">⭐</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search and Filter Bar */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-4 mb-8"
                    >
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" viewBox="0 0 16 16" fill="none">
                                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
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
                                    <option value="popular">Most Popular</option>
                                    <option value="newest">Newest</option>
                                    <option value="alphabetical">Alphabetical</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Categories Grid */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSkeleton key="loading" />
                        ) : filteredAndSortedCategories.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <motion.div
                                key="categories"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredAndSortedCategories.map((category, index) => (
                                    <motion.div
                                        key={category._id}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{
                                            y: -6,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleCategoryClick(category._id)}
                                        className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        {/* Click indicator overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/30 group-hover:via-indigo-50/20 group-hover:to-indigo-50/0 transition-all duration-500"></div>

                                        {/* Border glow effect on hover */}
                                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-indigo-400/30 transition-all duration-300 pointer-events-none"></div>

                                        <div className="relative">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                    <span className="text-3xl">
                                                        {getCategoryIcon(category.icon)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full group-hover:bg-indigo-100 transition-colors duration-300 group-hover:shadow-sm">
                                                    <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700 transition-colors">
                                                        {category.noteCount || 0}
                                                    </span>
                                                    <span className="text-xs text-slate-400 group-hover:text-indigo-400 transition-colors">
                                                        notes
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1.5">
                                                {category.name}
                                            </h3>

                                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 group-hover:text-slate-600 transition-colors">
                                                {category.description || "Explore resources in this category"}
                                            </p>

                                            {/* View button on hover with arrow */}
                                            <div className="mt-4 flex items-center text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                <span>Browse notes</span>
                                                <svg className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 16 16" fill="none">
                                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>

                                            {/* Click hint - subtle arrow indicator */}
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 16 16" fill="none">
                                                    <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count */}
                    {!loading && filteredAndSortedCategories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-slate-400">
                                Showing {filteredAndSortedCategories.length} of {totalCategories} categories
                                {searchTerm && ` matching "${searchTerm}"`}
                            </p>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Categories;