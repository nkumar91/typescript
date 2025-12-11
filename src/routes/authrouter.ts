import express from 'express';
import * as authController from '../controller/AuthController';
import multer from 'multer';

const authRouter = express.Router();
// POST METHOD
authRouter.post("/signup",authController.signup);
authRouter.post("/login",authController.authLogin);
//GET METHOD
authRouter.get("/check",authController.getData);

authRouter.post("/formData",multer().none(),authController.formDataHandle);

authRouter.get("/check/:id",authController.getDataByParam);
export default authRouter;