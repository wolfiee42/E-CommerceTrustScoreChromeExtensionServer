import { Router } from 'express'
import { VerifiedWebsiteRoute } from '../modules/verifiedWebsite/verifiedwebsite.route'

const router = Router()

const moduleRoutes = [
  {
    path: '/website',
    route: VerifiedWebsiteRoute,
  },
]

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router
