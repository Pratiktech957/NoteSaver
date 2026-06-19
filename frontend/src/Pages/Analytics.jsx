import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    LineChart,
    Line,
    CartesianGrid
} from "recharts";

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

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:5000/api/admin/analytics",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setStats(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Prepare chart data
    const barData = [
        { name: "Users", value: stats?.totalUsers || 0, color: "#6366f1" },
        { name: "Notes", value: stats?.totalNotes || 0, color: "#10b981" },
        { name: "Reports", value: stats?.totalReports || 0, color: "#ef4444" }
    ];

    const pieData = [
        { name: "Views", value: stats?.totalViews || 0 },
        { name: "Downloads", value: stats?.totalDownloads || 0 }
    ];

    // Sample growth data (dummy)
    const growthData = [
        { month: "Jan", users: 120, notes: 80 },
        { month: "Feb", users: 180, notes: 120 },
        { month: "Mar", users: 220, notes: 160 },
        { month: "Apr", users: 280, notes: 210 },
        { month: "May", users: 340, notes: 260 },
        { month: "Jun", users: 400, notes: 320 }
    ];

    const COLORS = ["#6366f1", "#10b981"];

    // Stat cards
    const statCards = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: "👥", color: "indigo" },
        { label: "Total Notes", value: stats?.totalNotes || 0, icon: "📚", color: "emerald" },
        { label: "Reports", value: stats?.totalReports || 0, icon: "🚨", color: "red" },
        { label: "Total Views", value: stats?.totalViews || 0, icon: "👁️", color: "violet" },
        { label: "Downloads", value: stats?.totalDownloads || 0, icon: "⬇️", color: "amber" }
    ];

    const getColorClass = (color) => {
        const map = {
            indigo: "bg-indigo-50 text-indigo-600",
            emerald: "bg-emerald-50 text-emerald-600",
            red: "bg-red-50 text-red-600",
            violet: "bg-violet-50 text-violet-600",
            amber: "bg-amber-50 text-amber-600"
        };
        return map[color] || map.indigo;
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="space-y-6">
                        <div className="h-12 bg-slate-200 rounded w-64 animate-pulse"></div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
                                    <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                                    <div className="h-8 bg-slate-200 rounded w-16"></div>
                                </div>
                            ))}
                        </div>
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
                                <div className="h-8 bg-slate-200 rounded w-48 mb-4"></div>
                                <div className="h-64 bg-slate-200 rounded"></div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse">
                                <div className="h-8 bg-slate-200 rounded w-48 mb-4"></div>
                                <div className="h-64 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <LoadingSkeleton />;
    }

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
                                Analytics
                            </span>
                        </div>
                        <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                            Analytics Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5">
                            Business intelligence and platform performance metrics.
                        </p>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                    >
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index + 1}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl ${getColorClass(stat.color)} flex items-center justify-center text-xl`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts Grid */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        {/* Bar Chart */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={6}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    📊 Platform Overview
                                </h2>
                                <span className="text-xs text-slate-400">Bar Chart</span>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={barData}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "12px"
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="value"
                                        name="Count"
                                        radius={[8, 8, 0, 0]}
                                    >
                                        {barData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Pie Chart */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={7}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    🥧 Engagement Distribution
                                </h2>
                                <span className="text-xs text-slate-400">Pie Chart</span>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={120}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "12px"
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Growth Chart */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={8}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 mb-8"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-slate-900">
                                📈 Platform Growth Trend
                            </h2>
                            <span className="text-xs text-slate-400">Last 6 Months</span>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        padding: "12px"
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    name="Users"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={{ fill: "#6366f1", r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="notes"
                                    name="Notes"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: "#10b981", r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Platform Overview Card */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={9}
                        className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl shadow-xl p-8"
                    >
                        <div className="relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">🚀</span>
                                    <h2 className="text-2xl font-bold text-white">Platform Health</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-indigo-200 text-sm">Total Users</p>
                                        <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-sm">Total Notes</p>
                                        <p className="text-2xl font-bold text-white">{stats?.totalNotes || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-sm">Reports</p>
                                        <p className="text-2xl font-bold text-white">{stats?.totalReports || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-sm">Views</p>
                                        <p className="text-2xl font-bold text-white">{stats?.totalViews || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-sm">Downloads</p>
                                        <p className="text-2xl font-bold text-white">{stats?.totalDownloads || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-sm">Status</p>
                                        <p className="text-xl font-bold text-emerald-300">🟢 Operational</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={10}
                        className="mt-8 text-center"
                    >
                        <p className="text-xs text-slate-400">
                            NotesSaver Analytics • Data updated in real-time • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Analytics;