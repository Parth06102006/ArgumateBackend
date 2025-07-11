import { Router } from "express";
import { debateCreation, getDebateTopics, restartDebate } from "../controllers/debate.controller.js";
import { authHandling } from "../middlewares/auth.middleware.js";

const router = new Router();

router.route('/debate/create').post(authHandling,debateCreation)
router.route('/debate/restart').post(authHandling,restartDebate)
router.route('/debate/topics').get(authHandling,getDebateTopics)

export default router