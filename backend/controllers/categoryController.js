const Category = require("../models/Category");
const Note = require("../models/Note");
const mongoose = require("mongoose");

// Helper function to validate ObjectId
const validateObjectId = (id, type = "Category ID") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${type}`);
    }
    return true;
};

// Helper function to sanitize input for regex
const sanitizeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper function to get case-insensitive category
const getCategoryCaseInsensitive = async (name) => {
    const sanitizedName = sanitizeRegex(name.trim());
    return await Category.findOne({
        name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') }
    });
};

const createCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const trimmedName = name.trim();

        // Check for existing category case-insensitively
        const existingCategory = await getCategoryCaseInsensitive(trimmedName);

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
                category: existingCategory
            });
        }

        // Capitalize category name properly
        const capitalizedName = trimmedName.charAt(0).toUpperCase() +
            trimmedName.slice(1).toLowerCase();

        const category = await Category.create({
            name: capitalizedName,
            description: description || `${capitalizedName} Notes`,
            icon: icon || "📚",
            noteCount: 0
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create category"
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const { search, sort } = req.query;

        // Build filter object
        const filter = {};

        // Search support - case-insensitive
        if (search && search.trim()) {
            const sanitizedSearch = sanitizeRegex(search.trim());
            filter.$or = [
                { name: { $regex: sanitizedSearch, $options: 'i' } },
                { description: { $regex: sanitizedSearch, $options: 'i' } }
            ];
        }

        // Build sort object
        let sortOptions = { noteCount: -1, createdAt: -1 }; // Default: most popular first

        if (sort) {
            switch (sort) {
                case 'name':
                    sortOptions = { name: 1 };
                    break;
                case 'name-desc':
                    sortOptions = { name: -1 };
                    break;
                case 'popular':
                    sortOptions = { noteCount: -1 };
                    break;
                case 'newest':
                    sortOptions = { createdAt: -1 };
                    break;
                case 'oldest':
                    sortOptions = { createdAt: 1 };
                    break;
                default:
                    sortOptions = { noteCount: -1, createdAt: -1 };
            }
        }

        // Use lean() for better performance with projection
        const categories = await Category.find(filter)
            .select("name description icon noteCount createdAt updatedAt")
            .sort(sortOptions)
            .lean();

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch categories"
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Category ID"
            });
        }

        const { name, description, icon } = req.body;

        // Check if category exists
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Prepare update object
        const updateData = {};

        if (name && name.trim()) {
            const trimmedName = name.trim();

            // Check for duplicate case-insensitively
            const existingCategory = await getCategoryCaseInsensitive(trimmedName);

            if (existingCategory && existingCategory._id.toString() !== req.params.id) {
                return res.status(400).json({
                    success: false,
                    message: "Category name already exists"
                });
            }

            // Capitalize name
            updateData.name = trimmedName.charAt(0).toUpperCase() +
                trimmedName.slice(1).toLowerCase();
        }

        if (description !== undefined) {
            updateData.description = description ? description.trim() : "";
        }

        if (icon !== undefined) {
            updateData.icon = icon || "📚";
        }

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).lean();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory
        });

    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update category"
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Category ID"
            });
        }

        // Check if category exists
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if category has notes
        const notesUsingCategory = await Note.countDocuments({
            category: req.params.id
        });

        if (notesUsingCategory > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${notesUsingCategory} note(s) are using it.`,
                notesCount: notesUsingCategory
            });
        }

        // Delete category
        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete category"
        });
    }
};

// Get popular categories - sorted by noteCount descending
const getPopularCategories = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Use lean() for better performance
        const categories = await Category.find()
            .select("name description icon noteCount")
            .sort({ noteCount: -1 })
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error("Get popular categories error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch popular categories"
        });
    }
};

