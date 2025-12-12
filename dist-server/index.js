"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routes_1 = require("./routes");
const static_1 = require("./static");
const http_1 = require("http");
const express_session_1 = require("express-session");
const memorystore_1 = require("memorystore");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const MemoryStore = (0, memorystore_1.default)(express_session_1.default);
app.use(express_1.default.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    },
}));
app.use(express_1.default.urlencoded({ extended: false }));
// Session middleware
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "imarisha-loan-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 86400000, // 24 hours
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    },
}));
// API routes
(0, routes_1.registerRoutes)(app, httpServer);
// Serve static files
(0, static_1.serveStatic)(app);
// Error handling
app.use((err, _req, res, _next) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
});
// Start server
const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API available at http://localhost:${port}/api`);
});
