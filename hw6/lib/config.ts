import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Line Configuration
  LINE_CHANNEL_SECRET: z.string().min(1, 'LINE_CHANNEL_SECRET is required'),
  LINE_CHANNEL_ACCESS_TOKEN: z
    .string()
    .min(1, 'LINE_CHANNEL_ACCESS_TOKEN is required'),

  // MongoDB Configuration
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .refine(
      (val) => {
        // Accept both mongodb:// and mongodb+srv:// URLs
        return val.startsWith('mongodb://') || val.startsWith('mongodb+srv://');
      },
      { message: 'MONGODB_URI must start with mongodb:// or mongodb+srv://' }
    ),

  // LLM Configuration
  LLM_PROVIDER: z.enum(['openai', 'anthropic']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional Configuration
  LLM_MAX_RETRIES: z.coerce.number().int().positive().default(3),
  LLM_RETRY_DELAY: z.coerce.number().int().positive().default(1000),

  // Embedding Configuration
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1536),
});

// Validate environment variables
function validateEnv() {
  const env = {
    LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
    LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    MONGODB_URI: process.env.MONGODB_URI,
    LLM_PROVIDER: process.env.LLM_PROVIDER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    LLM_MAX_RETRIES: process.env.LLM_MAX_RETRIES,
    LLM_RETRY_DELAY: process.env.LLM_RETRY_DELAY,
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
    EMBEDDING_DIMENSIONS: process.env.EMBEDDING_DIMENSIONS,
  };

  // Validate required fields based on LLM provider
  const result = envSchema.safeParse(env);

  if (!result.success) {
    throw new Error(
      `Invalid environment variables: ${result.error.issues
        .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`
    );
  }

  // Additional validation: ensure API key exists for selected provider
  if (result.data.LLM_PROVIDER === 'openai' && !result.data.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER is openai');
  }

  if (
    result.data.LLM_PROVIDER === 'anthropic' &&
    !result.data.ANTHROPIC_API_KEY
  ) {
    throw new Error(
      'ANTHROPIC_API_KEY is required when LLM_PROVIDER is anthropic'
    );
  }

  return result.data;
}

// Export validated configuration
export const config = validateEnv();

// Type-safe config access
export type Config = typeof config;

