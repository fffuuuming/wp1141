import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  lineUserId: string;
  displayName?: string;
  pictureUrl?: string;
  statusMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  messageCount: number;
}

const UserSchema: Schema = new Schema(
  {
    lineUserId: {
      type: String,
      required: true,
      unique: true,
      // Index is defined below using schema.index()
    },
    displayName: {
      type: String,
    },
    pictureUrl: {
      type: String,
    },
    statusMessage: {
      type: String,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure index on lineUserId for fast lookups
UserSchema.index({ lineUserId: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

