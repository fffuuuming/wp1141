/**
 * Users API
 * Typed API methods for user operations
 */

import { apiClient } from './client'
import { endpoints } from './endpoints'
import type {
  UserResponse,
  UsersResponse,
  PostsResponse,
} from '@/types/api/responses'
import type { UpdateUserRequest, RegisterUserIDRequest, LookupUserRequest } from '@/types/api/requests'

/**
 * Get user profile by userID
 */
export async function getUser(userID: string): Promise<UserResponse> {
  return apiClient.get(endpoints.users.get(userID))
}

/**
 * Update user profile
 */
export async function updateUser(
  userID: string,
  data: UpdateUserRequest
): Promise<UserResponse> {
  return apiClient.put(endpoints.users.update(userID), data)
}

/**
 * Follow a user
 */
export async function followUser(userID: string): Promise<{ following: boolean; count?: number }> {
  return apiClient.post(endpoints.users.follow(userID))
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userID: string): Promise<{ following: boolean; count?: number }> {
  return apiClient.delete(endpoints.users.unfollow(userID))
}

/**
 * Get user posts
 */
export async function getUserPosts(userID: string): Promise<PostsResponse> {
  return apiClient.get(endpoints.users.posts(userID))
}

/**
 * Get user liked posts
 */
export async function getUserLikes(userID: string): Promise<PostsResponse> {
  return apiClient.get(endpoints.users.likes(userID))
}

/**
 * Lookup user by userID
 */
export async function lookupUser(data: LookupUserRequest): Promise<UserResponse> {
  return apiClient.post(endpoints.users.lookup, data)
}

/**
 * Get list of users
 */
export async function getUsers(): Promise<UsersResponse> {
  return apiClient.get(endpoints.users.list)
}

/**
 * Delete user account
 */
export async function deleteUser(): Promise<{ success: boolean }> {
  return apiClient.delete(endpoints.users.delete)
}

/**
 * Register userID
 */
export async function registerUserID(data: RegisterUserIDRequest): Promise<{ success: boolean }> {
  return apiClient.post(endpoints.auth.registerUserID, data)
}

/**
 * Search for users by name or userID
 */
export async function searchUsers(query: string, limit: number = 10): Promise<UsersResponse> {
  return apiClient.get(endpoints.users.search(query, limit))
}

/**
 * Get user recommendations
 */
export async function getRecommendations(): Promise<UsersResponse> {
  return apiClient.get(endpoints.users.recommendations)
}

