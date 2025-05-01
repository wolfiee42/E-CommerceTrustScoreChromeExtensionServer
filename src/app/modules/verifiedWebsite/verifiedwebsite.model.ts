import { Schema, model } from 'mongoose'
import { IFeedback, IReview, TWebsite } from './verifiedwebsite.interface'

const websiteSchema = new Schema<TWebsite>(
  {
    websiteName: {
      type: String,
      required: true,
      unique: true,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    reviewId: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const RatingSchema = new Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  baseRating: { type: Number, required: true },
})

const FeedBackSchema = new Schema<IFeedback>({
  website: {
    type: Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
  },
  ProductQuality: { type: [RatingSchema], required: true },
  CustomerServices: { type: [RatingSchema], required: true },
  PlatformExperience: { type: [RatingSchema], required: true },
})

const ReviewSchema = new Schema<IReview>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    rating: { type: Number, required: true },
    reviewMessage: { type: String, required: true },
    feedback: {
      ProductQuality: [{}],
      CustomerServices: [{}],
      PlatformExperience: [{}],
    },
  },
  { timestamps: true }
)

export const Website = model<TWebsite>('Website', websiteSchema)
export const Feedback = model<IFeedback>('Feedback', FeedBackSchema)
export const Review = model<IReview>('Review', ReviewSchema)
