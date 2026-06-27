import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Animation variants
const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }),
    hover: {
        x: 6,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    }
};

const AdminSidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Menu items - EXACT SAME
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
            {/* Mobile toggle button - ENHANCED */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg border border-gray-200 p-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300"
                aria-label="Toggle sidebar"
            >
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 16 16" fill="none">
                    <path d="M2 3.5h12M2 8h12M2 12.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* Overlay for mobile - ENHANCED */}
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Sidebar - B&W Theme */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: isCollapsed ? -280 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed lg:sticky top-0 left-0 z-50 w-[280px] min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 flex flex-col shadow-2xl lg:translate-x-0 transition-shadow duration-300`}
            >
                {/* Logo Section - B&W Theme */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xl shadow-lg flex-shrink-0"
                    >
                        📚
                    </motion.div>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                            NotesSaver
                        </h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                            Admin Panel
                        </p>
                    </div>
                </div>

                {/* Navigation - B&W Theme */}
                <nav className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto">
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <motion.div
                                key={item.path}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={menuItemVariants}
                                whileHover="hover"
                            >
                                <Link
                                    to={item.path}
                                    onClick={() => setIsCollapsed(true)}
                                    className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 relative ${isActive
                                            ? "bg-white/10 text-white shadow-lg"
                                            : "hover:bg-white/5 text-gray-300 hover:text-white"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-8 bg-white rounded-r-full"
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                    <span className="text-base sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                                        {item.icon}
                                    </span>
                                    <span className="font-medium text-xs sm:text-sm truncate">
                                        {item.name}
                                    </span>
                                    {isActive && (
                                        <span className="ml-auto text-[10px] bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                                            Active
                                        </span>
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Logout Button - B&W Theme */}
                <div className="pt-4 sm:pt-6 mt-4 border-t border-white/10">
                    <motion.button
                        onClick={logout}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 font-medium text-xs sm:text-sm group"
                    >
                        <span className="text-base sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">🚪</span>
                        <span className="truncate">Logout</span>
                    </motion.button>
                    <p className="text-[10px] text-gray-500 text-center mt-3">
                        v2.0 • Secure Session
                    </p>
                </div>

                {/* Decorative elements - B&W Theme */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-gray-600/10 to-gray-400/10 rounded-full blur-2xl -z-10" />
                <div className="absolute top-1/2 left-0 w-16 h-16 bg-gray-600/5 rounded-full blur-2xl -z-10" />
            </motion.aside>
        </>
    );
};

export default AdminSidebar;