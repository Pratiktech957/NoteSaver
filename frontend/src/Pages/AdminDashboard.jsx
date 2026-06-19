import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    const [systemStatus, setSystemStatus] = useState({
        database: "Online",
        storage: "72% Used",
        api: "Operational",
        uptime: "99.9%"
    });

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

                // Fetch recent activity from API
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
                    // Fallback to dummy data
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

    // Stats cards data with enhanced icons
    const statCards = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: "👥",
            color: "indigo",
            bgGradient: "from-indigo-50 to-indigo-100/50",
            borderColor: "border-indigo-200/50"
        },
        {
            label: "Total Notes",
            value: stats.totalNotes,
            icon: "📚",
            color: "emerald",
            bgGradient: "from-emerald-50 to-emerald-100/50",
            borderColor: "border-emerald-200/50"
        },
        {
            label: "Reports",
            value: stats.totalReports,
            icon: "🚨",
            color: "red",
            bgGradient: "from-red-50 to-red-100/50",
            borderColor: "border-red-200/50"
        },
        {
            label: "Active Users",
            value: stats.activeUsers,
            icon: "🟢",
            color: "violet",
            bgGradient: "from-violet-50 to-violet-100/50",
            borderColor: "border-violet-200/50"
        }
    ];

    // Quick actions data with enhanced paths
    const quickActions = [
        { label: "Manage Users", icon: "👥", path: "/admin/users", color: "indigo", description: "View & manage users" },
        { label: "Manage Notes", icon: "📚", path: "/admin/notes", color: "emerald", description: "View & manage notes" },
        { label: "Review Reports", icon: "🚨", path: "/admin/reports", color: "red", description: "Handle user reports" },
        { label: "Analytics", icon: "📊", path: "/admin/analytics", color: "violet", description: "View platform insights" }
    ];

    // Skeleton loader with shimmer effect
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 overflow-hidden"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                                <div className="h-8 bg-slate-200 rounded w-16"></div>
                            </div>
                            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // Get color classes with enhanced styling
    const getColorClass = (color) => {
        const map = {
            indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-200",
            emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200",
            red: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200",
            violet: "bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-violet-200"
        };
        return map[color] || map.indigo;
    };

    const getIconBgClass = (color) => {
        const map = {
            indigo: "bg-indigo-50 text-indigo-600",
            emerald: "bg-emerald-50 text-emerald-600",
            red: "bg-red-50 text-red-600",
            violet: "bg-violet-50 text-violet-600"
        };
        return map[color] || map.indigo;
    };

    const getHoverColor = (color) => {
        const map = {
            indigo: "hover:bg-indigo-50/50",
            emerald: "hover:bg-emerald-50/50",
            red: "hover:bg-red-50/50",
            violet: "hover:bg-violet-50/50"
        };
        return map[color] || map.indigo;
    };

    const getGradient = (color) => {
        const map = {
            indigo: "from-indigo-500 to-purple-600",
            emerald: "from-emerald-500 to-teal-600",
            red: "from-red-500 to-rose-600",
            violet: "from-violet-500 to-purple-600"
        };
        return map[color] || map.indigo;
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

    const getActivityColor = (type) => {
        const map = {
            "User": "border-emerald-500 bg-emerald-50",
            "Note": "border-indigo-500 bg-indigo-50",
            "Report": "border-red-500 bg-red-50",
            "Update": "border-violet-500 bg-violet-50"
        };
        return map[type] || "border-slate-500 bg-slate-50";
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <AdminSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">

                    {/* Dashboard Summary with Enhanced Animation */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl shadow-2xl mb-8"
                    >
                        {/* Animated background particles */}
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
                            className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"
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
                            className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"
                        />

                        <div className="relative px-8 py-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 mb-3"
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
                                        className="text-3xl font-bold text-white"
                                    >
                                        Welcome back, {user?.name || "Admin"}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-indigo-200 text-sm mt-1"
                                    >
                                        Here's what's happening with your platform today.
                                    </motion.p>
                                </div>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-sm text-white/80">Status:</span>
                                        <motion.span
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Online
                                        </motion.span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={logout}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-all"
                                    >
                                        Logout
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards with Enhanced Animations */}
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
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
                                    className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl border ${stat.borderColor} shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-xl transition-all duration-300 cursor-pointer`}
                                >
                                    <motion.div
                                        className="flex items-center justify-between"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                    >
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
                                                className="text-3xl font-bold text-slate-900 mt-1"
                                            >
                                                {stat.value}
                                            </motion.p>
                                        </div>
                                        <motion.div
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                            className={`w-12 h-12 rounded-2xl ${getIconBgClass(stat.color)} flex items-center justify-center text-2xl shadow-sm`}
                                        >
                                            {stat.icon}
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Quick Actions with Enhanced Cards */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={5}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                            <span className="text-xs text-slate-400">Manage your platform</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <Link key={action.label} to={action.path}>
                                    <motion.div
                                        variants={scaleOnHover}
                                        initial="initial"
                                        whileHover="hover"
                                        whileTap="tap"
                                        custom={index}
                                        className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${getHoverColor(action.color)}`}
                                    >
                                        <motion.div
                                            className="relative"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.05 + 0.5 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    whileHover={{ rotate: 360 }}
                                                    transition={{ duration: 0.6 }}
                                                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(action.color)} flex items-center justify-center text-white text-xl shadow-md`}
                                                >
                                                    {action.icon}
                                                </motion.div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 text-sm">
                                                        {action.label}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.div
                                                className="absolute top-3 right-3"
                                                initial={{ opacity: 0, x: -10 }}
                                                whileHover={{ opacity: 1, x: 0 }}
                                            >
                                                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 16 16" fill="none">
                                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Admin Profile & Recent Activity with Enhanced Animations */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Admin Profile */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={6}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-sm font-semibold text-slate-800">Admin Profile</h2>
                            </div>

                            <div className="px-6 py-5">
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg"
                                    >
                                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                                    </motion.div>
                                    <div>
                                        <motion.h3
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="font-bold text-slate-900"
                                        >
                                            {user?.name || "Admin User"}
                                        </motion.h3>
                                        <p className="text-sm text-slate-500">{user?.email || "admin@example.com"}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                {user?.role || "Admin"}
                                            </span>
                                            <motion.span
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                                            >
                                                ● Active
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-400">Last Login</p>
                                        <p className="text-sm font-medium text-slate-700">Today, 10:30 AM</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Account Status</p>
                                        <p className="text-sm font-medium text-emerald-600">Verified</p>
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
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 text-violet-600" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
                            </div>

                            <div className="px-6 py-5 max-h-72 overflow-y-auto">
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-start gap-4"
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
                                                className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? "bg-emerald-500" :
                                                    index === 1 ? "bg-indigo-500" :
                                                        index === 2 ? "bg-red-500" :
                                                            "bg-violet-500"
                                                    }`}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800">
                                                    <span className="font-semibold">{activity.type}</span>
                                                    <span className="font-normal text-slate-600"> {activity.action}</span>
                                                    <span className="font-medium text-slate-800"> {activity.name}</span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* System Status with Enhanced Animation */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={8}
                        className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1v3M8 11v3M1 8h3M12 8h3M2.5 2.5l2 2M11.5 11.5l2 2M2.5 13.5l2-2M11.5 4.5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-sm font-semibold text-slate-800">System Status</h2>
                            </div>
                            <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                All Systems Operational
                            </motion.span>
                        </div>

                        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(systemStatus).map(([key, value], index) => (
                                <motion.div
                                    key={key}
                                    className="text-center"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 + 0.6 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <p className="text-xs text-slate-400 capitalize">{key}</p>
                                    <motion.p
                                        className="text-sm font-medium text-emerald-600"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                                    >
                                        {value}
                                    </motion.p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={9}
                        className="mt-8 text-center"
                    >
                        <p className="text-xs text-slate-400">
                            NotesSaver Admin Panel v2.0 • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;