import { Router } from "express";
import { signup,login,logout,sendOTP, checkSignedUp } from "../controllers/user.controller.js";
import { authHandling } from "../middlewares/auth.middleware.js";

const router = new Router();

router.route('/signup').post(signup)
router.route('/check/signup').post(checkSignedUp)
router.route('/login').post(login)
router.route('/send/otp').post(sendOTP)
router.route('/logout').post(authHandling,logout)

export default router