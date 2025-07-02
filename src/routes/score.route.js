import { Router } from "express";
import { scoreCalculate } from "../controllers/score.controller.js";
import { authHandling } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/totalScore/:id').get(authHandling,scoreCalculate)

export default router