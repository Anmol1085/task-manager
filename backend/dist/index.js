"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const upload_1 = __importDefault(require("./routes/upload"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_2 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://10.20.9.181:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://10.20.9.181:3000"
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/tasks', auth_2.authenticateToken, tasks_1.default);
app.use('/api/notifications', auth_2.authenticateToken, notifications_1.default);
app.use('/api/upload', auth_2.authenticateToken, upload_1.default);
// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join', (userId) => {
        socket.join(userId);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
// Make io accessible in routes
app.set('io', io);
app.use(errorHandler_1.errorHandler);
const PORT = Number(process.env.PORT) || 5001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map