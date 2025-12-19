"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const tokenService_1 = require("../services/tokenService");
// Authenticate using access token from Authorization header or HttpOnly cookie `accessToken`.
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        // Prioritize header token, fallback to cookie
        let token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;
        if (!token && req.cookies) {
            token = req.cookies['accessToken'];
        }
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const user = (0, tokenService_1.verifyAccessToken)(token);
        if (!user) {
            // Differentiate missing token from invalid token if needed, but 403 is standard for invalid/expired
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal authentication error' });
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map