"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('authenticateToken middleware', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV, JWT_SECRET: 'testsecret' };
    });
    afterEach(() => {
        process.env = OLD_ENV;
    });
    it('returns 401 when no token present', () => {
        const req = { headers: {} };
        const res = { status: jest.fn(() => res), json: jest.fn() };
        const next = jest.fn();
        (0, auth_1.authenticateToken)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });
    it('allows request when token is valid', () => {
        const token = jsonwebtoken_1.default.sign({ id: 'alice' }, 'testsecret');
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = {};
        const next = jest.fn();
        (0, auth_1.authenticateToken)(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
    });
});
//# sourceMappingURL=authMiddleware.test.js.map