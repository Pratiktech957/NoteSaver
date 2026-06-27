import { useEffect, useState, useMemo } from "react";
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
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
        scale: 0.95,
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
const DeleteModal = ({ isOpen, onClose, onConfirm, userName }) => {
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
                        Delete User?
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-xs sm:text-sm text-gray-500 text-center"
                    >
                        Are you sure you want to delete "<span className="font-medium text-gray-700">{userName}</span>"?
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

// Animation for status indicators
const pulseStatus = {
    animate: {
        scale: [1, 1.2, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [error, setError] = useState(null);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME fetchUsers - NO CHANGES
    const fetchUsers = async () => {
        try {
            setError(null);
            const res = await API.get("/admin/users");
            setUsers(res.data.users || []);
        } catch (error) {
            console.error("FETCH USERS ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    // EXACT SAME useEffect - NO CHANGES
    useEffect(() => {
        fetchUsers();
    }, []);

    // EXACT SAME handleBlock - NO CHANGES
    const handleBlock = async (id) => {
        try {
            setActionLoading(id);
            await API.put(`/admin/block/${id}`);
            await fetchUsers();
        } catch (error) {
            console.error("BLOCK USER ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to update user status");
        } finally {
            setActionLoading(null);
        }
    };

    // EXACT SAME handleDelete - NO CHANGES
    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            setActionLoading(userToDelete._id);
            await API.delete(`/admin/user/${userToDelete._id}`);
            setDeleteModalOpen(false);
            setUserToDelete(null);
            await fetchUsers();
        } catch (error) {
            console.error("DELETE USER ERROR:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Failed to delete user");
        } finally {
            setActionLoading(null);
        }
    };

    // EXACT SAME filteredUsers - NO CHANGES
    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    // EXACT SAME statistics - NO CHANGES
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isBlocked).length;
    const blockedUsers = users.filter(u => u.isBlocked).length;
    const adminUsers = users.filter(u => u.role === "admin").length;

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
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div>
                                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
                                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-40 sm:w-64"></div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="h-9 sm:h-10 bg-gray-200 rounded-xl w-20 sm:w-24"></div>
                                <div className="h-9 sm:h-10 bg-gray-200 rounded-xl w-20 sm:w-24"></div>
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
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
                <span className="text-4xl sm:text-5xl">👥</span>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {search ? "No matching users" : "No Users Found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {search ? "Try adjusting your search terms." : "Users will appear here once they register."}
            </p>
        </motion.div>
    );

    // Stat cards data - B&W Theme
    const statCards = [
        { label: "Total Users", value: totalUsers, icon: "👥" },
        { label: "Active", value: activeUsers, icon: "🟢" },
        { label: "Blocked", value: blockedUsers, icon: "🔴" },
        { label: "Admins", value: adminUsers, icon: "👑" }
    ];

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
                                {totalUsers} Users
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
                                    User Management
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xs sm:text-sm text-gray-500 mt-1.5"
                                >
                                    Manage all users across the platform • {totalUsers} total users
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-200 shadow-sm flex-shrink-0"
                            >
                                <span className="font-medium text-gray-700">{totalUsers}</span>
                                <span>Users</span>
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
                        {statCards.map((stat, index) => (
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
                                            className={`text-lg sm:text-xl lg:text-2xl font-bold mt-1 text-gray-900`}
                                        >
                                            {loading ? "..." : stat.value}
                                        </motion.p>
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0`}
                                    >
                                        <span className="text-base sm:text-lg">{stat.icon}</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Search Bar - B&W Theme */}
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
                                    placeholder="Search by name or email..."
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
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center text-xs sm:text-sm text-gray-400 bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-gray-200 flex-shrink-0"
                            >
                                <span className="font-medium text-gray-700 mr-1">{filteredUsers.length}</span>
                                results
                            </motion.div>
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

                    {/* Users List - B&W Theme */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <LoadingSkeleton key="loading" />
                        ) : filteredUsers.length === 0 ? (
                            <EmptyState key="empty" />
                        ) : (
                            <motion.div
                                key="users"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-3 sm:space-y-4"
                            >
                                {filteredUsers.map((user, index) => (
                                    <motion.div
                                        key={user._id}
                                        variants={fadeInUp}
                                        custom={index}
                                        whileHover={{
                                            y: -4,
                                            transition: { duration: 0.2 }
                                        }}
                                        className={`bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${user.isBlocked ? "bg-gradient-to-r from-gray-50/30 to-white" : ""
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${user.role === "admin"
                                                            ? "bg-gray-800"
                                                            : "bg-gray-700"
                                                            }`}
                                                    >
                                                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                    </motion.div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                            {user.name}
                                                            {user.role === "admin" && (
                                                                <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                                                    <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${user.role === "admin"
                                                        ? "bg-gray-100 text-gray-700"
                                                        : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                        {user.role === "admin" ? "👑" : "👤"} {user.role}
                                                    </span>
                                                    <motion.span
                                                        {...pulseStatus}
                                                        animate={user.isBlocked ? undefined : "animate"}
                                                        className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${user.isBlocked
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-emerald-50 text-emerald-700"
                                                            }`}
                                                    >
                                                        {user.isBlocked ? "🔴 Blocked" : "🟢 Active"}
                                                    </motion.span>
                                                    {user.isVerified && (
                                                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                                                            ✅ Verified
                                                        </span>
                                                    )}
                                                    {user.createdAt && (
                                                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium bg-gray-50 text-gray-600 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                                                            📅 Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleBlock(user._id)}
                                                    disabled={actionLoading === user._id}
                                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${user.isBlocked
                                                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800"
                                                        : "bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800"
                                                        }`}
                                                >
                                                    {actionLoading === user._id ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg className="animate-spin w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                                            </svg>
                                                            Loading
                                                        </span>
                                                    ) : (
                                                        user.isBlocked ? "🔓 Unblock" : "🔒 Block"
                                                    )}
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setDeleteModalOpen(true);
                                                    }}
                                                    disabled={actionLoading === user._id}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-xl text-[10px] sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    🗑️ Delete
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results count - B&W Theme */}
                    {!loading && filteredUsers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-[10px] sm:text-xs text-gray-400">
                                Showing {filteredUsers.length} of {users.length} users
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
                            setUserToDelete(null);
                        }}
                        onConfirm={handleDelete}
                        userName={userToDelete?.name}
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

export default AdminUsers;