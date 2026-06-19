const express = require("express");

const {
    createNote,
    getAllNotes,
    getMyNotes,
    getSingleNote,
    downloadNote,
    updateNote,
    deleteNote
} = require("../controllers/noteController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

// Upload Note
router.post(
    "/",
    authMiddleware,
    upload.single("file"),
    createNote
);

// Get All Notes
router.get(
    "/",
    authMiddleware,
    getAllNotes
);

// My Notes
router.get(
    "/my",
    authMiddleware,
    getMyNotes
);

// Download Note
router.get(
    "/:id/download",
    authMiddleware,
    downloadNote
);

// Single Note
router.get(
    "/:id",
    authMiddleware,
    getSingleNote
);

// Update Note
router.put(
    "/:id",
    authMiddleware,
    updateNote
);

// Delete Note
router.delete(
    "/:id",
    authMiddleware,
    deleteNote
);

module.exports = router;