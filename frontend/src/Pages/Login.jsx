import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import API from "../Services/api";

// Enhanced animation variants
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

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");

    // EXACT SAME handleChange - NO CHANGES
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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

    // EXACT SAME handleSubmit - NO CHANGES
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            const res = await API.post("/auth/login", formData);

            login(res.data.user, res.data.token);

            if (res.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("LOGIN ERROR:", error.response?.data || error.message);
            setErrorMessage(
                error.response?.data?.message ||
                "Login failed. Please check your credentials and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
            {/* Background decorations - B&W Theme */}
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
                className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gray-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
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
                className="absolute bottom-0 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-gray-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 bg-gray-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            />

            {/* Floating particles - B&W */}
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
                className="absolute top-20 left-10 sm:left-20 w-3 h-3 sm:w-4 sm:h-4 bg-gray-400/20 rounded-full blur-sm"
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
                className="absolute bottom-20 right-10 sm:right-20 w-4 h-4 sm:w-6 sm:h-6 bg-gray-500/20 rounded-full blur-sm"
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
                className="absolute top-1/2 left-10 sm:left-20 w-2 h-2 sm:w-3 sm:h-3 bg-gray-400/20 rounded-full blur-sm"
            />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                className="w-full max-w-md relative z-10 px-2 sm:px-0"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50 hover:shadow-3xl transition-shadow duration-300">
                    {/* Logo/Header - B&W Theme */}
                    <div className="text-center mb-6 sm:mb-8">
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
                                className="text-4xl sm:text-5xl block"
                            >
                                📚
                            </motion.span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3"
                        >
                            Welcome Back
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 text-xs sm:text-sm mt-1"
                        >
                            Sign in to continue your learning journey
                        </motion.p>

                        {/* Online status badge - B&W */}
                        <motion.div
                            {...pulseBadge}
                            animate="animate"
                            className="inline-flex items-center gap-1.5 mt-3 bg-gray-100 px-2.5 sm:px-3 py-1 rounded-full border border-gray-200"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-700">Online</span>
                        </motion.div>
                    </div>

                    {/* Error Message - B&W Theme */}
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-xs sm:text-sm"
                            >
                                <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
                                <span className="flex-1">{errorMessage}</span>
                                <button
                                    onClick={() => setErrorMessage("")}
                                    className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {/* Email - B&W Theme */}
                        <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                Email Address
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border ${errors.email ? 'border-red-400' : 'border-gray-200'
                                        } rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all`}
                                />
                            </motion.div>
                            <AnimatePresence>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-[10px] sm:text-xs text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <span>⚠️</span>
                                        {errors.email}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Password - B&W Theme */}
                        <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                                Password
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
                                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border ${errors.password ? 'border-red-400' : 'border-gray-200'
                                            } rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all pr-10 sm:pr-12`}
                                    />
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                                <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" />
                                                <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                                                <path d="M8 3C4.5 3 2 7 2 7s2.5 4 6 4 6-4 6-4-2.5-4-6-4z" stroke="currentColor" strokeWidth="1.4" />
                                                <circle cx="8" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                                            </svg>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                            <AnimatePresence>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-[10px] sm:text-xs text-red-500 mt-1 flex items-center gap-1"
                                    >
                                        <span>⚠️</span>
                                        {errors.password}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Forgot Password - B&W Theme */}
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-[10px] sm:text-xs text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center gap-1"
                            >
                                <span>🔑</span>
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button - B&W Theme */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-2 bg-gray-800 hover:bg-gray-900 text-white py-3 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            {/* Button shine effect */}
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>

                            {loading ? (
                                <span className="flex items-center justify-center gap-2 relative z-10">
                                    <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Sign In
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                        </motion.button>

                        {/* Divider - B&W Theme */}
                        <div className="relative my-4 sm:my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] sm:text-xs">
                                <span className="px-3 sm:px-4 bg-white text-gray-400">New to NotesSaver?</span>
                            </div>
                        </div>

                        {/* Register Link - B&W Theme */}
                        <Link
                            to="/register"
                            className="block w-full text-center text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors py-2 hover:bg-gray-100 rounded-xl"
                        >
                            Create an account →
                        </Link>
                    </form>

                    {/* Footer - B&W Theme */}
                    <div className="mt-4 sm:mt-6 text-center">
                        <p className="text-[10px] sm:text-xs text-gray-400">
                            By signing in, you agree to our
                            <Link to="/terms" className="text-gray-600 hover:text-gray-800 hover:underline ml-1 transition-colors">
                                Terms of Service
                            </Link>
                            <span className="mx-1">and</span>
                            <Link to="/privacy" className="text-gray-600 hover:text-gray-800 hover:underline transition-colors">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>

                    {/* Version info - B&W Theme */}
                    <div className="mt-3 sm:mt-4 text-center">
                        <span className="text-[10px] text-gray-300">
                            NotesSaver v2.0 • Secure Login
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;