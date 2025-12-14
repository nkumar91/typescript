import { Request, Response, NextFunction } from 'express';
import { verifyJwt, TokenPayload } from '../utils/jwt';

export interface RequestWithUser extends Request {
    user?: TokenPayload;
}

export const requireAuth = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'failed', message: 'Unauthorized' });
    }

    const token:any = authHeader.split(' ')[1];
    const decoded = verifyJwt<TokenPayload>(token);
    if (!decoded) {
        return res.status(401).json({ status: 'failed', message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
};
