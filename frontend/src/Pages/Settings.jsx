import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "../Components/UserSidebar";
import API from "../Services/api";

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

const scaleOnHover = {
    hover: {
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.1 }
    }
};

const floatBadge = {
    animate: {
        scale: [1, 1.1, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
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

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // EXACT SAME formData - NO CHANGES
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        profileImage: user?.profileImage || ""
    });

    // EXACT SAME handleChange - NO CHANGES
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError(null);
        if (success) setSuccess(false);
    };

    // EXACT SAME handleSubmit - NO CHANGES
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const res = await API.put("/users/profile", formData);
            updateUser(res.data.user);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("UPDATE PROFILE ERROR:", error);
            setError(error?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // EXACT SAME getUserInitials - NO CHANGES
    const getUserInitials = () => {
        const name = formData.name || "User";
        return name.charAt(0).toUpperCase();
    };

    // Get avatar URL - B&W Theme
    const getAvatarUrl = () => {
        if (formData.profileImage) {
            return formData.profileImage;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=4B5563&color=fff&size=200&bold=true&font-size=0.5`;
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

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
                                Settings
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
                            Account Settings
                        </motion.h1>
                        <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-2xl"
                        >
                            Manage your profile information and account preferences.
                        </motion.p>
                    </motion.div>

                    {/* Error Message - B&W Theme */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-xs sm:text-sm"
                            >
                                <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
                                <span className="flex-1">{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-500 hover:text-red-700 transition-colors p-1 flex-shrink-0"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success Message - B&W Theme */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-xs sm:text-sm"
                            >
                                <span className="text-base sm:text-lg flex-shrink-0">✅</span>
                                <span className="flex-1">Profile updated successfully!</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Card - B&W Theme */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        {/* Profile Preview - B&W Theme */}
                        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-gray-100/30">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                                <div className="relative flex-shrink-0">
                                    {formData.profileImage ? (
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            src={formData.profileImage}
                                            alt="Profile"
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white shadow-md object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-800 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md"
                                        >
                                            {getUserInitials()}
                                        </motion.div>
                                    )}
                                    <motion.div
                                        {...floatBadge}
                                        animate="animate"
                                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm"
                                    >
                                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" viewBox="0 0 16 16" fill="none">
                                            <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </div>

                                <div className="text-center sm:text-left flex-1 min-w-0">
                                    <motion.h2
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="text-lg sm:text-xl font-bold text-gray-900 truncate"
                                    >
                                        {formData.name || "User"}
                                    </motion.h2>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                                        {formData.email}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mt-1">
                                        <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-gray-700 bg-gray-100 px-2 sm:px-2.5 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                            {user?.role || "User"}
                                        </span>
                                        {user?.isVerified && (
                                            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form - B&W Theme */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Full Name <span className="text-red-400">*</span>
                                    </label>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                            placeholder="Enter your full name"
                                            disabled={loading}
                                        />
                                    </motion.div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Email Address <span className="text-red-400">*</span>
                                    </label>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                            placeholder="Enter your email"
                                            disabled={loading}
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Phone Number
                                    </label>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                            placeholder="Enter your phone number"
                                            disabled={loading}
                                        />
                                    </motion.div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Profile Image URL
                                    </label>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <input
                                            type="text"
                                            name="profileImage"
                                            value={formData.profileImage}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                                            placeholder="https://example.com/avatar.jpg"
                                            disabled={loading}
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Bio
                                </label>
                                <motion.div whileHover={{ scale: 1.01 }}>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all resize-none"
                                        placeholder="Tell others about yourself..."
                                        disabled={loading}
                                    />
                                </motion.div>
                                <p className="text-[10px] sm:text-xs text-gray-400 text-right">
                                    {formData.bio?.length || 0}/500 characters
                                </p>
                            </div>

                            {/* Stats Cards - B&W Theme */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2"
                            >
                                <motion.div
                                    variants={fadeInUp}
                                    custom={0}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="bg-gray-100/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/50 transition-all duration-300"
                                >
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Uploads</p>
                                    <motion.p
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: 0.5,
                                            type: "spring",
                                            stiffness: 300
                                        }}
                                        className="text-xl sm:text-2xl font-bold text-gray-800 mt-1"
                                    >
                                        {user?.uploadCount || 0}
                                    </motion.p>
                                </motion.div>

                                <motion.div
                                    variants={fadeInUp}
                                    custom={1}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="bg-gray-100/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/50 transition-all duration-300"
                                >
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Downloads</p>
                                    <motion.p
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: 0.6,
                                            type: "spring",
                                            stiffness: 300
                                        }}
                                        className="text-xl sm:text-2xl font-bold text-gray-800 mt-1"
                                    >
                                        {user?.downloadCount || 0}
                                    </motion.p>
                                </motion.div>

                                <motion.div
                                    variants={fadeInUp}
                                    custom={2}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="bg-gray-100/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/50 transition-all duration-300"
                                >
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
                                    <motion.p
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: 0.7,
                                            type: "spring",
                                            stiffness: 300
                                        }}
                                        className="text-xs sm:text-sm font-bold text-gray-800 mt-1"
                                    >
                                        {user?.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                            : "N/A"}
                                    </motion.p>
                                </motion.div>
                            </motion.div>

                            {/* Submit Button - B&W Theme */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={!loading ? { scale: 1.01 } : {}}
                                whileTap={!loading ? { scale: 0.99 } : {}}
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                            >
                                {/* Button shine effect */}
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>

                                {loading ? (
                                    <span className="flex items-center justify-center gap-2 relative z-10">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                        </svg>
                                        Saving Changes...
                                    </span>
                                ) : (
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                            <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Save Changes
                                    </span>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Footer - B&W Theme */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 sm:mt-8 text-center"
                    >
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            NotesSaver • Account Settings • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Settings;