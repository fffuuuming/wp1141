'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { EditProfileModal } from './EditProfileModal'
import { FollowButton } from './FollowButton'
import { ProfilePosts } from './ProfilePosts'
import { ProfileLikes } from './ProfileLikes'
import { useFollowerCount } from '@/hooks'

interface ProfileContentProps {
  user: {
    id: string
    userID: string
    name: string | null
    image: string | null
    bio: string | null
    backgroundImage: string | null
    createdAt: Date
  }
  stats: {
    posts: number
    following: number
    followers: number
  }
  isFollowing: boolean
  isOwnProfile: boolean
}

type TabType = 'posts' | 'likes'

export function ProfileContent({ user, stats, isFollowing, isOwnProfile }: ProfileContentProps) {
  const { data: session } = useSession()
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [profileData, setProfileData] = useState(user)
  
  // Use real-time follower count hook
  const { followerCount, followingCount } = useFollowerCount(
    user.userID,
    stats.followers,
    stats.following
  )

  const handleProfileUpdate = (updatedUser: {
    id: string
    userID: string
    name: string | null
    image: string | null
    bio: string | null
    backgroundImage: string | null
  }) => {
    setProfileData((prev) => ({
      ...prev,
      ...updatedUser,
    }))
  }

  return (
    <>
      <div className="relative">
        {/* Background Image / Banner */}
        <div
          className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 relative"
          style={{
            backgroundImage: profileData.backgroundImage
              ? `url(${profileData.backgroundImage})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!profileData.backgroundImage && (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
          )}

          {/* Avatar - Embedded in middle of background and profile section (60-70% in background, 30-40% below) */}
          {/* Positioned on left side, overlapping both sections */}
          <div className="absolute bottom-0 left-6 transform translate-y-1/2 z-10">
            {profileData.image ? (
              <img
                src={profileData.image}
                alt={profileData.name || 'User'}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-600 dark:text-gray-300">
                  {profileData.name?.[0]?.toUpperCase() || profileData.userID[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Section - with padding to account for overlapping avatar */}
      <div className="px-6 pt-20 pb-4 bg-white dark:bg-gray-900 relative">
        {/* Edit Profile Button - Under background image, on the right */}
        {isOwnProfile && (
          <div className="absolute top-4 right-6">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowEditModal(true)
              }}
              className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              Edit profile
            </button>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Name */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {profileData.name || 'User'}
            </h1>
            
            {/* UserID */}
            <p className="text-gray-500 dark:text-gray-400 mb-3">@{profileData.userID}</p>
            
            {/* Bio */}
            {profileData.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                {profileData.bio}
              </p>
            )}
          </div>

          {/* Follow Button (for others' profiles) */}
          {!isOwnProfile && (
            <div className="ml-4">
              <FollowButton
                userID={profileData.userID}
                initialFollowing={isFollowing}
                onFollowChange={(following) => {
                  // Update local state if needed
                }}
              />
            </div>
          )}
        </div>

        {/* Stats: Following and Followers */}
        <div className="flex gap-6 text-sm mb-4">
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">{followingCount}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">{followerCount}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
          </div>
        </div>
      </div>

      {/* Tabs: Posts and Likes */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-4 font-semibold text-sm relative transition-colors ${
                activeTab === 'posts'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Posts
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-4 py-4 font-semibold text-sm relative transition-colors ${
                activeTab === 'likes'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Likes
              {activeTab === 'likes' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'posts' ? (
          <ProfilePosts userID={profileData.id} isOwnProfile={isOwnProfile} />
        ) : (
          <ProfileLikes userID={profileData.id} isOwnProfile={isOwnProfile} />
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && isOwnProfile && (
        <EditProfileModal
          user={profileData}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  )
}

