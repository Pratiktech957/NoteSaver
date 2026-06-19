const User = require("../models/User");

const getProfile = async (req, res) => {

    try {

        const user =
            await User.findById(
                req.user.id
            ).select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const notesCount =
            await Note.countDocuments({
                owner: user._id
            });

        const totalDownloads =
            await Note.aggregate([
                {
                    $match: {
                        owner: user._id
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$downloads"
                        }
                    }
                }
            ]);

        const totalViews =
            await Note.aggregate([
                {
                    $match: {
                        owner: user._id
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$views"
                        }
                    }
                }
            ]);

        res.status(200).json({
            success: true,
            user: {
                ...user.toObject(),

                notesCount,

                downloadCount:
                    totalDownloads[0]?.total || 0,

                totalViews:
                    totalViews[0]?.total || 0
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateProfile = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            bio,
            profileImage
        } = req.body;

        const user =
            await User.findById(
                req.user.id
            );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        user.name =
            name || user.name;

        user.email =
            email || user.email;

        user.phone =
            phone || user.phone;

        user.bio =
            bio || user.bio;

        user.profileImage =
            profileImage ||
            user.profileImage;

        await user.save();

        const updatedUser =
            await User.findById(
                req.user.id
            ).select("-password");

        res.status(200).json({
            success: true,
            message:
                "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getProfile,
    updateProfile
};