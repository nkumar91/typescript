import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';
import rateLimit from 'express-rate-limit';

// Configure CORS
export const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Rate limiting middleware
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiter for login/signup
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 5 requests per windowMs
    message: 'Too many login/signup attempts, please try again later.',
    skipSuccessfulRequests: false,
});

// Apply security middleware
export const applySecurity = (app: Express) => {
    // Helmet helps secure Express apps by setting various HTTP headers
    app.use(helmet());

    // CORS configuration
    app.use(cors(corsOptions));

    // General rate limiter
    app.use(limiter);

    // Remove powered by header
    app.disable('x-powered-by');

    // Prevent parameter pollution
    app.use((req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            // Remove any null or undefined values
            Object.keys(req.body).forEach(key => {
                if (req.body[key] === null || req.body[key] === undefined) {
                    delete req.body[key];
                }
            });
        }
        next();
    });
};
