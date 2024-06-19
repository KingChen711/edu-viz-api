import mongoose, { Schema } from 'mongoose'

//Subject Doc
export interface SubjectDoc extends mongoose.Document {
  name: string
  image: string
  description?: string
}

//Subject Schema
const subjectSchema = new Schema<SubjectDoc>({
  name: { type: String, unique: true, required: true },
  image: { type: String, default: '/images/default-subject.png' },
  description: String
})

// Set up relationships
subjectSchema.virtual('packages', {
  ref: 'Package',
  localField: '_id',
  foreignField: 'subjectId'
})

// Ensure virtual fields are serialized
subjectSchema.set('toObject', { virtuals: true })
subjectSchema.set('toJSON', { virtuals: true })

// Create models
export const Subject = mongoose.model<SubjectDoc>('Subject', subjectSchema)
