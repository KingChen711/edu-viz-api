import mongoose, { Schema } from 'mongoose'
import { Role as ERole } from '../../types'

//Role Doc
export interface RoleDoc extends mongoose.Document {
  roleName: ERole
}

//Role Schema
const roleSchema = new Schema<RoleDoc>({
  roleName: { type: String, enum: ['Admin', 'Tutor', 'Student'], unique: true, required: true }
})

// Set up relationships
roleSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'roleId'
})

// Ensure virtual fields are serialized
roleSchema.set('toObject', { virtuals: true })
roleSchema.set('toJSON', { virtuals: true })

// Create models
export const Role = mongoose.model<RoleDoc>('Role', roleSchema)
