import mongoose, { Schema, Document, Model } from 'mongoose';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker';
export type MessageRole = 'user' | 'bot';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: MessageRole;
  type: MessageType;
  content: string;
  metadata?: {
    [key: string]: unknown;
  };
  timestamp: Date;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'sticker'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by conversation and timestamp
MessageSchema.index({ conversationId: 1, timestamp: 1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;

