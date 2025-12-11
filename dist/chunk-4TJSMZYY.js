import {
  authLogin,
  formDataHandle,
  getData,
  getDataByParam,
  signup
} from "./chunk-C6GKSQGS.js";

// src/routes/authrouter.ts
import express from "express";
import multer from "multer";
var authRouter = express.Router();
authRouter.post("/signup", signup);
authRouter.post("/login", authLogin);
authRouter.get("/check", getData);
authRouter.post("/formData", multer().none(), formDataHandle);
authRouter.get("/check/:id", getDataByParam);
var authrouter_default = authRouter;

export {
  authrouter_default
};
//# sourceMappingURL=chunk-4TJSMZYY.js.map