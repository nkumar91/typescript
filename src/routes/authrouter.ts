import express from 'express';
import * as authController from '../controller/AuthController';
import multer from 'multer';
import { signupValidation, loginValidation } from '../utils/validators';
import { requireAuth, RequestWithUser } from '../middleware/auth';
const authRouter = express.Router();

// POST METHOD
authRouter.post("/signup", signupValidation, authController.signup);
authRouter.post("/login", loginValidation, authController.authLogin);
//GET METHOD
authRouter.get("/check",authController.getData);
// Protected route example
authRouter.get('/profile', requireAuth, (req: RequestWithUser, res) => {
	res.json({ status: 'success', data: req.user });
});
authRouter.post("/formData",multer().none(),authController.formDataHandle);
authRouter.get("/check/:id",authController.getDataByParam);
export default authRouter;