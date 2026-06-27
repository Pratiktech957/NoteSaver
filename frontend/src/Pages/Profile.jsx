import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import UserSidebar from "../Components/UserSidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

// Mobile menu button component - B&W Theme
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

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME profile fields - NO CHANGES
    const profileFields = [
        { label: "Full Name", value: user?.name || "N/A", icon: "👤" },
        { label: "Email Address", value: user?.email || "N/A", icon: "📧" },
        { label: "Phone Number", value: user?.phone || "Not Added", icon: "📱" },
        { label: "Role", value: user?.role || "User", icon: "🎯" }
    ];

    // EXACT SAME handleEditProfile - NO CHANGES
    const handleEditProfile = () => {
        navigate("/settings");
    };

    // Get initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Get avatar URL - B&W Theme
    const getAvatarUrl = () => {
        if (user?.profileImage) {
            return user.profileImage;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4B5563&color=fff&size=200&bold=true&font-size=0.5`;
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
                <UserSidebar />
            </motion.div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <UserSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                    {/* Mobile Menu Button */}
                    <MobileMenuButton
                        showSidebar={showMobileSidebar}
                        setShowSidebar={setShowMobileSidebar}
                    />

                    {/* Page Header - B&W Theme */}
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
                                Profile
                            </motion.span>
                            {user?.isVerified && (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"
                                >
                                    ✓ Verified
                                </motion.span>
                            )}
                        </div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight"
                        >
                            Account Overview
                        </motion.h1>
                        <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-2xl"
                        >
                            View your personal information and account details.
                        </motion.p>
                    </motion.div>

                    {/* Profile Hero Card - B&W SaaS Style */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl mb-6 sm:mb-8"
                    >
                        {/* Decorative animated elements */}
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
                            className="absolute top-1/2 left-1/2 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"
                        />

                        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-7 lg:py-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                            {/* Avatar - B&W Theme */}
                            <div className="relative flex-shrink-0">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm"
                                >
                                    <img
                                        src={getAvatarUrl()}
                                        alt={user?.name || "Profile"}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        delay: 0.5,
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20
                                    }}
                                    className={`absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-lg ${user?.isVerified ? "bg-emerald-500" : "bg-amber-500"
                                        }`}
                                >
                                    {user?.isVerified ? "✓" : "!"}
                                </motion.div>
                            </div>

                            {/* Profile Info - B&W Theme */}
                            <div className="text-center md:text-left flex-1 min-w-0">
                                <motion.h2
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 truncate"
                                >
                                    {user?.name || "User"}
                                </motion.h2>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-gray-300 text-xs sm:text-sm mb-3 truncate"
                                >
                                    {user?.email || "No email"}
                                </motion.p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center md:justify-start">
                                    <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="inline-flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-white/10"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        {user?.role || "User"}
                                    </motion.span>
                                    {user?.isVerified ? (
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="inline-flex items-center gap-1 sm:gap-1.5 bg-emerald-500/20 text-emerald-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-emerald-500/20"
                                        >
                                            ✅ Verified
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="inline-flex items-center gap-1 sm:gap-1.5 bg-amber-500/20 text-amber-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-amber-500/20"
                                        >
                                            ⏳ Unverified
                                        </motion.span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Action - B&W Theme */}
                            <div className="flex-shrink-0 w-full md:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEditProfile}
                                    className="w-full md:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs sm:text-sm font-medium hover:bg-white/20 transition-all duration-300 shadow-lg"
                                >
                                    Edit Profile
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards - B&W Theme */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
                    >
                        {[
                            { label: "Account Status", value: "Active", icon: "🟢" },
                            {
                                label: "Member Since",
                                value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                }) : "N/A",
                                icon: "📅"
                            },
                            { label: "Account Type", value: user?.role || "User", icon: "👤" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                custom={index + 3}
                                whileHover={{
                                    y: -6,
                                    scale: 1.02,
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
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
                                            className="text-base sm:text-lg md:text-2xl font-bold mt-1 text-gray-800 truncate capitalize"
                                        >
                                            {stat.value}
                                        </motion.p>
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                                    >
                                        <span className="text-base sm:text-lg">{stat.icon}</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Account Information - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={6}
                        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        <div className="px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"
                            >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 3.5h12M2 8h8M2 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </motion.div>
                            <h2 className="text-xs sm:text-sm font-semibold text-gray-800">
                                Account Information
                            </h2>
                            <span className="ml-auto text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {profileFields.length} fields
                            </span>
                        </div>

                        <div className="px-4 sm:px-6 py-4 sm:py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {profileFields.map((field, index) => (
                                    <motion.div
                                        key={field.label}
                                        className="space-y-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.5 }}
                                    >
                                        <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                            <span className="text-xs sm:text-sm">{field.icon}</span>
                                            {field.label}
                                        </label>
                                        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/60 text-xs sm:text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors break-words">
                                            {field.value}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                className="mt-4 space-y-1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <span className="text-xs sm:text-sm">📝</span>
                                    Bio
                                </label>
                                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/60 min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm text-gray-600 hover:bg-gray-100 transition-colors break-words">
                                    {user?.bio || "No bio added yet. Tell others about yourself!"}
                                </div>
                            </motion.div>

                            <motion.div
                                className="mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] sm:text-xs text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                    Account ID: {user?._id?.slice(-8) || "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Secure Account
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Footer note - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={7}
                        className="mt-6 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            Profile information is managed by your account settings.
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Profile;