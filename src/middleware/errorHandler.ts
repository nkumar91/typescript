import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    status?: number;
    statusCode?: number;
}

// Global error handling middleware
export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get status code
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error for debugging
    console.error(`[ERROR] Status: ${status}, Message: ${message}`, err);

    // Send error response
    res.status(status).json({
        status: 'failed',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 Not Found middleware
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.warn(`[404] Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        status: 'failed',
        message: 'Route not found'
    });
};

// Async error wrapper for catching errors in async route handlers
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
