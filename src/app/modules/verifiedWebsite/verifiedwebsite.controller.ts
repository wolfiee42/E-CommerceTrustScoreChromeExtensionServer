import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { VerifiedWebsiteServices } from './verifiedwebsite.services'

const checkVerifiedWebsite = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.query

  if (!name) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'URL parameter is required',
      data: null,
    })
  }

  const result = await VerifiedWebsiteServices.checkVerifiedWebsiteFromDB(
    name as string
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'The website has been successfully retrieved.',
    data: result,
  })
})

const addFeedback = catchAsync(async (req: Request, res: Response) => {
  const result = await VerifiedWebsiteServices.addFeedback(req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'The website feedback has been successfully retrieved.',
    data: result,
  })
})

const AiGeneratedFeedback = catchAsync(async (req: Request, res: Response) => {
  const result = await VerifiedWebsiteServices.AiGeneratedFeedback(
    req.params.id
  )

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'The website feedback has been successfully retrieved.',
    data: result,
  })
})

export const VerifiedWebsiteController = {
  checkVerifiedWebsite,
  addFeedback,
  AiGeneratedFeedback,
}
