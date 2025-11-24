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
      // unique: true automatically creates an index, so we don't need schema.index() below
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

// Note: lineUserId already has an index from unique: true above
// No need to add another index to avoid duplicate index warning

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

