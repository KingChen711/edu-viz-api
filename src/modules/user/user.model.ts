import mongoose, { Schema } from 'mongoose'

//User Doc
export interface UserDoc extends mongoose.Document {
  roleId: mongoose.Schema.Types.ObjectId
  clerkId: string
  email: string
  fullName: string
  avatar: string
  tutor?: {
    isAvailable: boolean
    bio?: string
    album: string[]
    automaticGreeting: string
  }
}

// User Schema
const userSchema = new Schema<UserDoc>({
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  clerkId: { type: String, unique: true, sparse: true }, // 'sparse' allows null values in a unique index
  email: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  avatar: { type: String, default: '/images/default-avatar.png' },
  tutor: {
    isAvailable: { type: Boolean, default: false },
    automaticGreeting: {
      type: String,
      default: "Welcome! I'm here to help you succeed. Looking forward to working with you!"
    },
    bio: String,
    album: [String]
  }
  // gender Gender?
  // bornYear Int?
  // phone String?
})

// Set up relations
userSchema.virtual('role', {
  ref: 'Role',
  localField: 'roleId',
  foreignField: '_id',
  justOne: true
})

userSchema.virtual('packages', {
  ref: 'Package',
  localField: '_id',
  foreignField: 'tutorId'
})

userSchema.virtual('reservations', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'studentId'
})

// Ensure virtual fields are serialized
userSchema.set('toObject', { virtuals: true })
userSchema.set('toJSON', { virtuals: true })

// Create models
export const User = mongoose.model<UserDoc>('User', userSchema)
