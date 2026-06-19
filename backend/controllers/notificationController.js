const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Notification type enum for validation
const NOTIFICATION_TYPES = [
    "UPLOAD",
    "DOWNLOAD",
    "BOOKMARK",
    "LIKE",
    "REPORT",
    "REPORT_REVIEWED",
    "ADMIN",
    "GENERAL"
];

// Helper function to validate ObjectId
const validateObjectId = (id, type = "ID") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${type}`);
    }
    return true;
};

// Helper function to emit socket events to specific user room
const emitSocketEvent = (io, userId, event, data) => {
    if (!io || !userId) {
        console.warn(`Socket emission skipped: Missing io or userId for event ${event}`);
        return;
    }

    const room = userId.toString();
    io.to(room).emit(event, data);
    console.log(`📤 Socket event emitted: ${event} to user ${room}`);
};

// Create Notification
const createNotification = async (req, res) => {
    try {
        const {
            user,
            title,
            message,
            type = "ADMIN"
        } = req.body;

        // Validate required fields
        if (!user || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "User, title, and message are required"
            });
        }

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID"
            });
        }

        // Validate notification type
        const validType = NOTIFICATION_TYPES.includes(type) ? type : "GENERAL";

        const notificationData = {
            user,
            title: title.trim(),
            message: message.trim(),
            type: validType,
            isRead: false
        };

        const notification = await Notification.create(notificationData);

        // Get populated notification for real-time updates
        const populatedNotification = await Notification.findById(notification._id)
            .populate("user", "name email")
            .lean();

        // Get Socket.IO instance and emit to specific user room
        const io = req.app.get("io");
        emitSocketEvent(io, user, "newNotification", {
            notification: populatedNotification,
            userId: user
        });

        res.status(201).json({
            success: true,
            notification: populatedNotification
        });

    } catch (error) {
        console.error("❌ Create notification error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create notification"
        });
    }
};

// Get My Notifications
const getMyNotifications = async (req, res) => {
    try {
        const { limit = 50, skip = 0 } = req.query;

        // Parse pagination parameters with validation
        const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 per request
        const skipNum = Math.max(parseInt(skip) || 0, 0);

        // Build filter with user ownership
        const filter = { user: req.user.id };

        // Get total count for pagination info
        const total = await Notification.countDocuments(filter);

        // Fetch notifications with pagination and sorting
        const notifications = await Notification.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skipNum)
            .limit(limitNum)
            .lean();

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            notifications
        });

    } catch (error) {
        console.error("❌ Get notifications error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch notifications"
        });
    }
};

// Mark Single Notification Read
const markAsRead = async (req, res) => {
    try {
        // Validate ObjectId
        validateObjectId(req.params.id, "Notification ID");

        // Find and update notification with ownership check
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            {
                $set: { isRead: true }
            },
            {
                new: true,
                runValidators: true
            }
        ).lean();

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or unauthorized"
            });
        }

        // Get Socket.IO instance and emit to specific user room
        const io = req.app.get("io");
        emitSocketEvent(io, req.user.id, "notificationRead", {
            notificationId: req.params.id,
            userId: req.user.id
        });

        res.status(200).json({
            success: true,
            notification
        });

    } catch (error) {
        console.error("❌ Mark as read error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to mark notification as read"
        });
    }
};

// Mark All Notifications Read
const markAllRead = async (req, res) => {
    try {
        // Update all unread notifications for the user
        const result = await Notification.updateMany(
            {
                user: req.user.id,
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        // Get Socket.IO instance and emit to specific user room
        const io = req.app.get("io");
        emitSocketEvent(io, req.user.id, "allNotificationsRead", {
            userId: req.user.id,
            updatedCount: result.modifiedCount
        });

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notification(s) marked as read`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("❌ Mark all read error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to mark all notifications as read"
        });
    }
};

// Delete Single Notification
const deleteNotification = async (req, res) => {
    try {
        // Validate ObjectId
        validateObjectId(req.params.id, "Notification ID");

        // Find and delete with ownership check
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or unauthorized"
            });
        }

        // Get Socket.IO instance and emit to specific user room
        const io = req.app.get("io");
        emitSocketEvent(io, req.user.id, "notificationDeleted", {
            notificationId: req.params.id,
            userId: req.user.id
        });

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (error) {
        console.error("❌ Delete notification error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete notification"
        });
    }
};

// Delete All Read Notifications
const deleteAllRead = async (req, res) => {
    try {
        // Delete all read notifications for the user
        const result = await Notification.deleteMany({
            user: req.user.id,
            isRead: true
        });

        // Get Socket.IO instance and emit to specific user room
        const io = req.app.get("io");
        emitSocketEvent(io, req.user.id, "readNotificationsDeleted", {
            userId: req.user.id,
            deletedCount: result.deletedCount
        });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} read notification(s) deleted`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error("❌ Delete all read error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete read notifications"
        });
    }
};

module.exports = {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllRead,
    deleteNotification,
    deleteAllRead
};