import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useState } from "react";

const AdminSidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin",
            icon: "🏠"
        },
        {
            name: "Manage Users",
            path: "/admin/users",
            icon: "👥"
        },
        {
            name: "Manage Notes",
            path: "/admin/notes",
            icon: "📚"
        },
        {
            name: "Categories",
            path: "/admin/categories",
            icon: "📂"
        },
        {
            name: "Reports",
            path: "/admin/reports",
            icon: "🚨"
        },
        {
            name: "Analytics",
            path: "/admin/analytics",
            icon: "📊"
        },
        {
            name: "Notifications",
            path: "/admin/notifications",
            icon: "🔔"
        }
    ];

    return (
        <>
            {/* Toggle button for mobile */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-200"
            >
                <svg className="w-5 h-5 text-slate-700" viewBox="0 0 16 16" fill="none">
                    <path d="M2 3.5h12M2 8h12M2 12.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* Overlay for mobile */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: isCollapsed ? -280 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed lg:sticky top-0 left-0 z-50 w-72 min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col shadow-2xl lg:translate-x-0 transition-shadow duration-300`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
                        📚
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            NotesSaver
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsCollapsed(true)}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${isActive
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "hover:bg-white/5 text-slate-300 hover:text-white"
                                    }`}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                                <span className="text-xl group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm">
                                    {item.name}
                                </span>
                                {isActive && (
                                    <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="pt-6 mt-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 font-medium text-sm group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
                        Logout
                    </button>
                    <p className="text-[10px] text-slate-500 text-center mt-3">
                        v2.0 • Secure Session
                    </p>
                </div>

                {/* Decorative gradient */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl -z-10" />
            </motion.aside>
        </>
    );
};

export default AdminSidebar;