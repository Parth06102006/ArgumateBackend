import { createSpeech,voiceToText,createPoiQues,createPoiAns,sentimentalAnalysis } from "../controllers/speech.controller.js";
import { authHandling } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js'

const router = Router();

router.route('/create/speech/:id').post(authHandling,createSpeech);
router.route('/create/voice').post(upload.single('audio'),voiceToText);
router.route('/create/sentimentalAnalysis').post(sentimentalAnalysis);
router.route('/create/poiQues/:id').post(authHandling,createPoiQues);
router.route('/create/poiAns/:id').post(authHandling,createPoiAns);

export default router;