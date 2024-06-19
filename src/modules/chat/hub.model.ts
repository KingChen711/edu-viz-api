import mongoose, { Schema } from 'mongoose'

//Hub Doc
export interface HubDoc extends mongoose.Document {
  createdAt: Date
  lastMessageAt: Date
  userIds: mongoose.Schema.Types.ObjectId[]
}

//Hub Schema
const hubSchema = new Schema<HubDoc>(
  {
    lastMessageAt: { type: Date, default: Date.now() },
    userIds: { type: [mongoose.Schema.Types.ObjectId], default: [] }
  },
  { timestamps: true }
)

// Set up relationships
hubSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'hubId'
})

hubSchema.virtual('users', {
  ref: 'User',
  localField: 'userIds',
  foreignField: '_id'
})

// Ensure virtual fields are serialized
hubSchema.set('toObject', { virtuals: true })
hubSchema.set('toJSON', { virtuals: true })

// Create models
export const Hub = mongoose.model<HubDoc>('Hub', hubSchema)
