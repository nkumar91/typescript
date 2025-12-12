import { Express } from 'express';
import compression from 'compression';

/**
 * Performance Optimization Middleware
 * Includes caching, compression, and request/response optimization
 */

// Gzip compression middleware
export const compressionMiddleware = compression({
    level: 6, // Compression level 0-9 (6 is good balance)
    threshold: 1024, // Compress responses larger than 1KB
    filter: (req, res) => {
        // Don't compress responses with this request header
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Use compression filter function
        return compression.filter(req, res);
    }
});

// Cache headers middleware
export const cacheMiddleware = (req: any, res: any, next: any) => {
    // Set cache headers based on route
    if (req.path.match(/\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$/)) {
        // Static assets - cache for 1 year
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.path.startsWith('/api/')) {
        // API responses - no cache
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    } else {
        // HTML - cache for 1 hour
        res.set('Cache-Control', 'public, max-age=3600');
    }
    next();
};

// Response time tracking middleware
export const responseTimeMiddleware = (req: any, res: any, next: any) => {
    const start = Date.now();

    // Override res.json to track response time
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
        const duration = Date.now() - start;
        res.set('X-Response-Time', `${duration}ms`);
        
        // Log slow requests (> 1000ms)
        if (duration > 1000) {
            console.warn(`[SLOW REQUEST] ${req.method} ${req.path} - ${duration}ms`);
        }

        return originalJson(data);
    };

    next();
};

// Body size limit middleware
export const bodySizeLimitMiddleware = (req: any, res: any, next: any) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const maxSize = 10 * 1024 * 1024; // 10MB limit

    if (contentLength > maxSize) {
        return res.status(413).json({
            status: 'failed',
            message: 'Payload too large'
        });
    }
    next();
};

// Apply all performance optimizations
export const applyPerformanceOptimizations = (app: Express) => {
    // Compression
    app.use(compressionMiddleware);

    // Cache headers
    app.use(cacheMiddleware);

    // Response time tracking
    app.use(responseTimeMiddleware);

    // Body size limit
    app.use(bodySizeLimitMiddleware);

    // Keep-alive connections
    app.set('trust proxy', 1);
};
