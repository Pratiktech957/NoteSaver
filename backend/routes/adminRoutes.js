const express = require("express");

console.log("Admin Routes Loaded");

const {
    getStats,
    getAllUsers,
    blockUser,
    deleteUser,
    getAllNotesAdmin,
    getAdminAnalytics
} = require("../controllers/adminController");

const authMiddleware =
    require("../middleware/authMiddleware");

const adminMiddleware =
    require("../middleware/adminMiddleware");

const router = express.Router();

// Dashboard Stats
router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    getStats
);

// Advanced Analytics
router.get(
    "/analytics",
    authMiddleware,
    adminMiddleware,
    getAdminAnalytics
);

// Get All Users
router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);

// Test Route
router.get(
    "/hello",
    (req, res) => {
        res.send("Hello Admin");
    }
);

// Block / Unblock User
router.put(
    "/block/:id",
    authMiddleware,
    adminMiddleware,
    blockUser
);

// Delete User
router.delete(
    "/user/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);

// Get All Notes
router.get(
    "/notes",
    authMiddleware,
    adminMiddleware,
    getAllNotesAdmin
);

module.exports = router;
