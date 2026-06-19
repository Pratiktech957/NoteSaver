const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

require("./config/cloudinary");

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: {
        name: "io",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    },
    allowRequest: (req, callback) => {
        const origin = req.headers.origin;
        if (!origin || origin.includes(process.env.CLIENT_URL) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    }
});

app.set("io", io);

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id} with userId: ${socket.userId}`);

    if (socket.userId) {
        socket.join(`user:${socket.userId}`);
    }

    socket.on("joinRoom", (room) => {
        if (room.startsWith('note:') || room.startsWith('user:')) {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room ${room}`);
        }
    });

    socket.on("leaveRoom", (room) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

app.set("trust proxy", 1);

app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://*.cloudinary.com",
                "https://*.googleapis.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://*.cloudinary.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "https://*.cloudinary.com",
                "https://res.cloudinary.com"
            ],
            connectSrc: [
                "'self'",
                process.env.CLIENT_URL || "http://localhost:5173",
                "https://*.cloudinary.com",
                "wss://*.socket.io",
                "https://*.socket.io"
            ],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https://*.cloudinary.com"],
            frameSrc: [
                "https://docs.google.com",
                "https://view.officeapps.live.com"
            ],
            workerSrc: ["'self'", "blob:"],
            manifestSrc: ["'self'"]
        },
        reportOnly: false
    },
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
    noSniff: true,
    ieNoOpen: true
}));

if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined"));
} else {
    app.use(morgan("dev"));
}

app.use(compression());

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.CLIENT_URL
        ].filter(Boolean);

        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["X-Total-Count", "X-Pagination"],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/api/health" || req.path === "/api"
});
app.use("/api", limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});
app.use("/api/auth", authLimiter);

app.use(express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({
                success: false,
                message: "Invalid JSON payload"
            });
            throw new Error("Invalid JSON");
        }
    }
}));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 10000
}));

/*
|--------------------------------------------------------------------------
| CUSTOM NOSQL INJECTION SANITIZATION (Replaces express-mongo-sanitize)
|--------------------------------------------------------------------------
| This middleware safely sanitizes request data without mutating 
| read-only properties in Express 5.
*/
const sanitizeNoSQL = (req, res, next) => {
    const sanitizeObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;

        // Handle arrays
        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item));
        }

        // Handle objects
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // Remove $ and . operators from keys
            const sanitizedKey = key.replace(/[$.]/g, '');

            if (value && typeof value === 'object') {
                sanitized[sanitizedKey] = sanitizeObject(value);
            } else if (typeof value === 'string') {
                // Remove MongoDB operators from strings
                sanitized[sanitizedKey] = value.replace(/\$[a-zA-Z]+/g, '');
            } else {
                sanitized[sanitizedKey] = value;
            }
        }
        return sanitized;
    };

    try {
        // Sanitize query parameters
        if (req.query && Object.keys(req.query).length > 0) {
            req.sanitizedQuery = sanitizeObject(req.query);
        }

        // Sanitize body parameters
        if (req.body && Object.keys(req.body).length > 0) {
            req.sanitizedBody = sanitizeObject(req.body);
        }

        // Sanitize params
        if (req.params && Object.keys(req.params).length > 0) {
            req.sanitizedParams = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        console.error('NoSQL Sanitization Error:', error);
        next(error);
    }
};

// Apply custom sanitization middleware
app.use(sanitizeNoSQL);

app.use(hpp({
    whitelist: ['limit', 'page', 'sort']
}));

/*
|--------------------------------------------------------------------------
| EXPRESS-VALIDATOR GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/
app.use((req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors.array()
        });
    }
    next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        res.setHeader("Cache-Control", "public, max-age=31536000");
    }
}));

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Notes Saver API Running",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
    });
});

app.get("/api/admin/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Admin Route Working"
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});

app.use((err, req, res, next) => {
    console.error("Error Stack:", err.stack);
    console.error("Error Message:", err.message);

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}. Please use a different value.`
        });
    }

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors
        });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please log in again."
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired. Please log in again."
        });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File is too large. Maximum size is 5MB."
        });
    }

    if (err.status === 400 && err.message === "Invalid JSON") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON payload"
        });
    }

    const statusCode = err.statusCode || 500;
    const response = {
        success: false,
        message: err.message || "Internal Server Error"
    };

    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
        response.details = err.details || null;
    }

    res.status(statusCode).json(response);
});

const PORT = process.env.PORT || 5000;

const startServer = () => {
    server.listen(PORT, () => {
        console.log(`🚀 Server Running On Port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔒 Security: ${process.env.NODE_ENV === "production" ? "Production" : "Development"}`);
    });
};

const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

startServer();