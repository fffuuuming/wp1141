import mongoose, { Schema, Document, Model } from 'mongoose';

export type KnowledgeBaseCategory =
  | 'defi-basics'
  | 'dex'
  | 'liquidity-mining'
  | 'lending'
  | 'risks'
  | 'smart-contracts';

export interface IKnowledgeBase extends Document {
  question: string;
  answer: string;
  category: KnowledgeBaseCategory;
  embedding?: number[]; // 1536 dimensions for text-embedding-3-small
  metadata?: {
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    source?: string;
    [key: string]: unknown;
  };
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeBaseSchema: Schema = new Schema(
  {
    question: {
      type: String,
      required: true,
      index: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['defi-basics', 'dex', 'liquidity-mining', 'lending', 'risks', 'smart-contracts'],
      required: true,
      index: true,
    },
    embedding: {
      type: [Number],
      default: undefined,
      // Note: MongoDB doesn't have native vector search in community edition
      // For Atlas, we'll use vector search index separately
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
KnowledgeBaseSchema.index({ category: 1 });
KnowledgeBaseSchema.index({ question: 'text' }); // Text index for keyword search (optional)

const KnowledgeBase: Model<IKnowledgeBase> =
  mongoose.models.KnowledgeBase ||
  mongoose.model<IKnowledgeBase>('KnowledgeBase', KnowledgeBaseSchema);

export default KnowledgeBase;

