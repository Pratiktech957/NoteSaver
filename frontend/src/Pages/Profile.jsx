import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import UserSidebar from "../Components/UserSidebar";
import { useNavigate } from "react-router-dom";

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

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Profile fields
    const profileFields = [
        { label: "Full Name", value: user?.name || "N/A" },
        { label: "Email Address", value: user?.email || "N/A" },
        { label: "Phone Number", value: user?.phone || "Not Added" },
        { label: "Role", value: user?.role || "User" }
    ];

    const handleEditProfile = () => {
        navigate("/settings");
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4]">
            <UserSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* Page Header */}
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
                                Profile
                            </motion.span>
                        </div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight"
                        >
                            Account Overview
                        </motion.h1>
                        <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm text-slate-500 mt-1.5 max-w-2xl"
                        >
                            View your personal information and account details.
                        </motion.p>
                    </motion.div>

                    {/* Profile Hero Card */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl shadow-2xl mb-8"
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
                            className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"
                        />

                        <div className="relative px-8 py-8 flex flex-col md:flex-row items-center gap-8">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm"
                                >
                                    <img
                                        src={
                                            user?.profileImage ||
                                            "https://ui-avatars.com/api/?name=" + (user?.name || "User") + "&background=6366f1&color=fff&size=128"
                                        }
                                        alt="Profile"
                                        className="w-full h-full object-cover"
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
                                    className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg ${user?.isVerified ? "bg-emerald-500" : "bg-amber-500"
                                        }`}
                                >
                                    {user?.isVerified ? "✓" : "!"}
                                </motion.div>
                            </div>

                            {/* Profile Info */}
                            <div className="text-center md:text-left flex-1">
                                <motion.h2
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-3xl font-bold text-white mb-1"
                                >
                                    {user?.name}
                                </motion.h2>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-indigo-200 text-sm mb-3"
                                >
                                    {user?.email}
                                </motion.p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        {user?.role || "User"}
                                    </motion.span>
                                    {user?.isVerified ? (
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20"
                                        >
                                            ✅ Verified Account
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-100 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/20"
                                        >
                                            ⏳ Unverified
                                        </motion.span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Action */}
                            <div className="flex-shrink-0">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEditProfile}
                                    className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-all duration-300 shadow-lg"
                                >
                                    Edit Profile
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards - Account Status Cards */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                    >
                        {[
                            { label: "Account Status", value: "Active", icon: "🟢", color: "emerald" },
                            {
                                label: "Member Since",
                                value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                }) : "N/A",
                                icon: "📅",
                                color: "indigo"
                            },
                            { label: "Account Type", value: user?.role || "User", icon: "👤", color: "violet" }
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
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5 hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                                            className={`text-2xl font-bold mt-1 text-${stat.color}-600 capitalize`}
                                        >
                                            {stat.value}
                                        </motion.p>
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}
                                    >
                                        <span className="text-lg">{stat.icon}</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Account Information */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={6}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 3.5h12M2 8h8M2 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </motion.div>
                            <h2 className="text-sm font-semibold text-slate-800">
                                Account Information
                            </h2>
                        </div>

                        <div className="px-6 py-5">
                            <div className="grid md:grid-cols-2 gap-4">
                                {profileFields.map((field, index) => (
                                    <motion.div
                                        key={field.label}
                                        className="space-y-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.5 }}
                                    >
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                            {field.label}
                                        </label>
                                        <div className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-sm text-slate-700 font-medium hover:bg-slate-100 transition-colors">
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
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Bio
                                </label>
                                <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200/60 min-h-[80px] text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                                    {user?.bio || "No bio added yet. Tell others about yourself!"}
                                </div>
                            </motion.div>

                            <motion.div
                                className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                    Account ID: {user?._id?.slice(-8) || "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Secure Account
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Footer note */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={7}
                        className="mt-6 text-center"
                    >
                        <p className="text-xs text-slate-400">
                            Profile information is managed by your account settings.
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Profile;