import { ObjectId } from 'mongoose'

export type TWebsite = {
  _id: string
  websiteName: string
  verified: boolean
  reviewId: string[]
  rating: number
}

export interface IRating {
  name: string
  score: number
  baseRating: number
}

export interface IFeedback {
  _id: string
  website: ObjectId | TWebsite
  ProductQuality: IRating[]
  CustomerServices: IRating[]
  PlatformExperience: IRating[]
}

export interface IReview {
  _id: string
  siteId: ObjectId | TWebsite
  rating: number
  reviewMessage: string
  feedback: {
    ProductQuality: []
    CustomerServices: []
    PlatformExperience: []
  }
}
