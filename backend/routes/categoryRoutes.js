const express = require("express");

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    getPopularCategories,
    getCategoryStats,
    mergeCategories,
    getCategoriesWithCounts
} = require("../controllers/categoryController");

const authMiddleware =
    require("../middleware/authMiddleware");

const adminMiddleware =
    require("../middleware/adminMiddleware");

const router = express.Router();

/* ===========================
   PUBLIC ROUTES
=========================== */

// Get All Categories
router.get(
    "/",
    getCategories
);

// Get Categories With Real Note Counts
router.get(
    "/counts",
    getCategoriesWithCounts
);

// Get Popular Categories
router.get(
    "/popular",
    getPopularCategories
);

// Get Category Statistics
router.get(
    "/stats",
    getCategoryStats
);

/* ===========================
   ADMIN ROUTES
=========================== */

// Create Category
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createCategory
);

// Merge Categories
router.post(
    "/merge",
    authMiddleware,
    adminMiddleware,
    mergeCategories
);

// Update Category
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateCategory
);

// Delete Category
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteCategory
);

module.exports = router;