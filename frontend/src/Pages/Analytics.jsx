import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../Components/AdminSidebar";
import API from "../services/api";
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
    CartesianGrid,
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ComposedChart
} from "recharts";

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
            staggerChildren: 0.08,
            delayChildren: 0.2
        }
    }
};

// Animation for stat cards
const scaleOnHover = {
    hover: {
        scale: 1.03,
        y: -6,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
        scale: 0.97,
        transition: { duration: 0.1 }
    }
};

// Animation for numbers
const countUp = {
    initial: { scale: 0.5, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
        }
    }
};

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState("6months");
    const [activeChart, setActiveChart] = useState("overview");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setError(null);
                const res = await API.get("/admin/analytics");
                setStats(res.data);
            } catch (error) {
                console.error("FETCH ANALYTICS ERROR:", error.response?.data || error.message);
                setError(error.response?.data?.message || "Failed to fetch analytics data");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Prepare chart data with real values
    const barData = [
        { name: "Users", value: stats?.totalUsers || 0, color: "#6366f1", gradient: "url(#userGradient)" },
        { name: "Notes", value: stats?.totalNotes || 0, color: "#10b981", gradient: "url(#noteGradient)" },
        { name: "Reports", value: stats?.totalReports || 0, color: "#ef4444", gradient: "url(#reportGradient)" },
        { name: "Views", value: stats?.totalViews || 0, color: "#8b5cf6", gradient: "url(#viewGradient)" },
        { name: "Downloads", value: stats?.totalDownloads || 0, color: "#f59e0b", gradient: "url(#downloadGradient)" }
    ];

    const pieData = [
        { name: "Views", value: stats?.totalViews || 0, icon: "👁️" },
        { name: "Downloads", value: stats?.totalDownloads || 0, icon: "⬇️" }
    ];

    // Enhanced growth data with more metrics
    const growthData = [
        { month: "Jan", users: 120, notes: 80, views: 1500, downloads: 450 },
        { month: "Feb", users: 180, notes: 120, views: 2100, downloads: 680 },
        { month: "Mar", users: 220, notes: 160, views: 2800, downloads: 920 },
        { month: "Apr", users: 280, notes: 210, views: 3500, downloads: 1200 },
        { month: "May", users: 340, notes: 260, views: 4200, downloads: 1500 },
        { month: "Jun", users: 400, notes: 320, views: 5100, downloads: 1900 }
    ];

    // Engagement metrics for radar chart
    const engagementData = [
        { subject: 'Users', value: stats?.totalUsers || 0, fullMark: 500 },
        { subject: 'Notes', value: stats?.totalNotes || 0, fullMark: 400 },
        { subject: 'Views', value: stats?.totalViews || 0, fullMark: 600 },
        { subject: 'Downloads', value: stats?.totalDownloads || 0, fullMark: 500 },
        { subject: 'Reports', value: stats?.totalReports || 0, fullMark: 100 }
    ];

    // Colors
    const COLORS = ["#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
    const PIE_COLORS = ["#6366f1", "#10b981"];

    // Stat cards with enhanced data
    const statCards = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: "👥", color: "indigo", growth: "+12%" },
        { label: "Total Notes", value: stats?.totalNotes || 0, icon: "📚", color: "emerald", growth: "+8%" },
        { label: "Reports", value: stats?.totalReports || 0, icon: "🚨", color: "red", growth: "-3%" },
        { label: "Total Views", value: stats?.totalViews || 0, icon: "👁️", color: "violet", growth: "+25%" },
        { label: "Downloads", value: stats?.totalDownloads || 0, icon: "⬇️", color: "amber", growth: "+18%" }
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

    const getGrowthColor = (growth) => {
        if (growth.startsWith('+')) return "text-emerald-600";
        if (growth.startsWith('-')) return "text-red-600";
        return "text-slate-600";
    };

    // Loading skeleton with enhanced shimmer
    const LoadingSkeleton = () => (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="space-y-6">
                        <div className="h-12 bg-slate-200 rounded w-64 animate-pulse"></div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 overflow-hidden">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                                        <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                                        <div className="h-8 bg-slate-200 rounded w-16"></div>
                                    </div>
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
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <AdminSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">

                    {/* Header with enhanced animation */}
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
                                Analytics
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
                                    Analytics Dashboard
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-slate-500 mt-1.5"
                                >
                                    Business intelligence and platform performance metrics.
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2"
                            >
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-50"
                                >
                                    <option value="7days">Last 7 Days</option>
                                    <option value="30days">Last 30 Days</option>
                                    <option value="6months">Last 6 Months</option>
                                    <option value="1year">Last Year</option>
                                </select>
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

                    {/* Statistics Cards with growth indicators */}
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
                                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {stat.label}
                                        </p>
                                        <motion.p
                                            {...countUp}
                                            className="text-2xl font-bold text-slate-900 mt-1"
                                        >
                                            {stat.value}
                                        </motion.p>
                                        <span className={`text-xs font-medium ${getGrowthColor(stat.growth)}`}>
                                            {stat.growth}
                                        </span>
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-10 h-10 rounded-xl ${getColorClass(stat.color)} flex items-center justify-center text-xl shadow-sm`}
                                    >
                                        {stat.icon}
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts Grid with Tab Navigation */}
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {["overview", "engagement", "growth", "radar"].map((chart) => (
                                <motion.button
                                    key={chart}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveChart(chart)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeChart === chart
                                            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200"
                                            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                                        }`}
                                >
                                    {chart === "overview" && "📊 Overview"}
                                    {chart === "engagement" && "🥧 Engagement"}
                                    {chart === "growth" && "📈 Growth"}
                                    {chart === "radar" && "🎯 Radar"}
                                </motion.button>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Bar Chart */}
                            {activeChart === "overview" && (
                                <>
                                    <motion.div
                                        variants={fadeInUp}
                                        initial="hidden"
                                        animate="visible"
                                        custom={6}
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                📊 Platform Overview
                                            </h2>
                                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                                Bar Chart
                                            </span>
                                        </div>
                                        <ResponsiveContainer width="100%" height={320}>
                                            <BarChart data={barData} layout="vertical">
                                                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#fff",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "12px",
                                                        padding: "12px",
                                                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                                                    }}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="value"
                                                    name="Count"
                                                    radius={[0, 8, 8, 0]}
                                                    fill="url(#colorGradient)"
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
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                🥧 Engagement Distribution
                                            </h2>
                                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                                Pie Chart
                                            </span>
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
                                                        <Cell
                                                            key={index}
                                                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                            stroke="#fff"
                                                            strokeWidth={2}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#fff",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "12px",
                                                        padding: "12px",
                                                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                                                    }}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                </>
                            )}

                            {/* Growth Chart */}
                            {activeChart === "growth" && (
                                <motion.div
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    custom={8}
                                    className="col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            📈 Platform Growth Trend
                                        </h2>
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                            Last 6 Months
                                        </span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={growthData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "12px",
                                                    padding: "12px",
                                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                                                }}
                                            />
                                            <Legend />
                                            <Area type="monotone" dataKey="views" name="Views" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.2} />
                                            <Line type="monotone" dataKey="users" name="Users" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 5 }} />
                                            <Line type="monotone" dataKey="notes" name="Notes" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} />
                                            <Line type="monotone" dataKey="downloads" name="Downloads" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {/* Radar Chart */}
                            {activeChart === "radar" && (
                                <motion.div
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    custom={8}
                                    className="col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-6 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            🎯 Engagement Radar
                                        </h2>
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                            Performance Metrics
                                        </span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <RadarChart data={engagementData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                                            <PolarRadiusAxis stroke="#94a3b8" />
                                            <Radar
                                                dataKey="value"
                                                name="Platform Metrics"
                                                stroke="#6366f1"
                                                fill="#6366f1"
                                                fillOpacity={0.4}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "12px",
                                                    padding: "12px",
                                                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                                                }}
                                            />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Platform Overview Card with animations */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={9}
                        className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl shadow-2xl p-8 overflow-hidden"
                    >
                        <div className="relative">
                            {/* Animated background elements */}
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

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.span
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="text-3xl"
                                    >
                                        🚀
                                    </motion.span>
                                    <h2 className="text-2xl font-bold text-white">Platform Health</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {[
                                        { label: "Total Users", value: stats?.totalUsers || 0 },
                                        { label: "Total Notes", value: stats?.totalNotes || 0 },
                                        { label: "Reports", value: stats?.totalReports || 0 },
                                        { label: "Views", value: stats?.totalViews || 0 },
                                        { label: "Downloads", value: stats?.totalDownloads || 0 },
                                        { label: "Status", value: "Operational", isStatus: true }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 + 0.5 }}
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                                        >
                                            <p className="text-indigo-200 text-sm">{item.label}</p>
                                            {item.isStatus ? (
                                                <motion.p
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-xl font-bold text-emerald-300"
                                                >
                                                    🟢 {item.value}
                                                </motion.p>
                                            ) : (
                                                <motion.p
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{
                                                        delay: index * 0.1 + 0.7,
                                                        type: "spring",
                                                        stiffness: 300
                                                    }}
                                                    className="text-2xl font-bold text-white"
                                                >
                                                    {item.value}
                                                </motion.p>
                                            )}
                                        </motion.div>
                                    ))}
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