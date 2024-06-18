import mongoose, { Schema } from 'mongoose'

//Role Doc
export interface RoleDoc extends mongoose.Document {
  roleName: string
}

//Role Schema
const roleSchema = new Schema({
  roleName: { type: String, unique: true, required: true }
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
