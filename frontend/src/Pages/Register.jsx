import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error for this field when user types
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ""
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const { name, email, phone, password, confirmPassword } = formData;

        if (!name.trim()) newErrors.name = "Full name is required";
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[0-9+\-\s()]{10,15}$/.test(phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const { name, email, phone, password } = formData;

        try {
            setLoading(true);
            const res = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    name,
                    email,
                    phone,
                    password
                }
            );
            navigate("/login", { state: { message: "Account created successfully! Please login." } });
        } catch (error) {
            alert(error.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-block"
                        >
                            <span className="text-4xl">📚</span>
                        </motion.div>
                        <h1 className="text-3xl font-bold text-slate-900 mt-3">
                            Create Account
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Join thousands of students sharing knowledge
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                            />
                            <AnimatePresence>
                                {errors.name && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1"
                                    >
                                        {errors.name}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                            />
                            <AnimatePresence>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1"
                                    >
                                        {errors.email}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 bg-slate-50 border ${errors.phone ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                            />
                            <AnimatePresence>
                                {errors.phone && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1"
                                    >
                                        {errors.phone}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" />
                                            <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" />
                                            <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <AnimatePresence>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1"
                                    >
                                        {errors.password}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" />
                                            <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" />
                                            <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <AnimatePresence>
                                {errors.confirmPassword && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1"
                                    >
                                        {errors.confirmPassword}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <p className="text-xs font-medium text-slate-600 mb-1.5">Password must contain:</p>
                            <div className="grid grid-cols-2 gap-1">
                                {[
                                    { label: "At least 6 characters", check: formData.password.length >= 6 },
                                    { label: "Letters & numbers", check: /[a-zA-Z]/.test(formData.password) && /\d/.test(formData.password) }
                                ].map((req, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <span className={`text-xs ${req.check ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {req.check ? "✅" : "○"}
                                        </span>
                                        <span className={`text-xs ${req.check ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-indigo-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </motion.button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-white text-slate-400">Already have an account?</span>
                            </div>
                        </div>

                        <Link
                            to="/login"
                            className="block w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors py-2"
                        >
                            Sign in instead
                        </Link>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            By creating an account, you agree to our
                            <Link to="/terms" className="text-indigo-500 hover:text-indigo-600 ml-1">Terms of Service</Link>
                            <span className="mx-1">and</span>
                            <Link to="/privacy" className="text-indigo-500 hover:text-indigo-600">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;