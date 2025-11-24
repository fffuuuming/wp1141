/**
 * Vector utility functions for similarity calculations
 */

/**
 * Calculate cosine similarity between two vectors
 * Cosine similarity measures the cosine of the angle between two vectors
 * Returns a value between -1 and 1, where 1 means identical direction
 * 
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Cosine similarity value between -1 and 1
 * @throws Error if vectors have different lengths or are empty
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(
      `Vectors must have the same length. Got ${vecA.length} and ${vecB.length}`
    );
  }

  if (vecA.length === 0) {
    throw new Error('Vectors cannot be empty');
  }

  // Calculate dot product
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  // Calculate denominator (magnitudes)
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  // Avoid division by zero
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Normalize a vector to unit length
 * @param vec - Vector to normalize
 * @returns Normalized vector
 */
export function normalizeVector(vec: number[]): number[] {
  if (vec.length === 0) {
    throw new Error('Vector cannot be empty');
  }

  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));

  if (magnitude === 0) {
    return vec; // Return zero vector as-is
  }

  return vec.map((val) => val / magnitude);
}

/**
 * Calculate Euclidean distance between two vectors
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Euclidean distance
 */
export function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(
      `Vectors must have the same length. Got ${vecA.length} and ${vecB.length}`
    );
  }

  let sumSquaredDiff = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sumSquaredDiff += diff * diff;
  }

  return Math.sqrt(sumSquaredDiff);
}

