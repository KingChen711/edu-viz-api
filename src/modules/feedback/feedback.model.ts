import mongoose, { Schema } from 'mongoose'

//Feedback Doc
export interface FeedbackDoc extends mongoose.Document {
  reservationId: mongoose.Schema.Types.ObjectId
  value: number
  content?: string
}

//Feedback Schema
const feedbackSchema = new Schema<FeedbackDoc>({
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  value: { type: Number, required: true },
  content: String
})

// Set up relationships
feedbackSchema.virtual('reservation', {
  ref: 'Reservation',
  localField: 'reservationId',
  foreignField: '_id',
  justOne: true
})

// Ensure virtual fields are serialized
feedbackSchema.set('toObject', { virtuals: true })
feedbackSchema.set('toJSON', { virtuals: true })

// Create models
export const Feedback = mongoose.model<FeedbackDoc>('Feedback', feedbackSchema)
