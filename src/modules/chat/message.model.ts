import mongoose, { Schema } from 'mongoose'

//Message Doc
export interface MessageDoc extends mongoose.Document {
  senderId: mongoose.Schema.Types.ObjectId
  receiverId: mongoose.Schema.Types.ObjectId
  hubId: mongoose.Schema.Types.ObjectId
  isSeen: boolean
  createdAt: Date
  image?: string
  video?: string
  content?: string
}

//Message Schema
const messageSchema = new Schema<MessageDoc>(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
    isSeen: { type: Boolean, required: true, default: false },
    image: String,
    video: String,
    content: String
  },
  { timestamps: true }
)

// Set up relationships
messageSchema.virtual('hub', {
  ref: 'Hub',
  localField: 'hubId',
  foreignField: '_id',
  justOne: true
})

messageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
})

messageSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true
})

// Ensure virtual fields are serialized
messageSchema.set('toObject', { virtuals: true })
messageSchema.set('toJSON', { virtuals: true })

// Create models
export const Message = mongoose.model<MessageDoc>('Message', messageSchema)
