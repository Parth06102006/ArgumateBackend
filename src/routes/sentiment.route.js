import { Router } from "express";
import {emotionAnalysis, sentimentAnalysis} from '../controllers/sentiment.controller.js'
import { authHandling } from "../middlewares/auth.middleware.js";

const router = new Router();

router.route('/find/sentiment').post(authHandling,sentimentAnalysis)
router.route('/find/emotion').post(authHandling,emotionAnalysis)

export default router