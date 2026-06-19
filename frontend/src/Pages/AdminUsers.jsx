import { useEffect, useState, useMemo } from "react";
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

// Delete Confirmation Modal with enhanced animations
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
                        Delete User?
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-sm text-slate-500 text-center"
                    >
                        Are you sure you want to delete "<span className="font-medium text-slate-700">{userName}</span>"?
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

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    // Statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isBlocked).length;
    const blockedUsers = users.filter(u => u.isBlocked).length;
    const adminUsers = users.filter(u => u.role === "admin").length;

    // Loading skeleton with shimmer
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
                                <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-64 mb-3"></div>
                                <div className="flex gap-2">
                                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
                                <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
                            </div>
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
                <span className="text-5xl">👥</span>
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {search ? "No matching users" : "No Users Found"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {search ? "Try adjusting your search terms." : "Users will appear here once they register."}
            </p>
        </motion.div>
    );

    // Stat cards data
    const statCards = [
        { label: "Total Users", value: totalUsers, icon: "👥", color: "indigo", gradient: "from-indigo-500 to-indigo-600" },
        { label: "Active", value: activeUsers, icon: "🟢", color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
        { label: "Blocked", value: blockedUsers, icon: "🔴", color: "red", gradient: "from-red-500 to-red-600" },
        { label: "Admins", value: adminUsers, icon: "👑", color: "violet", gradient: "from-violet-500 to-violet-600" }
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
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
                                    User Management
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-slate-500 mt-1.5"
                                >
                                    Manage all users across the platform • {totalUsers} total users
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm"
                            >
                                <span className="font-medium text-slate-700">{totalUsers}</span>
                                <span>Users</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {statCards.map((stat, index) => (
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

                    {/* Search Bar */}
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
                                    placeholder="Search by name or email..."
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
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center text-sm text-slate-400 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200"
                            >
                                <span className="font-medium text-slate-700 mr-1">{filteredUsers.length}</span>
                                results
                            </motion.div>
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

                    {/* Users List */}
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
                                className="space-y-4"
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
                                        className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-xl transition-all duration-300 ${user.isBlocked ? "bg-gradient-to-r from-red-50/30 to-white" : ""
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${user.role === "admin"
                                                            ? "bg-gradient-to-br from-violet-500 to-purple-600"
                                                            : "bg-gradient-to-br from-indigo-500 to-indigo-600"
                                                            }`}
                                                    >
                                                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                    </motion.div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-slate-900 truncate">
                                                            {user.name}
                                                            {user.role === "admin" && (
                                                                <span className="ml-2 text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${user.role === "admin"
                                                        ? "bg-violet-50 text-violet-700"
                                                        : "bg-indigo-50 text-indigo-700"
                                                        }`}>
                                                        {user.role === "admin" ? "👑" : "👤"} {user.role}
                                                    </span>
                                                    <motion.span
                                                        {...pulseStatus}
                                                        animate={user.isBlocked ? undefined : "animate"}
                                                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${user.isBlocked
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-emerald-50 text-emerald-700"
                                                            }`}
                                                    >
                                                        {user.isBlocked ? "🔴 Blocked" : "🟢 Active"}
                                                    </motion.span>
                                                    {user.isVerified && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                                                            ✅ Verified
                                                        </span>
                                                    )}
                                                    {user.createdAt && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full">
                                                            📅 Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleBlock(user._id)}
                                                    disabled={actionLoading === user._id}
                                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${user.isBlocked
                                                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800"
                                                        : "bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800"
                                                        }`}
                                                >
                                                    {actionLoading === user._id ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
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
                                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Results count */}
                    {!loading && filteredUsers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-slate-400">
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
        </div>
    );
};

export default AdminUsers;