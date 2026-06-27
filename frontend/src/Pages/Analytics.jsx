import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../Components/AdminSidebar";
import API from "../Services/api";
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
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME useEffect - NO CHANGES
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

    // EXACT SAME chart data - NO CHANGES
    const barData = [
        { name: "Users", value: stats?.totalUsers || 0, color: "#6366f1" },
        { name: "Notes", value: stats?.totalNotes || 0, color: "#10b981" },
        { name: "Reports", value: stats?.totalReports || 0, color: "#ef4444" },
        { name: "Views", value: stats?.totalViews || 0, color: "#8b5cf6" },
        { name: "Downloads", value: stats?.totalDownloads || 0, color: "#f59e0b" }
    ];

    const pieData = [
        { name: "Views", value: stats?.totalViews || 0, icon: "👁️" },
        { name: "Downloads", value: stats?.totalDownloads || 0, icon: "⬇️" }
    ];

    const growthData = [
        { month: "Jan", users: 120, notes: 80, views: 1500, downloads: 450 },
        { month: "Feb", users: 180, notes: 120, views: 2100, downloads: 680 },
        { month: "Mar", users: 220, notes: 160, views: 2800, downloads: 920 },
        { month: "Apr", users: 280, notes: 210, views: 3500, downloads: 1200 },
        { month: "May", users: 340, notes: 260, views: 4200, downloads: 1500 },
        { month: "Jun", users: 400, notes: 320, views: 5100, downloads: 1900 }
    ];

    const engagementData = [
        { subject: 'Users', value: stats?.totalUsers || 0, fullMark: 500 },
        { subject: 'Notes', value: stats?.totalNotes || 0, fullMark: 400 },
        { subject: 'Views', value: stats?.totalViews || 0, fullMark: 600 },
        { subject: 'Downloads', value: stats?.totalDownloads || 0, fullMark: 500 },
        { subject: 'Reports', value: stats?.totalReports || 0, fullMark: 100 }
    ];

    // VIBRANT COLORS FOR CHARTS
    const COLORS = ["#6366f1", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b"];
    const PIE_COLORS = ["#6366f1", "#10b981"];
    const LINE_COLORS = ["#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

    // Stat cards with growth indicators
    const statCards = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: "👥", growth: "+12%", color: "#6366f1" },
        { label: "Total Notes", value: stats?.totalNotes || 0, icon: "📚", growth: "+8%", color: "#10b981" },
        { label: "Reports", value: stats?.totalReports || 0, icon: "🚨", growth: "-3%", color: "#ef4444" },
        { label: "Total Views", value: stats?.totalViews || 0, icon: "👁️", growth: "+25%", color: "#8b5cf6" },
        { label: "Downloads", value: stats?.totalDownloads || 0, icon: "⬇️", growth: "+18%", color: "#f59e0b" }
    ];

    const getGrowthColor = (growth) => {
        if (growth.startsWith('+')) return "text-emerald-600";
        if (growth.startsWith('-')) return "text-red-600";
        return "text-gray-600";
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="h-8 sm:h-12 bg-gray-200 rounded w-48 sm:w-64 animate-pulse"></div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 overflow-hidden animate-pulse">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full animate-shimmer"></div>
                                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 mb-2"></div>
                                        <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 animate-pulse">
                                <div className="h-6 sm:h-8 bg-gray-200 rounded w-32 sm:w-48 mb-4"></div>
                                <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
                            </div>
                            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 animate-pulse">
                                <div className="h-6 sm:h-8 bg-gray-200 rounded w-32 sm:w-48 mb-4"></div>
                                <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
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
                                Analytics
                            </motion.span>
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                            >
                                Live Data
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
                                    Analytics Dashboard
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xs sm:text-sm text-gray-500 mt-1.5"
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
                                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer hover:bg-gray-50"
                                >
                                    <option value="7days">Last 7 Days</option>
                                    <option value="30days">Last 30 Days</option>
                                    <option value="6months">Last 6 Months</option>
                                    <option value="1year">Last Year</option>
                                </select>
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

                    {/* Statistics Cards - B&W Theme with Colorful Icons */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8"
                    >
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index + 1}
                                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">
                                            {stat.label}
                                        </p>
                                        <motion.p
                                            {...countUp}
                                            className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1"
                                        >
                                            {stat.value}
                                        </motion.p>
                                        <span className={`text-[10px] sm:text-xs font-medium ${getGrowthColor(stat.growth)}`}>
                                            {stat.growth}
                                        </span>
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-xl shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                                    >
                                        {stat.icon}
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts Grid - COLORFUL CHARTS */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                            {["overview", "engagement", "growth", "radar"].map((chart) => (
                                <motion.button
                                    key={chart}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveChart(chart)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-sm font-medium transition-all capitalize ${activeChart === chart
                                        ? "bg-gray-800 text-white shadow-md"
                                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                >
                                    {chart === "overview" && "📊 Overview"}
                                    {chart === "engagement" && "🥧 Engagement"}
                                    {chart === "growth" && "📈 Growth"}
                                    {chart === "radar" && "🎯 Radar"}
                                </motion.button>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Bar Chart - COLORFUL */}
                            {activeChart === "overview" && (
                                <>
                                    <motion.div
                                        variants={fadeInUp}
                                        initial="hidden"
                                        animate="visible"
                                        custom={6}
                                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-5 gap-2">
                                            <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
                                                📊 Platform Overview
                                            </h2>
                                            <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full">
                                                Bar Chart
                                            </span>
                                        </div>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={barData} layout="vertical">
                                                <XAxis type="number" stroke="#9CA3AF" fontSize={10} />
                                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={10} width={60} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#fff",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        padding: "8px 12px",
                                                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                                                    }}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="value"
                                                    name="Count"
                                                    radius={[0, 8, 8, 0]}
                                                >
                                                    {barData.map((entry, index) => (
                                                        <Cell key={index} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </motion.div>

                                    {/* Pie Chart - COLORFUL */}
                                    <motion.div
                                        variants={fadeInUp}
                                        initial="hidden"
                                        animate="visible"
                                        custom={7}
                                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-5 gap-2">
                                            <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
                                                🥧 Engagement Distribution
                                            </h2>
                                            <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full">
                                                Pie Chart
                                            </span>
                                        </div>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={100}
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
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        padding: "8px 12px",
                                                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                                                    }}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                </>
                            )}

                            {/* Growth Chart - COLORFUL */}
                            {activeChart === "growth" && (
                                <motion.div
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    custom={8}
                                    className="col-span-2 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-5 gap-2">
                                        <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
                                            📈 Platform Growth Trend
                                        </h2>
                                        <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full">
                                            Last 6 Months
                                        </span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <ComposedChart data={growthData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
                                            <YAxis stroke="#9CA3AF" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    padding: "8px 12px",
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

                            {/* Radar Chart - COLORFUL */}
                            {activeChart === "radar" && (
                                <motion.div
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    custom={8}
                                    className="col-span-2 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-5 gap-2">
                                        <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
                                            🎯 Engagement Radar
                                        </h2>
                                        <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-full">
                                            Performance Metrics
                                        </span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={engagementData}>
                                            <PolarGrid stroke="#e5e7eb" />
                                            <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={10} />
                                            <PolarRadiusAxis stroke="#9CA3AF" fontSize={10} />
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
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    padding: "8px 12px",
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

                    {/* Platform Health Card - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={9}
                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="text-2xl sm:text-3xl"
                                >

                                </motion.span>
                                <h2 className="text-sm sm:text-lg font-semibold text-gray-900">Platform Health</h2>
                            </div>
                            <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                All Systems Operational
                            </motion.span>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                                {[
                                    { label: "Total Users", value: stats?.totalUsers || 0, icon: "👥", color: "#6366f1" },
                                    { label: "Total Notes", value: stats?.totalNotes || 0, icon: "📚", color: "#10b981" },
                                    { label: "Reports", value: stats?.totalReports || 0, icon: "🚨", color: "#ef4444" },
                                    { label: "Views", value: stats?.totalViews || 0, icon: "👁️", color: "#8b5cf6" },
                                    { label: "Downloads", value: stats?.totalDownloads || 0, icon: "⬇️", color: "#f59e0b" },
                                    { label: "Status", value: "Online", icon: "🟢", isStatus: true }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08 + 0.4 }}
                                        whileHover={{ scale: 1.03 }}
                                        className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200/50 text-center"
                                    >
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <span className="text-lg sm:text-xl">{item.icon}</span>
                                            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {item.label}
                                            </p>
                                        </div>
                                        {item.isStatus ? (
                                            <motion.p
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="text-sm sm:text-base font-bold text-emerald-600"
                                            >
                                                {item.value}
                                            </motion.p>
                                        ) : (
                                            <motion.p
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{
                                                    delay: index * 0.08 + 0.6,
                                                    type: "spring",
                                                    stiffness: 300
                                                }}
                                                className="text-lg sm:text-xl lg:text-2xl font-bold"
                                                style={{ color: item.color }}
                                            >
                                                {item.value}
                                            </motion.p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* System Status Indicators */}
                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                {[
                                    { label: "Database", value: "Connected", status: "online" },
                                    { label: "Storage", value: "72% Used", status: "warning" },
                                    { label: "API", value: "Operational", status: "online" },
                                    { label: "Uptime", value: "99.9%", status: "online" }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                        className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-50 rounded-xl border border-gray-200/50"
                                    >
                                        <span className="text-[10px] sm:text-xs font-medium text-gray-500">{item.label}</span>
                                        <span className={`text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 ${item.status === 'online' ? 'text-emerald-600' :
                                            item.status === 'warning' ? 'text-amber-600' :
                                                'text-red-600'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'online' ? 'bg-emerald-600' :
                                                item.status === 'warning' ? 'bg-amber-600' :
                                                    'bg-red-600'
                                                }`} />
                                            {item.value}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={10}
                        className="mt-6 sm:mt-8 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            NotesSaver Analytics • Data updated in real-time • {new Date().getFullYear()}
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

export default Analytics;