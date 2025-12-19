import { authenticateToken } from '../middleware/auth';
import jwt from 'jsonwebtoken';

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
        const token = jwt.sign({ id: 'cookieUser' }, 'testsecret');
        const req: any = {
            headers: {},
            cookies: { accessToken: token }
        };
        const res: any = { status: jest.fn(() => res), json: jest.fn() };
        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user.id).toBe('cookieUser');
    });

    it('returns 403 for invalid token', () => {
        const req: any = {
            headers: { authorization: 'Bearer invalidtoken' },
            cookies: {}
        };
        const res: any = { status: jest.fn(() => res), json: jest.fn() };
        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
