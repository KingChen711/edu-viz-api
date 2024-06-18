import mongoose, { Schema } from 'mongoose'

// User Schema
const userSchema = new Schema({
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  clerkId: { type: String, unique: true, sparse: true }, // 'sparse' allows null values in a unique index
  email: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  avatar: { type: String, default: '/images/default-avatar.png' }
  // gender Gender?
  // bornYear Int?
  // phone String?
})

// Set up field for populated role
userSchema.virtual('role', {
  ref: 'Role',
  localField: 'roleId',
  foreignField: '_id',
  justOne: true
})

// Ensure virtual fields are serialized
userSchema.set('toObject', { virtuals: true })
userSchema.set('toJSON', { virtuals: true })

// Create models
export const User = mongoose.model('User', userSchema)
