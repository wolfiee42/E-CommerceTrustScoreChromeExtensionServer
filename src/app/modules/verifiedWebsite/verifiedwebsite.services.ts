import OpenAI from 'openai'
import AppError from '../../errors/AppError'
import { IRating, IReview } from './verifiedwebsite.interface'
import { Feedback, Review, Website } from './verifiedwebsite.model'
import mongoose from 'mongoose'
import {
  calculateBayesianAverage,
  calculateFinalRating,
} from '../../utils/calculateRating'
import dayjs from 'dayjs'
import configaration from '../../configaration'

const checkVerifiedWebsiteFromDB = async (websiteName: string) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  const findWebsite = await Website.findOne({ websiteName })
  if (findWebsite) {
    const result = {
      website: await Website.findOne({ websiteName })
        .select('verified rating')
        .lean()
        .exec(),
      recentReviews: await Review.aggregate([
        { $match: { siteId: findWebsite._id } },
        { $sort: { createdAt: -1 } },
        // { $limit: 3 },
      ]),
      mostCommonFeedback: await Review.aggregate([
        { $match: { siteId: findWebsite._id } }, // Match reviews for the specific website
        {
          $project: {
            allFeedback: {
              $concatArrays: [
                '$feedback.ProductQuality',
                '$feedback.CustomerServices',
                '$feedback.PlatformExperience',
              ],
            },
          },
        },
        { $unwind: '$allFeedback' }, // Flatten the combined feedback array
        { $group: { _id: '$allFeedback.name', count: { $sum: 1 } } }, // Group by feedback name and count occurrences
        { $sort: { count: -1 } }, // Sort by count in descending order
        { $limit: 5 }, // Limit to the top 5 most common feedback items
        {
          $project: {
            feedbackName: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]),
    }

    return result
  } else {
    try {
      // Create website data
      const result = await Website.create(
        [
          {
            websiteName: websiteName,
            verified: false,
            reviewId: [],
            rating: 0,
          },
        ],
        { session }
      )

      // Commit the transaction
      await session.commitTransaction()
      return result[0]
    } catch (error) {
      await session.abortTransaction()
    } finally {
      // End the session
      session.endSession()
    }
  }
}

const addFeedback = async (payload: IReview) => {
  const isExistWebsiteData = await Website.findById(payload.siteId)

  if (!isExistWebsiteData) {
    throw new AppError(404, 'Requested website does not found!')
  }

  // // !commneting api summurization
  const review = await processingReviewMessageFormOpenAI(payload.reviewMessage)

  const userFeedback = payload.feedback

  const checkboxScores = Object.values(userFeedback).flatMap(array =>
    array.map(item => item.baseRating)
  )

  // console.log('checkboxScores', checkboxScores)
  const globalAverage = 3.5
  const minThreshold = 10

  const feedbackRating = calculateBayesianAverage(
    checkboxScores,
    globalAverage,
    minThreshold
  )

  const reviews = await Review.find({ siteId: isExistWebsiteData._id })
  // console.log('reviews', reviews)
  // given
  // // Find the feedback data using the website ID
  // // ! Why are we finding feedback from database?? I don't understand what's happening from here. -- by fahad
  // all the review ratings and time occured for the site
  // const ratings = [5, 4, 3, 5, 4] // Array of ratings (1-5 stars)
  // const times = [0, 7, 30, 90, 120] // Time since each rating was given (in days)
  // const decayConstant = 0.01 // Decay constant for Exponential Time Decay
  const currentDate = dayjs()
  const ratings = reviews.map(review => review.rating)

  const times = reviews.map(review => {
    const createdAt = dayjs(review.createdAt) // Use dayjs to parse createdAt
    if (createdAt.isValid()) {
      const timeDiff = currentDate.diff(createdAt, 'day') // Calculate difference in days
      return timeDiff
    } else {
      console.error(`Invalid date encountered: ${review.createdAt}`)
      return NaN // Handle invalid date case explicitly
    }
  })

  const decayConstant = 0.01

  const finalRating = calculateFinalRating(
    ratings,
    times,
    globalAverage,
    minThreshold,
    decayConstant
  ).toFixed(2)

  const feedback = await Feedback.findOne({ website: payload.siteId })
  if (feedback) {
    // throw new AppError(404, 'Feedback data for the website not found!')
    //* write code here
    // Determine the target category array based on the review's category
    let targetCategoryArray: IRating[]
    switch (review.category) {
      case 'Product Quality':
        targetCategoryArray = feedback.ProductQuality
        break
      case 'Customer Service':
        targetCategoryArray = feedback.CustomerServices
        break
      case 'Platform Experience':
        targetCategoryArray = feedback.PlatformExperience
        break
      default:
        throw new AppError(400, 'Invalid category returned by OpenAI!')
    }

    // Check if the name already exists in the array
    const existingRating = targetCategoryArray.find(
      item => item.name === review.class
    )

    if (existingRating) {
      // Increment the score if the name exists
      existingRating.score += 1
    } else {
      // Push a new rating object if the name does not exist
      targetCategoryArray.push({
        name: review.class,
        score: 1,
        baseRating: Number(review.baseRating),
      })
    }

    // Save the updated feedback document
    const reviewPayload = {
      siteId: payload.siteId,
      feedback: {
        ProductQuality: payload.feedback.productQuality,
        CustomerServices: payload.feedback.customerService,
        PlatformExperience: payload.feedback.platformExperience,
      },
      reviewMessage: payload.reviewMessage,
    }
    await feedback.save()
    reviewPayload.rating = feedbackRating
    await Review.create(reviewPayload)

    isExistWebsiteData.rating = Number(finalRating)
    await isExistWebsiteData.save()

    //please calculate main rating--------------
    return feedback
  } else {
    let ProductQualityArray: IRating[] = []
    let customerServicesArray: IRating[] = []
    let PlatformExperienceArray: IRating[] = []
    switch (review.category) {
      case 'Product Quality':
        ProductQualityArray = [
          {
            name: review.class,
            score: 1,
            baseRating: Number(review.baseRating),
          },
        ]
        break
      case 'Customer Service':
        customerServicesArray = [
          {
            name: review.class,
            score: 1,
            baseRating: Number(review.baseRating),
          },
        ]
        break
      case 'Platform Experience':
        PlatformExperienceArray = [
          {
            name: review.class,
            score: 1,
            baseRating: Number(review.baseRating),
          },
        ]
        break
      default:
        throw new AppError(400, 'Invalid category returned by OpenAI!')
    }
    const payloadData = {
      website: isExistWebsiteData._id,
      ProductQuality: ProductQualityArray,
      CustomerServices: customerServicesArray,
      PlatformExperience: PlatformExperienceArray,
    }
    await Feedback.create(payloadData)

    const reviewPayload = {
      siteId: payload.siteId,
      feedback: {
        ProductQuality: payload.feedback.productQuality,
        CustomerServices: payload.feedback.customerService,
        PlatformExperience: payload.feedback.platformExperience,
      },
      reviewMessage: payload.reviewMessage,
    }
    reviewPayload.rating = Number(feedbackRating)
    isExistWebsiteData.rating = Number(feedbackRating)

    await isExistWebsiteData.save()
    return await Review.create(reviewPayload)
  }
}

const processingReviewMessageFormOpenAI = async (
  message: string
): Promise<{ class: string; category: string; baseRating: string }> => {
  const openai = new OpenAI({
    apiKey: configaration.openai_api_key,
  })

  const prompt = `
  Please analyze the following review message and perform the following tasks:
  1. Provide a 2-3 word summary of the review.
  2. Categorize the review into one of these categories:
     - Product Quality
     - Customer Service
     - Platform Experience
  3. Assign a base rating (1-5) based on the overall sentiment of the review.
  
  Review Message: "${message}"
  
  Respond in JSON format as follows:
  {
    "class": "<summary in Pascal Case>",
    "category": "<selected category>",
    "baseRating": <numeric rating>
  }
  `

  // const prompt = `Please analyze the review message below and complete the following tasks:

  // Review Message: "${message}"

  // *Tasks:*

  // 1. Classify the review message into 2 word classes in English that best describe the message.

  // 2. Categorize the review message into one of the following categories:
  //    - Product Quality
  //    - Customer Service
  //    - Platform Experience

  // 3. Based on the classification and category, assign a rating on a scale of 0 to 1, where 0 is the lowest and 1 is the highest.

  // Provide the response in the following JSON format:

  // {
  //   "class": "<selected class in Pascal Case separated by space>",
  //   "category": "<selected category>",
  //   "baseRating": "<selected rating in number>"
  // }`

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 120,
  })

  const processResult = response.choices[0].message.content?.trim() || ''
  return JSON.parse(processResult)
}

const AiGeneratedFeedback = async (id: string) => {
  const feedbackData = await Feedback.findOne({ website: id }).lean()

  const topTwoFeedback = (ratings: IRating[]) =>
    ratings.sort((a, b) => b.score - a.score).slice(0, 2)

  return {
    ProductQuality: topTwoFeedback(feedbackData?.ProductQuality || []),
    CustomerServices: topTwoFeedback(feedbackData?.CustomerServices || []),
    PlatformExperience: topTwoFeedback(feedbackData?.PlatformExperience || []),
  }
}

export const VerifiedWebsiteServices = {
  checkVerifiedWebsiteFromDB,
  addFeedback,
  AiGeneratedFeedback,
}
