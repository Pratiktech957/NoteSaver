const Report = require("../models/Report");
const Note = require("../models/Note");
const User = require("../models/User");
const Notification =
    require("../models/Notification");

const createReport = async (req, res) => {
    try {


        const { noteId, reason } = req.body;

        if (!noteId || !reason) {
            return res.status(400).json({
                success: false,
                message:
                    "Note ID and reason are required"
            });
        }

        const note =
            await Note.findById(noteId)
                .populate(
                    "owner",
                    "name"
                );

        if (!note) {
            return res.status(404).json({
                success: false,
                message:
                    "Note not found"
            });
        }

        const existingReport =
            await Report.findOne({
                note: noteId,
                reportedBy: req.user.id
            });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message:
                    "You already reported this note"
            });
        }

        const report =
            await Report.create({
                note: noteId,
                reportedBy: req.user.id,
                reason
            });

        // User Notification
        await Notification.create({
            user: req.user.id,
            title: "Report Submitted",
            message:
                `Your report for "${note.title}" has been submitted successfully`,
            type: "REPORT"
        });

        // Admin Notifications
        const reporter =
            await User.findById(
                req.user.id
            ).select("name");

        const admins =
            await User.find({
                role: "admin"
            });

        for (const admin of admins) {

            await Notification.create({
                user: admin._id,
                title: "New Report Submitted",
                message:
                    `${reporter.name} reported "${note.title}"`,
                type: "ADMIN"
            });

        }

        res.status(201).json({
            success: true,
            message:
                "Report submitted successfully",
            report
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                error.message
        });

    }


};

const getAllReports = async (req, res) => {
    try {


        const reports =
            await Report.find()
                .populate(
                    "reportedBy",
                    "name email"
                )
                .populate(
                    "note",
                    "title subject"
                )
                .sort({
                    createdAt: -1
                });

        res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                error.message
        });

    }


};

const updateReportStatus = async (req, res) => {
    try {


        const { status } = req.body;

        const report =
            await Report.findById(
                req.params.id
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                message:
                    "Report not found"
            });
        }

        report.status = status;

        await report.save();

        await Notification.create({
            user: report.reportedBy,
            title:
                "Report Status Updated",
            message:
                `Your report status has been changed to "${status}"`,
            type: "REPORT_REVIEWED"
        });

        res.status(200).json({
            success: true,
            message:
                "Report updated successfully",
            report
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                error.message
        });

    }


};

const deleteReport = async (req, res) => {
    try {


        const report =
            await Report.findById(
                req.params.id
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                message:
                    "Report not found"
            });
        }

        await Notification.create({
            user: report.reportedBy,
            title: "Report Deleted",
            message:
                "An admin deleted your report",
            type: "ADMIN"
        });

        await report.deleteOne();

        res.status(200).json({
            success: true,
            message:
                "Report deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                error.message
        });

    }


};

module.exports = {
    createReport,
    getAllReports,
    updateReportStatus,
    deleteReport
};
