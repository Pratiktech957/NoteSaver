import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "../Components/UserSidebar";
import API from "../Services/api";

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

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        profileImage: user?.profileImage || ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError(null);
        if (success) setSuccess(false);
    };

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

    // Get user initials for avatar
    const getUserInitials = () => {
        const name = formData.name || "User";
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <UserSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-6 py-10">

                    {/* Header */}
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
                                Settings
                            </motion.span>
                        </div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight"
                        >
                            Account Settings
                        </motion.h1>
                        <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm text-slate-500 mt-1.5 max-w-2xl"
                        >
                            Manage your profile information and account preferences.
                        </motion.p>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
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

                    {/* Success Message */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                            >
                                <span className="text-lg">✅</span>
                                <span className="text-sm">Profile updated successfully!</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Card */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        {/* Profile Preview */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-indigo-50/30">
                            <div className="flex items-center gap-6">
                                <div className="relative flex-shrink-0">
                                    {formData.profileImage ? (
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            src={formData.profileImage}
                                            alt="Profile"
                                            className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover"
                                        />
                                    ) : (
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md"
                                        >
                                            {getUserInitials()}
                                        </motion.div>
                                    )}
                                    <motion.div
                                        {...floatBadge}
                                        animate="animate"
                                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm"
                                    >
                                        <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="none">
                                            <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                </div>

                                <div>
                                    <motion.h2
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="text-xl font-bold text-slate-900"
                                    >
                                        {formData.name || "User"}
                                    </motion.h2>
                                    <p className="text-sm text-slate-500">
                                        {formData.email}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                            {user?.role || "User"}
                                        </span>
                                        {user?.isVerified && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Full Name <span className="text-red-400">*</span>
                                    </label>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Enter your full name"
                                            disabled={loading}
                                        />
                                    </motion.div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Email Address <span className="text-red-400">*</span>
                                    </label>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Enter your email"
                                            disabled={loading}
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Phone Number
                                    </label>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Enter your phone number"
                                            disabled={loading}
                                        />
                                    </motion.div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Profile Image URL
                                    </label>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <input
                                            type="text"
                                            name="profileImage"
                                            value={formData.profileImage}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="https://example.com/avatar.jpg"
                                            disabled={loading}
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Bio
                                </label>
                                <motion.div whileHover={{ scale: 1.01 }}>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Tell others about yourself..."
                                        disabled={loading}
                                    />
                                </motion.div>
                                <p className="text-xs text-slate-400 text-right">
                                    {formData.bio?.length || 0}/500 characters
                                </p>
                            </div>

                            {/* Stats Cards */}
                            <motion.div
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                custom={2}
                                className="grid grid-cols-3 gap-4 pt-2"
                            >
                                <motion.div
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 transition-all duration-300"
                                >
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Uploads</p>
                                    <motion.p
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: 0.5,
                                            type: "spring",
                                            stiffness: 300
                                        }}
                                        className="text-2xl font-bold text-indigo-600 mt-1"
                                    >
                                        {user?.uploadCount || 0}
                                    </motion.p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 transition-all duration-300"
                                >
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Downloads</p>
                                    <motion.p
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: 0.6,
                                            type: "spring",
                                            stiffness: 300
                                        }}
                                        className="text-2xl font-bold text-emerald-600 mt-1"
                                    >
                                        {user?.downloadCount || 0}
                                    </motion.p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="bg-violet-50/50 rounded-xl p-4 border border-violet-100/50 transition-all duration-300"
                                >
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Member Since</p>
                                    <motion.p
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            delay: 0.7,
                                            type: "spring",
                                            stiffness: 300
                                        }}
                                        className="text-sm font-bold text-violet-600 mt-1"
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

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={!loading ? { scale: 1.01 } : {}}
                                whileTap={!loading ? { scale: 0.99 } : {}}
                                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-700 text-white py-3 rounded-xl font-medium text-sm transition-all shadow-lg hover:shadow-indigo-200/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                            >
                                {/* Button shine effect */}
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>

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
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                            <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Save Changes
                                    </span>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-xs text-slate-400">
                            NotesSaver • Account Settings • {new Date().getFullYear()}
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Settings;