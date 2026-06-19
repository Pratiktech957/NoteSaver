import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import UserSidebar from "../components/UserSidebar";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }
    })
};

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.put(
                "http://localhost:5000/api/users/profile",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            updateUser(res.data.user);
            alert("✅ Profile Updated Successfully");
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
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
                            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                Settings
                            </span>
                        </div>
                        <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight">
                            Account Settings
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                            Manage your profile information and account preferences.
                        </p>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                    >
                        {/* Profile Preview */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="relative flex-shrink-0">
                                    {formData.profileImage ? (
                                        <img
                                            src={formData.profileImage}
                                            alt="Profile"
                                            className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                            {formData.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="none">
                                            <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {formData.name || "User"}
                                    </h2>
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
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Profile Image URL
                                    </label>
                                    <input
                                        type="text"
                                        name="profileImage"
                                        value={formData.profileImage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Tell others about yourself..."
                                />
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Uploads</p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                                        {user?.uploadCount || 0}
                                    </p>
                                </div>

                                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Downloads</p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                                        {user?.downloadCount || 0}
                                    </p>
                                </div>

                                <div className="bg-violet-50/50 rounded-xl p-4 border border-violet-100/50">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Member Since</p>
                                    <p className="text-sm font-bold text-violet-600 mt-1">
                                        {user?.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                        </svg>
                                        Saving Changes...
                                    </span>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;