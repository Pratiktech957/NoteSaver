const multer = require("multer");

const {
    CloudinaryStorage
} = require(
    "multer-storage-cloudinary"
);

const cloudinary =
    require("../config/cloudinary");

const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

const storage =
    new CloudinaryStorage({

        cloudinary,

        params: async (
            req,
            file
        ) => {

            if (
                !allowedTypes.includes(
                    file.mimetype
                )
            ) {
                throw new Error(
                    "Only PDF, JPG, JPEG, PNG, DOCX and PPTX files are allowed"
                );
            }

            return {

                folder:
                    "notes-saver",

                resource_type:
                    file.mimetype ===
                        "application/pdf"
                        ? "raw"
                        : "image",

                public_id:
                    Date.now() +
                    "-" +
                    file.originalname
                        .split(".")[0]

            };

        }

    });

const upload = multer({

    storage,

    limits: {
        fileSize:
            10 * 1024 * 1024
    }

});

module.exports = upload;