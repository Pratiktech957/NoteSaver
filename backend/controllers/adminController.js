const User = require("../models/User");
const Note = require("../models/Note");
const Report = require("../models/Report");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// Helper function to validate ObjectId
const validateObjectId = (id, type = "ID") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${type}`);
    }
    return true;
};

// Helper function to sanitize regex input
const sanitizeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper function to get pagination options
const getPaginationOptions = (page, limit) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    return { page: pageNum, limit: limitNum, skip };
};

// Helper function to recalculate category noteCount
const recalculateCategoryNoteCounts = async (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return;

    // Get updated counts for each category
    const categoryCounts = await Note.aggregate([
        { $match: { category: { $in: categoryIds } } },
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Update each category with new count
    const bulkOps = categoryCounts.map(({ _id, count }) => ({
        updateOne: {
            filter: { _id },
            update: { $set: { noteCount: count } }
        }
    }));

    if (bulkOps.length > 0) {
        await Category.bulkWrite(bulkOps);
    }

    // Categories that had notes but now have 0
    const updatedCategoryIds = categoryCounts.map(item => item._id);
    const emptyCategories = categoryIds.filter(id => !updatedCategoryIds.includes(id.toString()));

    if (emptyCategories.length > 0) {
        await Category.updateMany(
            { _id: { $in: emptyCategories } },
            { $set: { noteCount: 0 } }
        );
    }
};

const getStats = async (req, res) => {
    try {
        const [totalUsers, totalNotes, totalReports] = await Promise.all([
            User.countDocuments(),
            Note.countDocuments(),
            Report.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            totalUsers,
            totalNotes,
            totalReports
        });
    } catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch statistics"
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        // Build filter
        const filter = {};
        if (search && search.trim()) {
            const sanitizedSearch = sanitizeRegex(search.trim());
            filter.$or = [
                { name: { $regex: sanitizedSearch, $options: 'i' } },
                { email: { $regex: sanitizedSearch, $options: 'i' } }
            ];
        }

        // Get pagination options
        const { page: pageNum, limit: limitNum, skip } = getPaginationOptions(page, limit);

        // Get total count for pagination
        const totalRecords = await User.countDocuments(filter);

        // Fetch users with lean() and projection
        const users = await User.find(filter)
            .select("-password -__v")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.status(200).json({
            success: true,
            count: users.length,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limitNum),
            currentPage: pageNum,
            users
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch users"
        });
    }
};

const blockUser = async (req, res) => {
    try {
        // Validate ObjectId
        validateObjectId(req.params.id, "User ID");

        // Find user
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent blocking another admin
        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Cannot block another admin user"
            });
        }

        // Toggle block status
        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            success: true,
            message: user.isBlocked ? "User Blocked" : "User Unblocked",
            isBlocked: user.isBlocked
        });
    } catch (error) {
        console.error("Block user error:", error);
        if (error.message.includes("Invalid User ID")) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Failed to block/unblock user"
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        // Validate ObjectId
        validateObjectId(req.params.id, "User ID");

        // Find user
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent deleting another admin
        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Cannot delete another admin user"
            });
        }

        // Prevent admin from deleting themselves (support both req.user.id and req.user._id)
        const userId = req.params.id;
        const currentUserId = req.user.id || req.user._id?.toString();

        if (currentUserId && userId === currentUserId) {
            return res.status(403).json({
                success: false,
                message: "Cannot delete your own account"
            });
        }

        // Get all user notes with their categories before deletion
        const userNotes = await Note.find({ owner: user._id })
            .select("category")
            .lean();

        // Extract unique category IDs
        const categoryIds = userNotes
            .map(note => note.category)
            .filter(id => id);

        // Delete all notes belonging to the user
        const deleteResult = await Note.deleteMany({ owner: user._id });

        // Recalculate category noteCounts for affected categories
        if (categoryIds.length > 0) {
            await recalculateCategoryNoteCounts(categoryIds);
        }

        // Delete user
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            deletedNotes: deleteResult.deletedCount || 0,
            affectedCategories: categoryIds.length
        });
    } catch (error) {
        console.error("Delete user error:", error);
        if (error.message.includes("Invalid User ID")) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete user"
        });
    }
};

const getAllNotesAdmin = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 10 } = req.query;

        // Build filter
        const filter = {};

        if (search && search.trim()) {
            const sanitizedSearch = sanitizeRegex(search.trim());
            filter.$or = [
                { title: { $regex: sanitizedSearch, $options: 'i' } },
                { subject: { $regex: sanitizedSearch, $options: 'i' } },
                { description: { $regex: sanitizedSearch, $options: 'i' } }
            ];
        }

        // Validate category ID before adding to filter
        if (category && category.trim() && mongoose.Types.ObjectId.isValid(category.trim())) {
            filter.category = category.trim();
        }

        // Get pagination options
        const { page: pageNum, limit: limitNum, skip } = getPaginationOptions(page, limit);

        // Get total count for pagination
        const totalRecords = await Note.countDocuments(filter);

        // Fetch notes with lean() and projections
        const notes = await Note.find(filter)
            .populate("owner", "name email")
            .populate("category", "name slug")
            .select("-__v")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.status(200).json({
            success: true,
            count: notes.length,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limitNum),
            currentPage: pageNum,
            notes
        });
    } catch (error) {
        console.error("Get all notes admin error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch notes"
        });
    }
};

const getAdminAnalytics = async (req, res) => {
    try {
        // Get all counts in parallel
        const [totalUsers, totalNotes, totalReports, totalCategories] = await Promise.all([
            User.countDocuments(),
            Note.countDocuments(),
            Report.countDocuments(),
            Category.countDocuments()
        ]);

        // Get total views and downloads
        const [viewsResult, downloadsResult] = await Promise.all([
            Note.aggregate([
                { $group: { _id: null, total: { $sum: "$views" } } }
            ]),
            Note.aggregate([
                { $group: { _id: null, total: { $sum: "$downloads" } } }
            ])
        ]);

        const totalViews = viewsResult[0]?.total || 0;
        const totalDownloads = downloadsResult[0]?.total || 0;

        // Get all analytics data in parallel for better performance
        const [
            mostPopularCategory,
            topUploader,
            latestUser,
            latestNote
        ] = await Promise.all([
            Category.findOne()
                .sort({ noteCount: -1 })
                .select("name slug noteCount")
                .lean(),

            User.findOne()
                .sort({ uploadCount: -1 })
                .select("name email uploadCount")
                .lean(),

            User.findOne()
                .sort({ createdAt: -1 })
                .select("name email createdAt")
                .lean(),

            Note.findOne()
                .sort({ createdAt: -1 })
                .populate("owner", "name email")
                .populate("category", "name slug")
                .select("title subject createdAt")
                .lean()
        ]);

        res.status(200).json({
            success: true,
            totalUsers,
            totalNotes,
            totalReports,
            totalCategories,
            totalViews,
            totalDownloads,
            mostPopularCategory: mostPopularCategory || null,
            topUploader: topUploader || null,
            latestUser: latestUser || null,
            latestNote: latestNote || null
        });
    } catch (error) {
        console.error("Get admin analytics error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch analytics"
        });
    }
};

module.exports = {
    getStats,
    getAllUsers,
    blockUser,
    deleteUser,
    getAllNotesAdmin,
    getAdminAnalytics
};