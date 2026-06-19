const express = require("express");

const {
    createReport,
    getAllReports,
    updateReportStatus,
    deleteReport
} = require("../controllers/reportController");

const authMiddleware =
    require("../middleware/authMiddleware");

const adminMiddleware =
    require("../middleware/adminMiddleware");

const router = express.Router();

/*
=================================
USER ROUTES
=================================
*/

// Create Report
router.post(
    "/",
    authMiddleware,
    createReport
);

/*
=================================
ADMIN ROUTES
=================================
*/

// Get All Reports
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllReports
);

// Update Report Status
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateReportStatus
);

// Delete Report
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteReport
);

module.exports = router;