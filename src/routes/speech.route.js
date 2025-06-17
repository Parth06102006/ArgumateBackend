import { createSpeech,createPoiQues,createPoiAns } from "../controllers/speech.controller";
import { authHandling } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.route('/create/speech/:id').post(authHandling,createSpeech);
router.route('/create/poiQues/:id').post(authHandling,createPoiQues);
router.route('/create/poiAns/:id').post(authHandling,createPoiAns);

export default router;