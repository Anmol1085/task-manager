import jwt from 'jsonwebtoken';
export declare function createAccessToken(payload: object): string;
export declare function verifyAccessToken(token: string): string | jwt.JwtPayload | null;
export declare function createRefreshToken(userId: string): Promise<{
    token: string;
    expiresAt: Date;
}>;
export declare function rotateRefreshToken(oldToken: string, userId: string): Promise<{
    token: string;
    expiresAt: Date;
}>;
export declare function findRefreshToken(token: string): Promise<any>;
export declare function revokeRefreshToken(token: string): Promise<any>;
declare const _default: {
    createAccessToken: typeof createAccessToken;
    createRefreshToken: typeof createRefreshToken;
    findRefreshToken: typeof findRefreshToken;
    rotateRefreshToken: typeof rotateRefreshToken;
    revokeRefreshToken: typeof revokeRefreshToken;
};
export default _default;
//# sourceMappingURL=tokenService.d.ts.map