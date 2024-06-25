import mongoose, { Schema } from 'mongoose'

export type ReservationStatus = {
  PENDING: 'Pending'
  PROGRESS: 'Progress'
  COMPLETED: 'Completed'
  REJECT: 'Reject'
}

//Reservation Doc
export interface ReservationDoc extends mongoose.Document {
  studentId: mongoose.Schema.Types.ObjectId
  packageId: mongoose.Schema.Types.ObjectId
  duration: number
  paidPrice: number
  createdAt: Date
  status: ReservationStatus
  feedback?: {
    value: number
    content?: string
    createdAt: Date
  }
}

//Reservation Schema
const reservationSchema = new Schema<ReservationDoc>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    duration: { type: Number, requited: true },
    paidPrice: { type: Number, requited: true },
    status: {
      type: String,
      enum: ['Pending', 'Progress', 'Completed', 'Reject'] as const,
      require: true
    },
    feedback: {
      type: {
        value: { type: Number, required: true },
        content: String,
        createdAt: { type: Date, required: true, default: Date.now() }
      },
      default: undefined
    }
  },
  { timestamps: true }
)

// Set up relationships
reservationSchema.virtual('package', {
  ref: 'Package',
  localField: 'packageId',
  foreignField: '_id',
  justOne: true
})

reservationSchema.virtual('student', {
  ref: 'User',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
})

// Ensure virtual fields are serialized
reservationSchema.set('toObject', { virtuals: true })
reservationSchema.set('toJSON', { virtuals: true })

// Create models
export const Reservation = mongoose.model<ReservationDoc>('Reservation', reservationSchema)
