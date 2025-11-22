import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  lineUserId: string;
  title?: string;
  messageCount: number;
  lastMessageAt: Date;
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
  metadata?: {
    [key: string]: unknown;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lineUserId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
ConversationSchema.index({ lineUserId: 1, lastMessageAt: -1 });
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ConversationSchema.index({ isActive: 1, lastMessageAt: -1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;

