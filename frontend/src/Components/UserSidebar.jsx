import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const UserSidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", path: "/dashboard", icon: "🏠" },
        { name: "Upload Notes", path: "/upload", icon: "⬆️" },
        { name: "All Notes", path: "/notes", icon: "📚" },
        { name: "My Notes", path: "/my-notes", icon: "📝" },
        { name: "Categories", path: "/categories", icon: "📂" },
        { name: "Notifications", path: "/notifications", icon: "🔔" },
        { name: "Profile", path: "/profile", icon: "👤" },
        { name: "Settings", path: "/settings", icon: "⚙️" }
    ];

    // Check if path is active (supports nested routes)
    const isActive = (path) => {
        if (path === "/dashboard") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-64 min-h-screen bg-white border-r border-slate-200/80 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)] flex flex-col sticky top-0"
        >
            {/* Brand Section */}
            <div className="px-5 py-6 border-b border-slate-100">
                <Link to="/dashboard" className="block">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                                NotesSaver
                            </h1>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                Knowledge Platform
                            </p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4 overflow-y-auto">
                <div className="space-y-6">
                    {/* Main Menu */}
                    <div>
                        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Main
                        </p>
                        <div className="space-y-1">
                            {menuItems.slice(0, 4).map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link key={item.path} to={item.path}>
                                        <motion.div
                                            whileHover={{ x: active ? 0 : 4 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                                    ? "bg-slate-900 text-white shadow-[0_2px_8px_0_rgba(0,0,0,0.12)]"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                }`}
                                        >
                                            <span className="text-base flex-shrink-0 w-5 text-center">
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                            {active && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Menu */}
                    <div>
                        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Content
                        </p>
                        <div className="space-y-1">
                            {menuItems.slice(4, 6).map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link key={item.path} to={item.path}>
                                        <motion.div
                                            whileHover={{ x: active ? 0 : 4 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                                    ? "bg-slate-900 text-white shadow-[0_2px_8px_0_rgba(0,0,0,0.12)]"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                }`}
                                        >
                                            <span className="text-base flex-shrink-0 w-5 text-center">
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                            {active && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Account Menu */}
                    <div>
                        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Account
                        </p>
                        <div className="space-y-1">
                            {menuItems.slice(6).map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link key={item.path} to={item.path}>
                                        <motion.div
                                            whileHover={{ x: active ? 0 : 4 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                                    ? "bg-slate-900 text-white shadow-[0_2px_8px_0_rgba(0,0,0,0.12)]"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                }`}
                                        >
                                            <span className="text-base flex-shrink-0 w-5 text-center">
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                            {active && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="px-3 py-4 border-t border-slate-100">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4L2 8l4 4M2 8h9M13 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Logout
                </motion.button>
            </div>
        </motion.div>
    );
};

export default UserSidebar;