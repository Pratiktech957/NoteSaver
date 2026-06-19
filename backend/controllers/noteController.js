const Note = require("../models/Note");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// Helper function to increment download count
const incrementDownloadCount = async (noteId) => {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
        throw new Error("Invalid Note ID");
    }

    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        {
            $inc: { downloads: 1 }
        },
        {
            new: true,
            projection: "downloads"
        }
    ).lean();

    if (!updatedNote) {
        throw new Error("Note not found");
    }

    return updatedNote;
};

// Helper function to handle category management
const handleCategoryManagement = async (categoryId, noteId) => {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid Category ID");
    }

    const category = await Category.findById(categoryId);
    if (!category) {
        throw new Error("Category not found");
    }

    // Decrement noteCount
    await Category.findByIdAndUpdate(
        categoryId,
        {
            $inc: { noteCount: -1 }
        }
    );

    // Check if category is empty and delete if noteCount <= 0
    const updatedCategory = await Category.findById(categoryId);
    if (updatedCategory && updatedCategory.noteCount <= 0) {
        await Category.findByIdAndDelete(categoryId);
        return { deleted: true, categoryName: updatedCategory.name };
    }

    return { deleted: false };
};

// Helper function to validate ObjectId
const validateObjectId = (id, type = "ID") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${type}`);
    }
    return true;
};

// Helper function to emit socket events
const emitSocketEvent = (io, event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

const createNote = async (req, res) => {
    try {
        const {
            title,
            subject,
            category,
            customCategory,
            description
        } = req.body;

        // Validate required fields
        if (!title || !subject) {
            return res.status(400).json({
                success: false,
                message: "Title and Subject are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File is required"
            });
        }

        let categoryDoc = null;

        // Existing category selected
        if (category) {
            // Validate category ID
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Category ID"
                });
            }

            categoryDoc = await Category.findById(category);

            if (!categoryDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }
        }

        // Create new category automatically with case-insensitive matching
        if (!categoryDoc && customCategory) {
            const trimmedName = customCategory.trim();

            // Sanitize input to prevent regex injection
            const sanitizedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Case-insensitive search to prevent duplicate categories
            categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') }
            });

            if (!categoryDoc) {
                // Create new category with proper capitalization
                const capitalizedName = trimmedName.charAt(0).toUpperCase() +
                    trimmedName.slice(1).toLowerCase();

                categoryDoc = await Category.create({
                    name: capitalizedName,
                    description: `${capitalizedName} Notes`,
                    icon: "📚",
                    noteCount: 0
                });
            }
        }

        if (!categoryDoc) {
            return res.status(400).json({
                success: false,
                message: "Please select or create a category"
            });
        }

        // Create note with file information
        const noteData = {
            title: title.trim(),
            subject: subject.trim(),
            category: categoryDoc._id,
            customCategory: customCategory || "",
            description: description ? description.trim() : "",
            fileUrl: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            owner: req.user.id
        };

        const note = await Note.create(noteData);

        // Increment category note count
        await Category.findByIdAndUpdate(
            categoryDoc._id,
            {
                $inc: { noteCount: 1 }
            }
        );

        // User notification
        await Notification.create({
            user: req.user.id,
            title: "Note Uploaded",
            message: `${title.trim()} uploaded successfully`,
            type: "UPLOAD"
        });

        // Notify admins with bulk insert
        const uploader = await User.findById(req.user.id).select("name").lean();
        const admins = await User.find({
            role: "admin"
        }).select("_id").lean();

        if (admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
                user: admin._id,
                title: "New Note Uploaded",
                message: `${uploader.name} uploaded "${title.trim()}"`,
                type: "ADMIN"
            }));

            await Notification.insertMany(adminNotifications);
        }

        // Increment user upload count
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $inc: { uploadCount: 1 }
            }
        );

        // Get populated note with lean for performance
        const populatedNote = await Note.findById(note._id)
            .populate("owner", "name email")
            .populate("category", "name icon")
            .lean();

        // Get Socket.IO instance
        const io = req.app.get("io");

        // Emit socket events for real-time updates
        if (io) {
            // Emit new note event with populated data
            emitSocketEvent(io, "newNote", populatedNote);

            // Emit dashboard update event
            emitSocketEvent(io, "dashboardUpdate", {
                type: "NEW_NOTE",
                note: populatedNote
            });

            // Emit category updated event
            emitSocketEvent(io, "categoryUpdated", {
                categoryId: categoryDoc._id,
                noteCount: categoryDoc.noteCount + 1
            });

            // Emit new notification event
            emitSocketEvent(io, "newNotification", {
                userId: req.user.id,
                title: "Note Uploaded",
                message: `${title.trim()} uploaded successfully`,
                type: "UPLOAD"
            });

            // Emit admin notification event for each admin
            admins.forEach(admin => {
                emitSocketEvent(io, "newNotification", {
                    userId: admin._id,
                    title: "New Note Uploaded",
                    message: `${uploader.name} uploaded "${title.trim()}"`,
                    type: "ADMIN"
                });
            });
        }

        res.status(201).json({
            success: true,
            message: "Note uploaded successfully",
            note: populatedNote
        });

    } catch (error) {
        console.error("Create note error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create note"
        });
    }
};

const getAllNotes = async (req, res) => {
    try {
        const { search, category, subject } = req.query;

        // Build filter object
        const filter = { status: "active" };

        // Search optimization - prepared for future search features
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            if (mongoose.Types.ObjectId.isValid(category)) {
                filter.category = category;
            }
        }

        if (subject) {
            filter.subject = { $regex: subject, $options: 'i' };
        }

        // Use lean() and projection for better performance
        const notes = await Note.find(filter)
            .select("title subject description fileUrl fileType fileSize views downloads createdAt")
            .populate("owner", "name email")
            .populate("category", "name icon")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: notes.length,
            notes
        });

    } catch (error) {
        console.error("Get all notes error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch notes"
        });
    }
};

const getMyNotes = async (req, res) => {
    try {
        const { search, category, subject } = req.query;

        // Build filter object
        const filter = { owner: req.user.id };

        // Search optimization - prepared for future search features
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            if (mongoose.Types.ObjectId.isValid(category)) {
                filter.category = category;
            }
        }

        if (subject) {
            filter.subject = { $regex: subject, $options: 'i' };
        }

        // Use lean() and projection for better performance
        const notes = await Note.find(filter)
            .select("title subject description fileUrl fileType fileSize views downloads createdAt")
            .populate("category", "name icon")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: notes.length,
            notes
        });

    } catch (error) {
        console.error("Get my notes error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch your notes"
        });
    }
};

const getSingleNote = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Note ID"
            });
        }

        // Use $inc for atomic view increment
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { views: 1 }
            },
            {
                new: true,
                projection: "title subject description fileUrl fileType fileSize views downloads owner category createdAt"
            }
        )
            .populate("owner", "name email")
            .populate("category", "name icon")
            .lean();

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            note: updatedNote
        });

    } catch (error) {
        console.error("Get single note error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch note"
        });
    }
};

// Download note endpoint - increments download count
const downloadNote = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Note ID"
            });
        }

        // Increment download count using atomic update
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { downloads: 1 }
            },
            {
                new: true,
                projection: "fileUrl fileType title downloads"
            }
        ).lean();

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        // Get Socket.IO instance
        const io = req.app.get("io");

        // Emit socket event for real-time download update
        if (io) {
            emitSocketEvent(io, "noteDownloaded", {
                noteId: req.params.id,
                downloads: updatedNote.downloads
            });
        }

        // Return file information for download
        res.status(200).json({
            success: true,
            message: "Download count incremented",
            fileUrl: updatedNote.fileUrl,
            fileType: updatedNote.fileType,
            title: updatedNote.title
        });

    } catch (error) {
        console.error("Download note error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to process download"
        });
    }
};

// Update Note
const updateNote = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Note ID"
            });
        }

        // Find note
        const note = await Note.findById(req.params.id).lean();

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        // Check authorization
        const isOwner = note.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this note"
            });
        }

        const {
            title,
            subject,
            description,
            category
        } = req.body;

        // Validate required fields
        if (!title || !subject) {
            return res.status(400).json({
                success: false,
                message: "Title and Subject are required"
            });
        }

        // Trim all text fields
        const trimmedTitle = title.trim();
        const trimmedSubject = subject.trim();
        const trimmedDescription = description ? description.trim() : "";

        if (!trimmedTitle || !trimmedSubject) {
            return res.status(400).json({
                success: false,
                message: "Title and Subject cannot be empty"
            });
        }

        // Prepare update data
        const updateData = {
            title: trimmedTitle,
            subject: trimmedSubject,
            description: trimmedDescription
        };

        let oldCategoryId = note.category;
        let newCategoryId = null;

        // Handle category update
        if (category) {
            // Validate category ID
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Category ID"
                });
            }

            // Check if category exists
            const categoryDoc = await Category.findById(category);
            if (!categoryDoc) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            // Only update if category is different
            if (category.toString() !== oldCategoryId.toString()) {
                newCategoryId = category;
                updateData.category = category;

                // Decrease old category noteCount
                await Category.findByIdAndUpdate(
                    oldCategoryId,
                    {
                        $inc: { noteCount: -1 }
                    }
                );

                // Increase new category noteCount
                await Category.findByIdAndUpdate(
                    newCategoryId,
                    {
                        $inc: { noteCount: 1 }
                    }
                );
            }
        }

        // Update note
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("owner", "name email")
            .populate("category", "name icon")
            .lean();

        // Get Socket.IO instance
        const io = req.app.get("io");

        // Emit socket events for real-time updates
        if (io) {
            // Emit note updated event
            emitSocketEvent(io, "noteUpdated", updatedNote);

            // Emit dashboard update event
            emitSocketEvent(io, "dashboardUpdate", {
                type: "NOTE_UPDATED",
                note: updatedNote
            });

            // Emit category updated event if category changed
            if (newCategoryId) {
                // Check if old category was deleted
                const oldCategory = await Category.findById(oldCategoryId).lean();
                if (!oldCategory) {
                    emitSocketEvent(io, "categoryUpdated", {
                        categoryId: oldCategoryId,
                        deleted: true
                    });
                } else {
                    emitSocketEvent(io, "categoryUpdated", {
                        categoryId: oldCategoryId,
                        noteCount: oldCategory.noteCount
                    });
                }

                const newCategory = await Category.findById(newCategoryId).lean();
                if (newCategory) {
                    emitSocketEvent(io, "categoryUpdated", {
                        categoryId: newCategoryId,
                        noteCount: newCategory.noteCount
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Note updated successfully",
            note: updatedNote
        });

    } catch (error) {
        console.error("Update note error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update note"
        });
    }
};

const deleteNote = async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Note ID"
            });
        }

        // Use lean() for better performance
        const note = await Note.findById(req.params.id).lean();

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        // Check authorization
        const isOwner = note.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this note"
            });
        }

        // Delete the note
        await Note.findByIdAndDelete(req.params.id);

        // Handle category management (decrement count and delete if empty)
        let categoryDeleted = false;
        let categoryName = "";
        try {
            const categoryResult = await handleCategoryManagement(note.category);
            if (categoryResult.deleted) {
                categoryDeleted = true;
                categoryName = categoryResult.categoryName;
                console.log(`Category "${categoryResult.categoryName}" was auto-deleted as it became empty`);
            }
        } catch (categoryError) {
            console.error("Category management error:", categoryError);
            // Continue with deletion even if category management fails
        }

        // Admin notification if admin deletes someone else's note
        if (isAdmin && !isOwner) {
            await Notification.create({
                user: note.owner,
                title: "Note Removed",
                message: `${note.title} was removed by an administrator`,
                type: "ADMIN"
            });
        }

        // Decrement user upload count
        await User.findByIdAndUpdate(
            note.owner,
            {
                $inc: { uploadCount: -1 }
            }
        );

        // Get Socket.IO instance
        const io = req.app.get("io");

        // Emit socket events for real-time updates
        if (io) {
            // Emit note deleted event
            emitSocketEvent(io, "noteDeleted", {
                noteId: req.params.id,
                categoryId: note.category
            });

            // Emit dashboard update event
            emitSocketEvent(io, "dashboardUpdate", {
                type: "NOTE_DELETED",
                noteId: req.params.id
            });

            // Emit category updated event if category was deleted or updated
            if (categoryDeleted) {
                emitSocketEvent(io, "categoryUpdated", {
                    categoryId: note.category,
                    deleted: true,
                    categoryName: categoryName
                });
            } else {
                const updatedCategory = await Category.findById(note.category).lean();
                if (updatedCategory) {
                    emitSocketEvent(io, "categoryUpdated", {
                        categoryId: note.category,
                        noteCount: updatedCategory.noteCount
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });

    } catch (error) {
        console.error("Delete note error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete note"
        });
    }
};

module.exports = {
    createNote,
    getAllNotes,
    getMyNotes,
    getSingleNote,
    downloadNote,
    updateNote,
    deleteNote
};