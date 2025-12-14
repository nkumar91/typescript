// src/index.ts
import http from "http";

// src/app.ts
import express2 from "express";
import dotenv2 from "dotenv";

// src/routes/authrouter.ts
import express from "express";

// src/model/user.model.ts
import { DataTypes, Model } from "sequelize";

// src/config/db.ts
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();
var sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false
  }
);

// src/model/user.model.ts
var User = class extends Model {
  id;
  name;
  email;
  phone;
  password;
  createdAt;
  updatedAt;
};
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255)
    }
  },
  {
    sequelize,
    // connection
    tableName: "users",
    // DB table name
    modelName: "User",
    // Sequelize model name
    timestamps: true
  }
);

// src/controller/AuthController.ts
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
var getJwtSecret = () => process.env.JWT_SECRET || "t6d_6Gf^2**145@62$$&1kH@";
var signJwt = (payload, expiresIn) => {
  try {
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, { expiresIn: expiresIn || JWT_EXPIRE });
  } catch (err) {
    return null;
  }
};
var verifyJwt = (token) => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded;
  } catch (err) {
    return null;
  }
};

// src/controller/AuthController.ts
var signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      res.status(400).json({
        status: "failed",
        message: errorMessages
      });
      return;
    }
    const { name, email, password, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const info = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });
    const resData = info.toJSON();
    if (resData) {
      const token = signJwt({ id: info.id, email: resData.email });
      res.status(201).json({
        status: "success",
        message: "Signup Successfully",
        data: {
          id: info.id,
          name: resData.name,
          email: resData.email,
          phone: resData.phone,
          token
        }
      });
    }
  } catch (err) {
    console.error("Sql Error", err);
    res.status(500).json(
      {
        status: "failed",
        message: "email or phone already exists"
      }
    );
  }
};
var getData = (req, res, next) => {
  const { name, age } = req.query;
  res.json({
    data: name
  });
};
var authLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      res.status(400).json({
        status: "failed",
        message: errorMessages
      });
      return;
    }
    const { email, password } = req.body;
    const getUser = await User.findOne({
      where: { email },
      attributes: ["id", "name", "email", "phone", "password"],
      raw: true
    });
    if (!getUser) {
      console.warn(`Login attempt with non-existent email: ${email}`);
      res.status(401).json({
        status: "failed",
        message: "Invalid email"
      });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, getUser.password);
    if (!isPasswordValid) {
      console.warn(`Failed login attempt for email: ${email}`);
      res.status(401).json({
        status: "failed",
        message: "Invalid password"
      });
      return;
    }
    console.log(`User logged in successfully: ${email}`);
    const token = signJwt({ id: getUser.id, email: getUser.email });
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        id: getUser.id,
        name: getUser.name,
        email: getUser.email,
        phone: getUser.phone,
        token
      }
    });
  } catch (err) {
    console.error("Login Error", err);
    res.status(500).json({
      status: "failed",
      message: "Internal server error"
    });
  }
};
var getDataByParam = (req, res, next) => {
  const { id } = req.params;
  res.json({
    data: id
  });
};
var formDataHandle = (req, res) => {
  try {
    const bodyData = req.body;
    res.json({
      allData: bodyData
    });
  } catch (err) {
  }
};

// src/routes/authrouter.ts
import multer from "multer";

// src/utils/validators.ts
import { body } from "express-validator";
var signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters").matches(/^[a-zA-Z\s'-]+$/).withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage("Password must contain uppercase, lowercase, number, and special character (@$!%*?&)"),
  body("phone").trim().notEmpty().withMessage("Phone number is required").matches(/^[0-9]{10,12}$/).withMessage("Phone must be 10-12 digits")
];
var loginValidation = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];

// src/middleware/auth.ts
var requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "failed", message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyJwt(token);
  if (!decoded) {
    return res.status(401).json({ status: "failed", message: "Invalid or expired token" });
  }
  req.user = decoded;
  next();
};

// src/routes/authrouter.ts
var authRouter = express.Router();
authRouter.post("/signup", signupValidation, signup);
authRouter.post("/login", loginValidation, authLogin);
authRouter.get("/check", getData);
authRouter.get("/profile", requireAuth, (req, res) => {
  res.json({ status: "success", data: req.user });
});
authRouter.post("/formData", multer().none(), formDataHandle);
authRouter.get("/check/:id", getDataByParam);
var authrouter_default = authRouter;

// src/middleware/errorHandler.ts
var errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[ERROR] Status: ${status}, Message: ${message}`, err);
  res.status(status).json({
    status: "failed",
    message,
    ...process.env.NODE_ENV === "development" && { stack: err.stack }
  });
};
var notFoundHandler = (req, res, next) => {
  console.warn(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    status: "failed",
    message: "Route not found"
  });
};

// src/middleware/security.ts
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
var corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // limit each IP to 5 requests per windowMs
  message: "Too many login/signup attempts, please try again later.",
  skipSuccessfulRequests: false
});

// src/middleware/performance.ts
import compression from "compression";
var compressionMiddleware = compression({
  level: 6,
  // Compression level 0-9 (6 is good balance)
  threshold: 1024,
  // Compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  }
});
var cacheMiddleware = (req, res, next) => {
  if (req.path.match(/\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$/)) {
    res.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (req.path.startsWith("/api/")) {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  } else {
    res.set("Cache-Control", "public, max-age=3600");
  }
  next();
};
var responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - start;
    res.set("X-Response-Time", `${duration}ms`);
    if (duration > 1e3) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.path} - ${duration}ms`);
    }
    return originalJson(data);
  };
  next();
};
var bodySizeLimitMiddleware = (req, res, next) => {
  const contentLength = parseInt(req.get("content-length") || "0", 10);
  const maxSize = 10 * 1024 * 1024;
  if (contentLength > maxSize) {
    return res.status(413).json({
      status: "failed",
      message: "Payload too large"
    });
  }
  next();
};
var applyPerformanceOptimizations = (app2) => {
  app2.use(compressionMiddleware);
  app2.use(cacheMiddleware);
  app2.use(responseTimeMiddleware);
  app2.use(bodySizeLimitMiddleware);
  app2.set("trust proxy", 1);
};

// src/app.ts
dotenv2.config();
var app = express2();
applyPerformanceOptimizations(app);
app.use(express2.json());
app.use(express2.urlencoded({ extended: true }));
app.use("/auth/signup", authLimiter);
app.use("/auth/login", authLimiter);
app.use("/auth", authrouter_default);
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use(notFoundHandler);
app.use(errorHandler);
var app_default = app;

// src/index.ts
var PORT = process.env.PORT;
var server = http.createServer(app_default);
server.listen(PORT, function() {
  console.log(`Server started at http://localhost:${PORT}`);
});
async function testDB() {
  try {
    await sequelize.authenticate();
    console.log("\u2705 Database connection successful!");
    await sequelize.sync();
    console.log("\u2705 Models synced");
  } catch (error) {
    console.error("\u274C Unable to connect to the database:", error);
  }
}
testDB();
