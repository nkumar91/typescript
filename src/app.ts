import express  from "express";
import authRouter from "./routes/authrouter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { applySecurity, authLimiter } from "./middleware/security";

const app = express();

// Apply security middleware (must be before routes)
applySecurity(app);

// app.use is builtin middleware of Express
app.use(express.json()); // application label middleware
app.use(express.urlencoded({extended:true}))

// Apply stricter rate limiting to auth routes
app.use("/auth/signup", authLimiter);
app.use("/auth/login", authLimiter);

app.use("/auth", authRouter); // router based middleware

// 404 Not Found handler
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;