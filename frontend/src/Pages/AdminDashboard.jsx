import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminSidebar from "../Components/AdminSidebar";

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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:5000/api/admin/stats",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setStats({
                    totalUsers: res.data.totalUsers || 0,
                    totalNotes: res.data.totalNotes || 0,
                    totalReports: res.data.totalReports || 0,
                    activeUsers: res.data.activeUsers || 0
                });

                // Dummy recent activity data
                setRecentActivity([
                    { type: "User", action: "Joined", name: "John Doe", time: "2 min ago" },
                    { type: "Note", action: "Uploaded", name: "Physics Notes", time: "15 min ago" },
                    { type: "Report", action: "Submitted", name: "Inappropriate Content", time: "1 hour ago" },
                    { type: "User", action: "Updated", name: "Jane Smith", time: "3 hours ago" }
                ]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Stats cards data
    const statCards = [
        { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "indigo" },
        { label: "Total Notes", value: stats.totalNotes, icon: "📚", color: "emerald" },
        { label: "Reports", value: stats.totalReports, icon: "🚨", color: "red" },
        { label: "Active Users", value: stats.activeUsers, icon: "🟢", color: "violet" }
    ];

    // Quick actions data
    const quickActions = [
        { label: "Manage Users", icon: "👥", path: "/admin/users", color: "indigo" },
        { label: "Manage Notes", icon: "📚", path: "/admin/notes", color: "emerald" },
        { label: "Review Reports", icon: "🚨", path: "/admin/reports", color: "red" },
        { label: "Analytics", icon: "📊", path: "/admin/analytics", color: "violet" }
    ];

    // Skeleton loader
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                            <div className="h-8 bg-slate-200 rounded w-16"></div>
                        </div>
                        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Get color classes
    const getColorClass = (color) => {
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
            indigo: "hover:bg-indigo-50",
            emerald: "hover:bg-emerald-50",
            red: "hover:bg-red-50",
            violet: "hover:bg-violet-50"
        };
        return map[color] || map.indigo;
    };

    const getGradient = (color) => {
        const map = {
            indigo: "from-indigo-500 to-indigo-600",
            emerald: "from-emerald-500 to-emerald-600",
            red: "from-red-500 to-red-600",
            violet: "from-violet-500 to-violet-600"
        };
        return map[color] || map.indigo;
    };

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <AdminSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">

                    {/* Dashboard Summary */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl shadow-xl mb-8"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

                        <div className="relative px-8 py-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        Admin Panel
                                    </span>
                                    <h1 className="text-3xl font-bold text-white">
                                        Welcome back, {user?.name}
                                    </h1>
                                    <p className="text-indigo-200 text-sm mt-1">
                                        Here's what's happening with your platform today.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-sm text-white/80">Status:</span>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            Online
                                        </span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-all"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Statistics Cards */}
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
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {stat.label}
                                            </p>
                                            <p className="text-3xl font-bold text-slate-900 mt-1">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-2xl ${getColorClass(stat.color)} flex items-center justify-center text-2xl`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Quick Actions */}
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
                            {quickActions.map((action) => (
                                <Link key={action.label} to={action.path}>
                                    <motion.div
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${getHoverColor(action.color)}`}
                                    >
                                        <div className="relative">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(action.color)} flex items-center justify-center text-white text-xl shadow-md`}>
                                                    {action.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 text-sm">
                                                        {action.label}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 16 16" fill="none">
                                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Admin Profile & Recent Activity */}
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
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Admin Profile</h2>
                            </div>

                            <div className="px-6 py-5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{user?.name}</h3>
                                        <p className="text-sm text-slate-500">{user?.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                {user?.role || "Admin"}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                ● Active
                                            </span>
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
                                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-violet-600" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
                            </div>

                            <div className="px-6 py-5">
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? "bg-emerald-500" :
                                                index === 1 ? "bg-indigo-500" :
                                                    index === 2 ? "bg-red-500" :
                                                        "bg-violet-500"
                                                }`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800">
                                                    <span className="font-semibold">{activity.type}</span>
                                                    <span className="font-normal text-slate-600"> {activity.action}</span>
                                                    <span className="font-medium text-slate-800"> {activity.name}</span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* System Status */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={8}
                        className="mt-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1v3M8 11v3M1 8h3M12 8h3M2.5 2.5l2 2M11.5 11.5l2 2M2.5 13.5l2-2M11.5 4.5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">System Status</h2>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                All Systems Operational
                            </span>
                        </div>

                        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-xs text-slate-400">Database</p>
                                <p className="text-sm font-medium text-emerald-600">● Online</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400">Storage</p>
                                <p className="text-sm font-medium text-emerald-600">● 72% Used</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400">API</p>
                                <p className="text-sm font-medium text-emerald-600">● Operational</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400">Uptime</p>
                                <p className="text-sm font-medium text-emerald-600">● 99.9%</p>
                            </div>
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