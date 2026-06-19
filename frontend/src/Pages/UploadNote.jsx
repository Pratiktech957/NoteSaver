import { useEffect, useState } from "react";
import UserSidebar from "../Components/UserSidebar";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }
    })
};

const UploadNote = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        category: "",
        customCategory: "",
        description: "",
        file: null
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await API.get("/categories");
            setCategories(res.data.categories || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, file });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) setFormData({ ...formData, file });
    };

    const resetForm = () => {
        setFormData({
            title: "",
            subject: "",
            category: "",
            customCategory: "",
            description: "",
            file: null
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category && !formData.customCategory) {
            alert("Please select a category or create a new one.");
            return;
        }

        if (!formData.file) {
            alert("Please select a file.");
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append("title", formData.title);
            data.append("subject", formData.subject);
            data.append("category", formData.category);
            data.append("customCategory", formData.customCategory);
            data.append("description", formData.description);
            data.append("file", formData.file);

            await API.post("/notes", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            alert("Note uploaded successfully.");
            resetForm();
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    // File icon based on extension
    const getFileIcon = (filename) => {
        const ext = filename?.split(".").pop()?.toLowerCase();
        const icons = {
            pdf: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6M9 13h6M9 17h4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            doc: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6M9 13h6M9 17h4" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            default: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )
        };
        if (["pdf"].includes(ext)) return icons.pdf;
        if (["doc", "docx"].includes(ext)) return icons.doc;
        return icons.default;
    };

    const descLength = formData.description.length;

    return (
        <div className="flex min-h-screen bg-[#F7F8FA]">
            <UserSidebar />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-10">

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
                                Dashboard
                            </span>
                        </div>
                        <h1 className="text-[2rem] font-bold tracking-tight text-slate-900 leading-tight mt-2">
                            Upload a Note
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5 max-w-md">
                            Share educational resources with the NotesSaver community. Accepted formats: PDF, DOCX, PPTX, and images.
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Basic Information Card */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Basic Information</h2>
                            </div>

                            <div className="px-6 py-5 grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Data Structures Notes"
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Subject <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="e.g. Computer Science"
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Category Card */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Category</h2>
                                <span className="ml-auto text-xs text-slate-400">Pick one or create new</span>
                            </div>

                            <div className="px-6 py-5 grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Existing Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all appearance-none pr-9"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 16 16" fill="none">
                                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Create New Category
                                    </label>
                                    <input
                                        type="text"
                                        name="customCategory"
                                        value={formData.customCategory}
                                        onChange={handleChange}
                                        placeholder="e.g. System Design"
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Description Card */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={3}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 3h12M2 6.5h10M2 10h8M2 13.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Description</h2>
                                <span className={`ml-auto text-xs tabular-nums ${descLength > 480 ? "text-amber-500" : "text-slate-400"}`}>
                                    {descLength} / 500
                                </span>
                            </div>

                            <div className="px-6 py-5">
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    maxLength={500}
                                    rows="5"
                                    placeholder="What's covered in this note? Include topics, chapters, or key concepts to help others find it easily."
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none leading-relaxed"
                                />
                                <p className="text-xs text-slate-400 mt-1.5">
                                    A good description increases discovery. Mention the course, professor, or semester if relevant.
                                </p>
                            </div>
                        </motion.div>

                        {/* Upload Card */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={4}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 10V3M5 6l3-3 3 3M3 11v1.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">Upload Document</h2>
                            </div>

                            <div className="px-6 py-5">
                                <motion.div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    animate={{
                                        borderColor: dragActive ? "#6366f1" : "#e2e8f0",
                                        backgroundColor: dragActive ? "#f5f3ff" : "#f8fafc",
                                        scale: dragActive ? 1.01 : 1
                                    }}
                                    transition={{ duration: 0.15 }}
                                    className="border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <motion.div
                                            animate={{ y: dragActive ? -4 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragActive ? "bg-indigo-100" : "bg-slate-100"}`}
                                        >
                                            <svg className={`w-6 h-6 transition-colors ${dragActive ? "text-indigo-500" : "text-slate-400"}`} viewBox="0 0 24 24" fill="none">
                                                <path d="M12 15V4M8 8l4-4 4 4M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </motion.div>

                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {dragActive ? "Drop your file here" : "Drag and drop your file"}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                PDF, DOC, DOCX, PPT, PPTX, PNG, JPG
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 my-1">
                                            <div className="h-px w-12 bg-slate-200" />
                                            <span className="text-xs text-slate-400">or</span>
                                            <div className="h-px w-12 bg-slate-200" />
                                        </div>

                                        <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                                                <path d="M8 1v10M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Browse files
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </motion.div>

                                {/* File Preview */}
                                <AnimatePresence>
                                    {formData.file && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                            className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
                                                {getFileIcon(formData.file.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {formData.file.name}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                                                    <span className="mx-1.5">·</span>
                                                    {formData.file.name.split(".").pop().toUpperCase()}
                                                </p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, file: null })}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400 transition-colors"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            custom={5}
                        >
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={!loading ? { scale: 1.01, boxShadow: "0 4px 20px rgba(99,102,241,0.35)" } : {}}
                                whileTap={!loading ? { scale: 0.99 } : {}}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2.5"
                            >
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <motion.span
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
                                            </svg>
                                            Uploading...
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="idle"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                                                <path d="M8 1v10M5 4l3-3 3 3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Publish Note
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <p className="text-center text-xs text-slate-400 mt-3">
                                Your note will be reviewed and made available to the community.
                            </p>
                        </motion.div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadNote;