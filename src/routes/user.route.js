import { Router } from "express";
import { signup,login,logout } from "../controllers/user.controller.js";
import { authHandling } from "../middlewares/auth.middleware.js";

const router = new Router();

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').post(authHandling,logout)

export default router