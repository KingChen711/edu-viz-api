import mongoose, { Schema } from 'mongoose'

export enum PackageStatus {
  PENDING = 'Pending',
  REJECT = 'Reject',
  ACTIVE = 'Active',
  DISABLE = 'Disable'
}

//Package Doc
export interface PackageDoc extends mongoose.Document {
  subjectId: mongoose.Schema.Types.ObjectId
  tutorId: mongoose.Schema.Types.ObjectId
  pricePerHour: number
  images: string[]
  video?: string
  status: PackageStatus
  createdAt: Date
}

//Package Schema
const packageSchema = new Schema<PackageDoc>(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
    pricePerHour: { type: Number, required: true },
    images: { type: [String], default: [], required: true },
    video: String,
    status: {
      type: String,
      enum: ['Pending', 'Reject', 'Active', 'Disable'] as const,
      require: true
    }
  },
  { timestamps: true }
)

//Index
packageSchema.index({ subjectId: 1, tutorId: 1 }, { unique: true })

// Set up relations
packageSchema.virtual('tutor', {
  ref: 'User',
  localField: 'tutorId',
  foreignField: '_id',
  justOne: true
})

packageSchema.virtual('subject', {
  ref: 'Subject',
  localField: 'subjectId',
  foreignField: '_id',
  justOne: true
})

packageSchema.virtual('reservations', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'packageId'
})

// Ensure virtual fields are serialized
packageSchema.set('toObject', { virtuals: true })
packageSchema.set('toJSON', { virtuals: true })

// Create models
export const Package = mongoose.model<PackageDoc>('Package', packageSchema)
