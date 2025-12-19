import { authenticateToken } from '../middleware/auth';
import jwt from 'jsonwebtoken';

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
    const req: any = { headers: {} };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('allows request when token is valid', () => {
    const token = jwt.sign({ id: 'alice' }, 'testsecret');
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = {};
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
});
