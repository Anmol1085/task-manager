"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const tokenService_1 = require("../services/tokenService");
const router = express_1.default.Router();
const prisma_1 = __importDefault(require("../prisma"));
// const prisma = new PrismaClient();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(1)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
function setTokenCookies(res, accessToken, refreshToken, refreshExpiresAt) {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
}
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: { email, password: hashedPassword, name }
        });
        const accessToken = (0, tokenService_1.createAccessToken)({ id: user.id });
        const { token: refreshToken, expiresAt } = await (0, tokenService_1.createRefreshToken)(user.id);
        setTokenCookies(res, accessToken, refreshToken, expiresAt);
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required' });
        // const { email, password } = loginSchema.parse(req.body); // Original line, now replaced by manual check
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const accessToken = (0, tokenService_1.createAccessToken)({ id: user.id });
        const { token: refreshToken, expiresAt } = await (0, tokenService_1.createRefreshToken)(user.id);
        setTokenCookies(res, accessToken, refreshToken, expiresAt);
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (error) {
        console.error('Login error:', error?.message || String(error));
        res.status(500).json({ error: 'Login failed' });
    }
});
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token)
            return res.status(401).json({ error: 'Not authenticated' });
        const decoded = require('../services/tokenService').verifyAccessToken(token);
        if (!decoded)
            return res.status(401).json({ error: 'Invalid token' });
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ id: user.id, email: user.email, name: user.name, profilePicture: user.profilePicture });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});
router.put('/me', async (req, res) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token)
            return res.status(401).json({ error: 'Not authenticated' });
        const decoded = require('../services/tokenService').verifyAccessToken(token);
        if (!decoded)
            return res.status(401).json({ error: 'Invalid token' });
        const { name, profilePicture } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Name is required' });
        const user = await prisma_1.default.user.update({ where: { id: decoded.id }, data: { name, profilePicture } });
        res.json({ id: user.id, email: user.email, name: user.name, profilePicture: user.profilePicture });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken)
            return res.status(401).json({ error: 'Refresh token required' });
        const dbToken = await (0, tokenService_1.findRefreshToken)(refreshToken);
        if (!dbToken || dbToken.expiresAt < new Date()) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }
        // rotate
        const { token: newRefresh, expiresAt } = await (0, tokenService_1.rotateRefreshToken)(refreshToken, dbToken.userId);
        const accessToken = (0, tokenService_1.createAccessToken)({ id: dbToken.userId });
        setTokenCookies(res, accessToken, newRefresh, expiresAt);
        res.json({ userId: dbToken.userId });
    }
    catch (err) {
        res.status(500).json({ error: 'Refresh failed' });
    }
});
router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken)
            await (0, tokenService_1.revokeRefreshToken)(refreshToken);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Logout failed' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map