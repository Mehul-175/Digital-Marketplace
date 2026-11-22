import { Router } from 'express'
import { getAllPublicPartner, getPartner, updatePartner } from '../controllers/partner.controller.js'
import partnerMiddleware from '../middlewares/partner.middleware.js'

const router = Router()

router.get('/partner',partnerMiddleware, getPartner)
router.patch('/partner',partnerMiddleware, updatePartner)
router.get('/all-partners', getAllPublicPartner)


export default router