"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('Auth Improvements', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV, JWT_SECRET: 'testsecret' };
    });
    afterEach(() => {
        process.env = OLD_ENV;
    });
    it('authenticates via cookie if header is missing', () => {
        const token = jsonwebtoken_1.default.sign({ id: 'cookieUser' }, 'testsecret');
        const req = {
            headers: {},
            cookies: { accessToken: token }
        };
        const res = { status: jest.fn(() => res), json: jest.fn() };
        const next = jest.fn();
        (0, auth_1.authenticateToken)(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user.id).toBe('cookieUser');
    });
    it('returns 403 for invalid token', () => {
        const req = {
            headers: { authorization: 'Bearer invalidtoken' },
            cookies: {}
        };
        const res = { status: jest.fn(() => res), json: jest.fn() };
        const next = jest.fn();
        (0, auth_1.authenticateToken)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=authImprovements.test.js.map