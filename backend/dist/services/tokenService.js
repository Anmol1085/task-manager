"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessToken = createAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.createRefreshToken = createRefreshToken;
exports.rotateRefreshToken = rotateRefreshToken;
exports.findRefreshToken = findRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
// const prisma = new PrismaClient();
function createAccessToken(payload) {
    const secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '15m' });
}
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        return null;
    }
}
async function createRefreshToken(userId) {
    const token = crypto_1.default.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    await prisma_1.default.refreshToken.create({
        data: { token, userId, expiresAt }
    });
    return { token, expiresAt };
}
async function rotateRefreshToken(oldToken, userId) {
    // remove old token and create a new one
    await prisma_1.default.refreshToken.deleteMany({ where: { token: oldToken, userId } });
    return createRefreshToken(userId);
}
async function findRefreshToken(token) {
    return prisma_1.default.refreshToken.findUnique({ where: { token } });
}
async function revokeRefreshToken(token) {
    return prisma_1.default.refreshToken.deleteMany({ where: { token } });
}
exports.default = { createAccessToken, createRefreshToken, findRefreshToken, rotateRefreshToken, revokeRefreshToken };
//# sourceMappingURL=tokenService.js.map