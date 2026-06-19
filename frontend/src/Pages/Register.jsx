import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const floatAnimation = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const pulseBadge = {
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
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
    const [errorMessage, setErrorMessage] = useState("");

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
        if (errorMessage) {
            setErrorMessage("");
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
            setErrorMessage("");
            await API.post("/auth/register", {
                name,
                email,
                phone,
                password
            });
            navigate("/login", {
                state: { message: "Account created successfully! Please login." }
            });
        } catch (error) {
            console.error("REGISTER ERROR:", error.response?.data || error.message);
            setErrorMessage(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        const { password } = formData;
        if (!password) return { label: "None", color: "bg-slate-200", width: "0%" };
        if (password.length < 6) return { label: "Weak", color: "bg-red-400", width: "25%" };
        if (password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password)) {
            if (password.length >= 10) return { label: "Strong", color: "bg-emerald-400", width: "100%" };
            return { label: "Medium", color: "bg-amber-400", width: "75%" };
        }
        return { label: "Weak", color: "bg-red-400", width: "25%" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F8FA] to-[#EEF0F4] px-4 relative overflow-hidden">
            {/* Background decorations with enhanced animations */}
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
                className="absolute top-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
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
                className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
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
                className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            />

            {/* Floating particles */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 left-20 w-4 h-4 bg-indigo-400/20 rounded-full blur-sm"
            />
            <motion.div
                animate={{
                    y: [0, 20, 0],
                    x: [0, -10, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-20 right-20 w-6 h-6 bg-purple-400/20 rounded-full blur-sm"
            />
            <motion.div
                animate={{
                    y: [0, -15, 0],
                    x: [0, -10, 0],
                }}
                transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-1/2 left-20 w-3 h-3 bg-blue-400/20 rounded-full blur-sm"
            />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 hover:shadow-3xl transition-shadow duration-300">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                delay: 0.2,
                                type: "spring",
                                stiffness: 200,
                                damping: 20
                            }}
                            className="inline-block"
                        >
                            <motion.span
                                {...floatAnimation}
                                animate="animate"
                                className="text-5xl block"
                            >
                                📚
                            </motion.span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold text-slate-900 mt-3"
                        >
                            Create Account
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-500 text-sm mt-1"
                        >
                            Join thousands of students sharing knowledge
                        </motion.p>

                        {/* Online status badge */}
                        <motion.div
                            {...pulseBadge}
                            animate="animate"
                            className="inline-flex items-center gap-1.5 mt-3 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-medium text-emerald-700">Secure Registration</span>
                        </motion.div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                            >
                                <span className="text-lg">⚠️</span>
                                <span className="text-sm">{errorMessage}</span>
                                <button
                                    onClick={() => setErrorMessage("")}
                                    className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Full Name <span className="text-red-400">*</span>
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-400' : 'border-slate-200'
                                        } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                                    disabled={loading}
                                />
                            </motion.div>
                            <AnimatePresence>
                                {errors.name && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <span>⚠️</span>
                                        {errors.name}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-400' : 'border-slate-200'
                                        } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                                    disabled={loading}
                                />
                            </motion.div>
                            <AnimatePresence>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <span>⚠️</span>
                                        {errors.email}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Phone Number <span className="text-red-400">*</span>
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.phone ? 'border-red-400' : 'border-slate-200'
                                        } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                                    disabled={loading}
                                />
                            </motion.div>
                            <AnimatePresence>
                                {errors.phone && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <span>⚠️</span>
                                        {errors.phone}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Password <span className="text-red-400">*</span>
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-400' : 'border-slate-200'
                                            } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12`}
                                        disabled={loading}
                                    />
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
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
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <motion.div
                                    className="mt-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-slate-500">Password Strength</span>
                                        <span className={`text-xs font-medium ${passwordStrength.label === "Strong" ? "text-emerald-600" :
                                                passwordStrength.label === "Medium" ? "text-amber-600" :
                                                    "text-red-500"
                                            }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${passwordStrength.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: passwordStrength.width }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <span>⚠️</span>
                                        {errors.password}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                                Confirm Password <span className="text-red-400">*</span>
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                                            } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12`}
                                        disabled={loading}
                                    />
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
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
                                    </motion.button>
                                </div>
                            </motion.div>
                            <AnimatePresence>
                                {errors.confirmPassword && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xs text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <span>⚠️</span>
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
                                        <motion.span
                                            animate={{ scale: req.check ? 1 : 1 }}
                                            className={`text-xs ${req.check ? 'text-emerald-500' : 'text-slate-400'}`}
                                        >
                                            {req.check ? "✅" : "○"}
                                        </motion.span>
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
                            className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-indigo-200/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            {/* Button shine effect */}
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>

                            {loading ? (
                                <span className="flex items-center justify-center gap-2 relative z-10">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Create Account
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
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
                            className="block w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors py-2 hover:bg-indigo-50 rounded-xl"
                        >
                            Sign in instead →
                        </Link>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            By creating an account, you agree to our
                            <Link to="/terms" className="text-indigo-500 hover:text-indigo-600 hover:underline ml-1 transition-colors">
                                Terms of Service
                            </Link>
                            <span className="mx-1">and</span>
                            <Link to="/privacy" className="text-indigo-500 hover:text-indigo-600 hover:underline transition-colors">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>

                    {/* Version info */}
                    <div className="mt-4 text-center">
                        <span className="text-[10px] text-slate-300">
                            NotesSaver v2.0 • Secure Registration
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;