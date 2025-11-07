/**
 * MSW (Mock Service Worker) handlers
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw'

// Base URL for API routes
const API_BASE = 'http://localhost:3000/api'

export const handlers = [
  // Posts
  http.get(`${API_BASE}/posts/:id`, () => {
    return HttpResponse.json({
      post: {
        id: 'post-1',
        content: 'Test post content',
        author: {
          id: 'user-1',
          userID: 'testuser',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
        },
        createdAt: new Date().toISOString(),
        _count: {
          likes: 5,
          replies: 2,
          reposts: 1,
        },
      },
    })
  }),

  http.post(`${API_BASE}/posts`, () => {
    return HttpResponse.json({
      post: {
        id: 'new-post',
        content: 'New post',
        author: {
          id: 'user-1',
          userID: 'testuser',
          name: 'Test User',
        },
        createdAt: new Date().toISOString(),
        _count: {
          likes: 0,
          replies: 0,
          reposts: 0,
        },
      },
    }, { status: 201 })
  }),

  // Feed
  http.get(`${API_BASE}/feed`, ({ request }) => {
    const url = new URL(request.url)
    const filter = url.searchParams.get('filter') || 'all'

    return HttpResponse.json({
      posts: [
        {
          id: 'post-1',
          content: 'Test post 1',
          author: {
            id: 'user-1',
            userID: 'testuser',
            name: 'Test User',
            image: 'https://example.com/avatar.jpg',
          },
          createdAt: new Date().toISOString(),
          _count: {
            likes: 5,
            replies: 2,
            reposts: 1,
          },
        },
      ],
    })
  }),

  // Users
  http.get(`${API_BASE}/user/:userID`, () => {
    return HttpResponse.json({
      user: {
        id: 'user-1',
        userID: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
        bio: 'Test bio',
        _count: {
          posts: 10,
          following: 5,
          followers: 20,
        },
      },
    })
  }),

  // Error handlers
  http.get(`${API_BASE}/posts/not-found`, () => {
    return HttpResponse.json(
      {
        error: 'Post not found',
        code: 'NOT_FOUND',
      },
      { status: 404 }
    )
  }),
]

