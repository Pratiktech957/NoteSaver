import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

// Enhanced card hover animations
const cardHover = {
    hover: {
        y: -8,
        scale: 1.03,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    tap: {
        scale: 0.97,
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

// Realistic category icons with proper emoji mapping
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
        "education": "🎓",
        "engineering": "🔧",
        "medicine": "💊",
        "law": "⚖️",
        "architecture": "🏛️",
        "fashion": "👗",
        "culinary": "🍳",
        "agriculture": "🌾",
        "astronomy": "🚀",
        "robotics": "🤖",
        "ai": "🧠",
        "blockchain": "⛓️",
        "cybersecurity": "🔐",
        "gaming": "🎮",
        "socialmedia": "📱",
        "marketing": "📈",
        "finance": "💹",
        "accounting": "🧾",
        "hr": "👔",
        "management": "📋",
        "leadership": "👑",
        "entrepreneurship": "🚀",
        "innovation": "💡",
        "default": "📚"
    };
    return iconMap[icon?.toLowerCase()] || iconMap.default;
};

// Get category color for gradients - B&W Theme
const getCategoryColor = (icon) => {
    const colorMap = {
        "math": "from-gray-700 to-gray-800",
        "science": "from-gray-700 to-gray-800",
        "history": "from-gray-700 to-gray-800",
        "literature": "from-gray-700 to-gray-800",
        "technology": "from-gray-700 to-gray-800",
        "business": "from-gray-700 to-gray-800",
        "art": "from-gray-700 to-gray-800",
        "music": "from-gray-700 to-gray-800",
        "language": "from-gray-700 to-gray-800",
        "programming": "from-gray-700 to-gray-800",
        "design": "from-gray-700 to-gray-800",
        "photography": "from-gray-700 to-gray-800",
        "psychology": "from-gray-700 to-gray-800",
        "philosophy": "from-gray-700 to-gray-800",
        "economics": "from-gray-700 to-gray-800",
        "biology": "from-gray-700 to-gray-800",
        "chemistry": "from-gray-700 to-gray-800",
        "physics": "from-gray-700 to-gray-800",
        "geography": "from-gray-700 to-gray-800",
        "sports": "from-gray-700 to-gray-800",
        "health": "from-gray-700 to-gray-800",
        "education": "from-gray-700 to-gray-800",
        "engineering": "from-gray-700 to-gray-800",
        "medicine": "from-gray-700 to-gray-800",
        "law": "from-gray-700 to-gray-800",
        "default": "from-gray-700 to-gray-800"
    };
    return colorMap[icon?.toLowerCase()] || colorMap.default;
};

// Get lighter gradient for bars
const getBarColor = (icon) => {
    const colorMap = {
        "math": "from-gray-500 to-gray-600",
        "science": "from-gray-500 to-gray-600",
        "history": "from-gray-500 to-gray-600",
        "literature": "from-gray-500 to-gray-600",
        "technology": "from-gray-500 to-gray-600",
        "business": "from-gray-500 to-gray-600",
        "art": "from-gray-500 to-gray-600",
        "music": "from-gray-500 to-gray-600",
        "language": "from-gray-500 to-gray-600",
        "programming": "from-gray-500 to-gray-600",
        "design": "from-gray-500 to-gray-600",
        "photography": "from-gray-500 to-gray-600",
        "psychology": "from-gray-500 to-gray-600",
        "philosophy": "from-gray-500 to-gray-600",
        "economics": "from-gray-500 to-gray-600",
        "biology": "from-gray-500 to-gray-600",
        "chemistry": "from-gray-500 to-gray-600",
        "physics": "from-gray-500 to-gray-600",
        "geography": "from-gray-500 to-gray-600",
        "sports": "from-gray-500 to-gray-600",
        "health": "from-gray-500 to-gray-600",
        "education": "from-gray-500 to-gray-600",
        "engineering": "from-gray-500 to-gray-600",
        "medicine": "from-gray-500 to-gray-600",
        "law": "from-gray-500 to-gray-600",
        "default": "from-gray-500 to-gray-600"
    };
    return colorMap[icon?.toLowerCase()] || colorMap.default;
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("popular");
    const [error, setError] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const navigate = useNavigate();

    // EXACT SAME useEffect - NO CHANGES
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setError(null);
                const res = await API.get("/categories/counts");
                setCategories(res.data.categories || []);
            } catch (error) {
                console.error("FETCH CATEGORIES ERROR:", error.response?.data || error.message);
                setError(error.response?.data?.message || "Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // EXACT SAME statistics - NO CHANGES
    const totalCategories = categories.length;
    const totalNotes = categories.reduce((sum, cat) => sum + (cat.noteCount || 0), 0);
    const mostPopular = categories.length > 0
        ? categories.reduce((a, b) => (a.noteCount || 0) > (b.noteCount || 0) ? a : b)
        : null;

    // EXACT SAME filter and sort - NO CHANGES
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

    // EXACT SAME handleCategoryClick - NO CHANGES
    const handleCategoryClick = (categoryId) => {
        navigate(`/notes?category=${categoryId}`);
    };

    // Loading Skeleton - B&W Theme
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
                            <div className="w-16 sm:w-20 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="mt-3 w-full h-1 bg-gray-200 rounded-full"></div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // Empty State - B&W Theme
    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
            }}
            className="text-center py-12 sm:py-20"
        >
            <motion.div
                animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
                <span className="text-4xl sm:text-5xl">🔍</span>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? "No matching categories" : "No Categories Found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {searchTerm ? "No categories match your search criteria." : "Categories will appear here once added."}
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
                <UserSidebar />
            </motion.div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <UserSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                    {/* Mobile Menu Button */}
                    <MobileMenuButton
                        showSidebar={showMobileSidebar}
                        setShowSidebar={setShowMobileSidebar}
                    />

                    {/* Hero Section - B&W SaaS Style */}
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
                                Browse
                            </motion.span>
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                            >
                                {totalCategories} Categories
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
                                    Categories
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xs sm:text-sm text-gray-500 mt-1.5"
                                >
                                    Explore study resources by category • {totalCategories} categories available
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-200 shadow-sm"
                            >
                                <span className="font-medium text-gray-700">{totalCategories}</span>
                                <span>Categories</span>
                                <span className="w-px h-3 sm:h-4 bg-gray-200 mx-1 sm:mx-2"></span>
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
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
                    >
                        {[
                            { label: "Total Categories", value: totalCategories, icon: "📂" },
                            { label: "Total Notes", value: totalNotes, icon: "📝" },
                            { label: "Most Popular", value: loading ? "..." : (mostPopular?.name || "N/A"), icon: "⭐" }
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
                                            className="text-base sm:text-lg lg:text-2xl font-bold mt-1 truncate max-w-[140px] sm:max-w-[180px] text-gray-800"
                                        >
                                            {stat.value}
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

                    {/* Search and Filter Bar - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-6 sm:mb-8"
                    >
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 16 16" fill="none">
                                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                {searchTerm && (
                                    <motion.button
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => setSearchTerm("")}
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
                                    <option value="popular">⭐ Most Popular</option>
                                    <option value="newest">🆕 Newest</option>
                                    <option value="alphabetical">🔤 Alphabetical</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Categories Grid - B&W SaaS Style with Demo Logos */}
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
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
                            >
                                {filteredAndSortedCategories.map((category, index) => {
                                    const icon = getCategoryIcon(category.icon);
                                    const color = getCategoryColor(category.icon);
                                    const barColor = getBarColor(category.icon);
                                    const noteCount = category.noteCount || 0;
                                    const percentage = Math.min((noteCount / 10) * 100, 100);

                                    // Demo logo for SaaS style
                                    const demoLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=4B5563&color=fff&size=80&bold=true&font-size=0.4`;

                                    return (
                                        <motion.div
                                            key={category._id}
                                            variants={fadeInUp}
                                            custom={index}
                                            {...cardHover}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => handleCategoryClick(category._id)}
                                            className="group relative bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 lg:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                                        >
                                            {/* Hover gradient background */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-br from-gray-50/0 via-gray-100/0 to-gray-200/0 group-hover:from-gray-50/40 group-hover:via-gray-100/30 group-hover:to-gray-200/20 transition-all duration-700"
                                                initial={false}
                                            />

                                            {/* Border glow effect */}
                                            <motion.div
                                                className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent group-hover:border-gray-400/40 transition-all duration-300 pointer-events-none"
                                                initial={false}
                                            />

                                            <div className="relative">
                                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                                    {/* Demo Logo - SaaS Style */}
                                                    <motion.div
                                                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shadow-md flex-shrink-0"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        <img
                                                            src={demoLogo}
                                                            alt={category.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                        {/* Overlay icon */}
                                                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 flex items-center justify-center">
                                                            <span className="text-2xl sm:text-3xl opacity-90">{icon}</span>
                                                        </div>
                                                    </motion.div>

                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        className="flex items-center gap-1 sm:gap-1.5 bg-gray-100/80 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full group-hover:bg-gray-200 transition-colors duration-300"
                                                    >
                                                        <span className="text-[10px] sm:text-xs font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                                                            {noteCount}
                                                        </span>
                                                        <span className="text-[10px] sm:text-xs text-gray-400 group-hover:text-gray-500 transition-colors">
                                                            notes
                                                        </span>
                                                    </motion.div>
                                                </div>

                                                <motion.h3
                                                    className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors mb-1 sm:mb-1.5 truncate"
                                                >
                                                    {category.name}
                                                </motion.h3>

                                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2 group-hover:text-gray-600 transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
                                                    {category.description || "Explore resources in this category"}
                                                </p>

                                                {/* View button on hover - SaaS Style */}
                                                <motion.div
                                                    className="mt-3 sm:mt-4 flex items-center text-[10px] sm:text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                                                >
                                                    <span>Browse notes</span>
                                                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 sm:ml-1.5 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 16 16" fill="none">
                                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </motion.div>

                                                {/* Click hint - SaaS Style */}
                                                <motion.div
                                                    className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    initial={{ x: -10 }}
                                                    whileHover={{ x: 0 }}
                                                >
                                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
                                                        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </motion.div>

                                                {/* Animated note count bar - B&W */}
                                                <motion.div
                                                    className="mt-3 sm:mt-4 w-full h-1 bg-gray-100 rounded-full overflow-hidden"
                                                    initial={false}
                                                >
                                                    <motion.div
                                                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${percentage}%`
                                                        }}
                                                        transition={{
                                                            duration: 1.2,
                                                            delay: 0.2 + (index * 0.05),
                                                            ease: "easeOut"
                                                        }}
                                                    />
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count - B&W Theme */}
                    {!loading && filteredAndSortedCategories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-[10px] sm:text-xs text-gray-400">
                                Showing {filteredAndSortedCategories.length} of {totalCategories} categories
                                {searchTerm && ` matching "${searchTerm}"`}
                            </p>
                        </motion.div>
                    )}

                    {/* Footer - B&W Theme */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 sm:mt-10 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            NotesSaver Categories • {new Date().getFullYear()}
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

export default Categories;