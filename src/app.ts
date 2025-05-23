import express from 'express'
import globalErrorHandler from './app/middlewares/globalErrorHandler'
import notFound from './app/middlewares/notFound'
import router from './app/routes'
import cookieParser from 'cookie-parser'
import cors from 'cors'

// middleware
const app = express()
app.use(express.json())
app.use(cors({ origin: '*' }))
app.use(cookieParser())

// api endpoints
app.use('/api/v1', router)

// error handler
app.use(globalErrorHandler)

// 404 page
app.use(notFound)

export default app
