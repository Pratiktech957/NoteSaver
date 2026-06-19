import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import UserSidebar from "../Components/UserSidebar";
import { useNavigate } from "react-router-dom";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }
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
        <div className="flex min-h-screen bg-[#F7F8FA]">
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
                            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                Profile
                            </span>
                        </div>
                        <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                            Account Overview
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                            View your personal information and account details.
                        </p>
                    </motion.div>

                    {/* Profile Hero Card */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl shadow-xl mb-8"
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

                        <div className="relative px-8 py-8 flex flex-col md:flex-row items-center gap-8">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                                    <img
                                        src={
                                            user?.profileImage ||
                                            "https://ui-avatars.com/api/?name=" + (user?.name || "User") + "&background=6366f1&color=fff&size=128"
                                        }
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${user?.isVerified ? "bg-emerald-500" : "bg-amber-500"
                                    }`}>
                                    {user?.isVerified ? "✓" : "!"}
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-3xl font-bold text-white mb-1">
                                    {user?.name}
                                </h2>
                                <p className="text-indigo-200 text-sm mb-3">
                                    {user?.email}
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        {user?.role || "User"}
                                    </span>
                                    {user?.isVerified ? (
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                                            ✅ Verified Account
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-100 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/20">
                                            ⏳ Unverified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Action */}
                            <div className="flex-shrink-0">
                                <button
                                    onClick={handleEditProfile}
                                    className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300"
                                >
                                    Edit Profile
                                </button>
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
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Status</p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">Active</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <span className="text-lg">🟢</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member Since</p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            year: 'numeric'
                                        }) : "N/A"}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <span className="text-lg">📅</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Type</p>
                                    <p className="text-2xl font-bold text-violet-600 mt-1 capitalize">{user?.role || "User"}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Account Information */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                    >
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 3.5h12M2 8h8M2 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <h2 className="text-sm font-semibold text-slate-800">
                                Account Information
                            </h2>
                        </div>

                        <div className="px-6 py-5">
                            <div className="grid md:grid-cols-2 gap-4">
                                {profileFields.map((field) => (
                                    <div key={field.label} className="space-y-1">
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                            {field.label}
                                        </label>
                                        <div className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-sm text-slate-700 font-medium">
                                            {field.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 space-y-1">
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Bio
                                </label>
                                <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200/60 min-h-[80px] text-sm text-slate-600">
                                    {user?.bio || "No bio added yet."}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                <span>Account ID: {user?._id?.slice(-8) || "N/A"}</span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Secure Account
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer note */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={4}
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