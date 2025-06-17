import { Router } from "express";
import { debateCreation } from "../controllers/debate.controller.js";
import { authHandling } from "../middlewares/auth.middleware.js";

const router = new Router();

router.route('/debate/create').post(authHandling,debateCreation)

export default router