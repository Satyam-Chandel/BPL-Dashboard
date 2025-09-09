"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const initiatives_1 = __importDefault(require("./routes/initiatives"));
const workload_1 = __importDefault(require("./routes/workload"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const comments_1 = __importDefault(require("./routes/comments"));
const files_1 = __importDefault(require("./routes/files"));
const export_1 = __importDefault(require("./routes/export"));
const settings_1 = __importDefault(require("./routes/settings"));
const search_1 = __importDefault(require("./routes/search"));
const activity_1 = __importDefault(require("./routes/activity"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
exports.prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('combined'));
}
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'BPL Commander API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/initiatives', initiatives_1.default);
app.use('/api/workload', workload_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/comments', comments_1.default);
app.use('/api/files', files_1.default);
app.use('/api/export', export_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/search', search_1.default);
app.use('/api/activity', activity_1.default);
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
const server = app.listen(PORT, () => {
    console.log(`🚀 BPL Commander API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map