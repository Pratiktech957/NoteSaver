import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
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
            delay: i * 0.08,
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

const scaleOnHover = {
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            duration: 0.2,
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

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalNotes: 0,
        totalReports: 0,
        activeUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [systemStatus, setSystemStatus] = useState({
        database: "Online",
        storage: "72% Used",
        api: "Operational",
        uptime: "99.9%"
    });

    // EXACT SAME useEffect - NO CHANGES
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get("/admin/stats");
                setStats({
                    totalUsers: res.data.totalUsers || 0,
                    totalNotes: res.data.totalNotes || 0,
                    totalReports: res.data.totalReports || 0,
                    activeUsers: res.data.activeUsers || 0
                });

                try {
                    const activityRes = await API.get("/admin/activity");
                    setRecentActivity(activityRes.data.activities || [
                        { type: "User", action: "Joined", name: "John Doe", time: "2 min ago" },
                        { type: "Note", action: "Uploaded", name: "Physics Notes", time: "15 min ago" },
                        { type: "Report", action: "Submitted", name: "Inappropriate Content", time: "1 hour ago" },
                        { type: "User", action: "Updated", name: "Jane Smith", time: "3 hours ago" }
                    ]);
                } catch (error) {
                    console.error("Failed to fetch activity:", error);
                    setRecentActivity([
                        { type: "User", action: "Joined", name: "John Doe", time: "2 min ago" },
                        { type: "Note", action: "Uploaded", name: "Physics Notes", time: "15 min ago" },
                        { type: "Report", action: "Submitted", name: "Inappropriate Content", time: "1 hour ago" },
                        { type: "User", action: "Updated", name: "Jane Smith", time: "3 hours ago" }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // EXACT SAME statCards - NO CHANGES
    const statCards = [
        { label: "Total Users", value: stats.totalUsers, icon: "👥" },
        { label: "Total Notes", value: stats.totalNotes, icon: "📚" },
        { label: "Reports", value: stats.totalReports, icon: "🚨" },
        { label: "Active Users", value: stats.activeUsers, icon: "🟢" }
    ];

    // EXACT SAME quickActions - NO CHANGES
    const quickActions = [
        { label: "Manage Users", icon: "👥", path: "/admin/users", description: "View & manage users" },
        { label: "Manage Notes", icon: "📚", path: "/admin/notes", description: "View & manage notes" },
        { label: "Review Reports", icon: "🚨", path: "/admin/reports", description: "Handle user reports" },
        { label: "Analytics", icon: "📊", path: "/admin/analytics", description: "View platform insights" }
    ];

    // Loading skeleton with shimmer - B&W theme
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 mb-2"></div>
                                <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // B&W color classes
    const getCardGradient = (index) => {
        const gradients = [
            "from-gray-50 to-gray-100/50 border-gray-200",
            "from-gray-50 to-gray-100/50 border-gray-200",
            "from-gray-50 to-gray-100/50 border-gray-200",
            "from-gray-50 to-gray-100/50 border-gray-200"
        ];
        return gradients[index] || gradients[0];
    };

    const getIconBg = (index) => {
        const colors = [
            "bg-gray-100 text-gray-700",
            "bg-gray-100 text-gray-700",
            "bg-gray-100 text-gray-700",
            "bg-gray-100 text-gray-700"
        ];
        return colors[index] || colors[0];
    };

    const getActionGradient = (index) => {
        const gradients = [
            "from-gray-700 to-gray-800",
            "from-gray-700 to-gray-800",
            "from-gray-700 to-gray-800",
            "from-gray-700 to-gray-800"
        ];
        return gradients[index] || gradients[0];
    };

    const getHoverBg = (index) => {
        const colors = [
            "hover:bg-gray-50",
            "hover:bg-gray-50",
            "hover:bg-gray-50",
            "hover:bg-gray-50"
        ];
        return colors[index] || colors[0];
    };

    const getActivityColor = (type) => {
        const map = {
            "User": "border-gray-400 bg-gray-50",
            "Note": "border-gray-400 bg-gray-50",
            "Report": "border-gray-400 bg-gray-50",
            "Update": "border-gray-400 bg-gray-50"
        };
        return map[type] || "border-gray-400 bg-gray-50";
    };

    const getActivityIcon = (type) => {
        const map = {
            "User": "👤",
            "Note": "📝",
            "Report": "🚨",
            "Update": "🔄"
        };
        return map[type] || "📌";
    };

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

                    {/* Dashboard Header - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl mb-6 sm:mb-8 mt-12 lg:mt-0"
                    >
                        {/* Decorative elements */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute top-0 right-0 w-40 sm:w-48 md:w-64 h-40 sm:h-48 md:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 2
                            }}
                            className="absolute bottom-0 left-0 w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"
                        />

                        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-7 lg:py-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-white/10 mb-2 sm:mb-3"
                                    >
                                        <motion.span
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                                        />
                                        Admin Panel
                                    </motion.span>
                                    <motion.h1
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-xl sm:text-2xl lg:text-3xl font-bold text-white"
                                    >
                                        Welcome back, {user?.name || "Admin"}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-gray-300 text-xs sm:text-sm mt-1"
                                    >
                                        Here's what's happening with your platform today.
                                    </motion.p>
                                </div>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-wrap items-center gap-2 sm:gap-3"
                                >
                                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/10">
                                        <span className="text-[10px] sm:text-sm text-white/80">Status:</span>
                                        <motion.span
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-emerald-300"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Online
                                        </motion.span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={logout}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-[10px] sm:text-sm font-medium hover:bg-white/20 transition-all"
                                    >
                                        Logout
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards - B&W Theme */}
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
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
                                    className={`bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                                >
                                    <motion.div
                                        className="flex items-center justify-between"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                    >
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
                                                className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1"
                                            >
                                                {stat.value}
                                            </motion.p>
                                        </div>
                                        <motion.div
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0`}
                                        >
                                            {stat.icon}
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Quick Actions - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={5}
                        className="mb-6 sm:mb-8"
                    >
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h2>
                            <span className="text-[10px] sm:text-xs text-gray-400">Manage your platform</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {quickActions.map((action, index) => (
                                <Link key={action.label} to={action.path}>
                                    <motion.div
                                        variants={scaleOnHover}
                                        initial="initial"
                                        whileHover="hover"
                                        whileTap="tap"
                                        custom={index}
                                        className={`relative overflow-hidden bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-gray-50`}
                                    >
                                        <motion.div
                                            className="relative"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.05 + 0.5 }}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <motion.div
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{ duration: 0.6 }}
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-800 flex items-center justify-center text-white text-lg sm:text-xl shadow-md flex-shrink-0`}
                                                >
                                                    {action.icon}
                                                </motion.div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                                        {action.label}
                                                    </h3>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.div
                                                className="absolute top-2 sm:top-3 right-2 sm:right-3"
                                                initial={{ opacity: 0, x: -10 }}
                                                whileHover={{ opacity: 1, x: 0 }}
                                            >
                                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
                                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Admin Profile & Recent Activity - B&W Theme */}
                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Admin Profile */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={6}
                            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Admin Profile</h2>
                            </div>

                            <div className="px-4 sm:px-6 py-4 sm:py-5">
                                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-800 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg flex-shrink-0"
                                    >
                                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                        <motion.h3
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="font-bold text-gray-900 text-sm sm:text-base truncate"
                                        >
                                            {user?.name || "Admin User"}
                                        </motion.h3>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                                                {user?.role || "Admin"}
                                            </span>
                                            <motion.span
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full"
                                            >
                                                ● Active
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-400">Last Login</p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-700">Today, 10:30 AM</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-400">Account Status</p>
                                        <p className="text-xs sm:text-sm font-medium text-emerald-600">Verified</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={7}
                            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Recent Activity</h2>
                            </div>

                            <div className="px-4 sm:px-6 py-4 sm:py-5 max-h-72 overflow-y-auto">
                                <div className="space-y-3 sm:space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-start gap-3 sm:gap-4"
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 + 0.5 }}
                                            whileHover={{
                                                x: 5,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.2 }}
                                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 ${index === 0 ? "bg-emerald-500" :
                                                    index === 1 ? "bg-blue-500" :
                                                        index === 2 ? "bg-red-500" :
                                                            "bg-gray-500"
                                                    }`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium text-gray-800">
                                                    <span className="font-semibold">{activity.type}</span>
                                                    <span className="font-normal text-gray-600"> {activity.action}</span>
                                                    <span className="font-medium text-gray-800"> {activity.name}</span>
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{activity.time}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* System Status - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={8}
                        className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1v3M8 11v3M1 8h3M12 8h3M2.5 2.5l2 2M11.5 11.5l2 2M2.5 13.5l2-2M11.5 4.5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-xs sm:text-sm font-semibold text-gray-800">System Status</h2>
                            </div>
                            <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                All Systems Operational
                            </motion.span>
                        </div>

                        <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            {Object.entries(systemStatus).map(([key, value], index) => (
                                <motion.div
                                    key={key}
                                    className="text-center"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 + 0.6 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <p className="text-[10px] sm:text-xs text-gray-400 capitalize">{key}</p>
                                    <motion.p
                                        className="text-xs sm:text-sm font-medium text-gray-700"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                                    >
                                        {value}
                                    </motion.p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Footer - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={9}
                        className="mt-6 sm:mt-8 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            NotesSaver Admin Panel v2.0 • {new Date().getFullYear()}
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

export default AdminDashboard;