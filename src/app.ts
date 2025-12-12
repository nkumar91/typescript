import express  from "express";
import authRouter from "./routes/authrouter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { applySecurity, authLimiter } from "./middleware/security";
import { applyPerformanceOptimizations } from "./middleware/performance";

const app = express();

// Apply performance optimizations (must be early)
applyPerformanceOptimizations(app);

// Apply security middleware
applySecurity(app);

// app.use is builtin middleware of Express
app.use(express.json()); // application label middleware
app.use(express.urlencoded({extended:true}))

// Apply stricter rate limiting to auth routes
app.use("/auth/signup", authLimiter);
app.use("/auth/login", authLimiter);

app.use("/auth", authRouter); // router based middleware

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 404 Not Found handler
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;