import express from 'express'
import { VerifiedWebsiteController } from './verifiedwebsite.controller'
const router = express.Router()

router.get('/check', VerifiedWebsiteController.checkVerifiedWebsite)

router.post('/review', VerifiedWebsiteController.addFeedback)

router.get(
  '/ai-generated-feedback/:id',
  VerifiedWebsiteController.AiGeneratedFeedback
)

export const VerifiedWebsiteRoute = router