// Get category statistics and analytics
const getCategoryStats = async (req, res) => {
    try {
        // Get total categories count
        const totalCategories = await Category.countDocuments();

        // Get total notes count (sum of all noteCounts)
        const aggregationResult = await Category.aggregate([
            {
                $group: {
                    _id: null,
                    totalNotes: { $sum: "$noteCount" }
                }
            }
        ]);

        const totalNotes = aggregationResult.length > 0 ? aggregationResult[0].totalNotes : 0;

        // Get most popular category
        const mostPopularCategory = await Category.findOne()
            .select("name noteCount")
            .sort({ noteCount: -1 })
            .lean();

        // Get categories with notes for additional stats
        const categoriesWithNotes = await Category.find({
            noteCount: { $gt: 0 }
        })
            .select("name noteCount")
            .sort({ noteCount: -1 })
            .lean();

        // Calculate average notes per category
        const averageNotesPerCategory = totalCategories > 0
            ? Math.round((totalNotes / totalCategories) * 10) / 10
            : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalCategories,
                totalNotes,
                averageNotesPerCategory,
                mostPopularCategory: mostPopularCategory || null,
                categoriesWithNotesCount: categoriesWithNotes.length,
                categoriesWithNotes: categoriesWithNotes.slice(0, 5) // Top 5 for quick view
            }
        });

    } catch (error) {
        console.error("Get category stats error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch category statistics"
        });
    }
};

// Merge categories - admin feature
const mergeCategories = async (req, res) => {
    try {
        const { sourceCategoryId, destinationCategoryId } = req.body;

        // Validate both IDs
        if (!sourceCategoryId || !destinationCategoryId) {
            return res.status(400).json({
                success: false,
                message: "Both source and destination category IDs are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(sourceCategoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Source Category ID"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(destinationCategoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Destination Category ID"
            });
        }

        // Check if source category exists
        const sourceCategory = await Category.findById(sourceCategoryId);
        if (!sourceCategory) {
            return res.status(404).json({
                success: false,
                message: "Source category not found"
            });
        }

        // Check if destination category exists
        const destinationCategory = await Category.findById(destinationCategoryId);
        if (!destinationCategory) {
            return res.status(404).json({
                success: false,
                message: "Destination category not found"
            });
        }

        // Prevent merging with itself
        if (sourceCategoryId === destinationCategoryId) {
            return res.status(400).json({
                success: false,
                message: "Source and destination categories must be different"
            });
        }

        // Check if source category has notes
        const notesCount = await Note.countDocuments({
            category: sourceCategoryId
        });

        if (notesCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Source category has no notes to merge",
                sourceCategory: sourceCategory.name
            });
        }

        // Update all notes from source to destination
        const updateResult = await Note.updateMany(
            { category: sourceCategoryId },
            { category: destinationCategoryId }
        );

        // Update noteCount for both categories
        const sourceNotesCount = await Note.countDocuments({
            category: sourceCategoryId
        });

        // Update destination noteCount (add source notes)
        await Category.findByIdAndUpdate(
            destinationCategoryId,
            {
                $inc: { noteCount: notesCount }
            }
        );

        // Delete source category (now empty)
        await Category.findByIdAndDelete(sourceCategoryId);

        res.status(200).json({
            success: true,
            message: `Categories merged successfully. ${notesCount} note(s) moved from "${sourceCategory.name}" to "${destinationCategory.name}"`,
            stats: {
                sourceCategory: sourceCategory.name,
                destinationCategory: destinationCategory.name,
                notesMoved: notesCount,
                updatedNotes: updateResult.modifiedCount
            }
        });

    } catch (error) {
        console.error("Merge categories error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to merge categories"
        });
    }
};

// Get categories with real-time note counts (for dashboard)
const getCategoriesWithCounts = async (req, res) => {
    try {
        // Use aggregation for accurate real-time counts
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: "notes",
                    localField: "_id",
                    foreignField: "category",
                    as: "notes"
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    icon: 1,
                    noteCount: { $size: "$notes" },
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: { noteCount: -1, createdAt: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error("Get categories with counts error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch categories with counts"
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    getPopularCategories,
    getCategoryStats,
    mergeCategories,
    getCategoriesWithCounts
};