// src/index.ts
import http from "http";

// src/app.ts
import express2 from "express";

// src/routes/authrouter.ts
import express from "express";

// src/model/user.model.ts
import { DataTypes, Model } from "sequelize";

// src/config/db.ts
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();
var DATABASE = process.env.DB_NAME;
var USER = process.env.DB_USER;
var PASSWORD = process.env.DB_PASS;
console.log(DATABASE, USER, PASSWORD);
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
      res.status(201).json({
        status: "success",
        message: "Signup Successfully",
        data: {
          id: info.id,
          name: resData.name,
          email: resData.email,
          phone: resData.phone
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
    const getUser = await User.findOne({ where: { email } });
    if (!getUser) {
      console.warn(`Login attempt with non-existent email: ${email}`);
      res.status(401).json({
        status: "failed",
        message: "Invalid email or password"
      });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, getUser.password);
    if (!isPasswordValid) {
      console.warn(`Failed login attempt for email: ${email}`);
      res.status(401).json({
        status: "failed",
        message: "Invalid email or password"
      });
      return;
    }
    console.log(`User logged in successfully: ${email}`);
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        id: getUser.id,
        name: getUser.name,
        email: getUser.email,
        phone: getUser.phone
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

// src/routes/authrouter.ts
var authRouter = express.Router();
authRouter.post("/signup", signupValidation, signup);
authRouter.post("/login", loginValidation, authLogin);
authRouter.get("/check", getData);
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
  max: 5,
  // limit each IP to 5 requests per windowMs
  message: "Too many login/signup attempts, please try again later.",
  skipSuccessfulRequests: false
});
var applySecurity = (app2) => {
  app2.use(helmet());
  app2.use(cors(corsOptions));
  app2.use(limiter);
  app2.disable("x-powered-by");
  app2.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] === null || req.body[key] === void 0) {
          delete req.body[key];
        }
      });
    }
    next();
  });
};

// src/app.ts
var app = express2();
applySecurity(app);
app.use(express2.json());
app.use(express2.urlencoded({ extended: true }));
app.use("/auth/signup", authLimiter);
app.use("/auth/login", authLimiter);
app.use("/auth", authrouter_default);
app.use(notFoundHandler);
app.use(errorHandler);
var app_default = app;

// src/index.ts
import dotenv2 from "dotenv";
dotenv2.config();
var PORT = process.env.PORT;
var server = http.createServer(app_default);
server.listen(PORT, function() {
  console.log(`Server started at http://localhost:${PORT}`);
});
async function testDB() {
  try {
    await sequelize.authenticate();
    console.log("\u2705 Database connection successful!");
    await sequelize.sync({ alter: true });
    console.log("\u2705 Models synced");
  } catch (error) {
    console.error("\u274C Unable to connect to the database:", error);
  }
}
testDB();
