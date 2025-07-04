import {Router} from 'express'
import { notesAnalyzer } from '../controllers/notes.controller.js'
import { authHandling } from '../middlewares/auth.middleware.js'


const router = Router()


router.route('/create/notes/:id').get(authHandling,notesAnalyzer);


export default router