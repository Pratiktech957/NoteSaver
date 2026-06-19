const express = require("express");

const {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllRead,
    deleteNotification,
    deleteAllRead
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* Create Notification */
router.post(
    "/",
    authMiddleware,
    createNotification
);

/* Get My Notifications */
router.get(
    "/",
    authMiddleware,
    getMyNotifications
);

/* Mark All Notifications As Read */
router.put(
    "/mark-all-read",
    authMiddleware,
    markAllRead
);

/* Mark Single Notification As Read */
router.put(
    "/:id/read",
    authMiddleware,
    markAsRead
);

/* Delete Single Notification */
router.delete(
    "/:id",
    authMiddleware,
    deleteNotification
);

/* Delete All Read Notifications */
router.delete(
    "/delete-read",
    authMiddleware,
    deleteAllRead
);

module.exports = router;