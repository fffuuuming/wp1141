'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { parsePostContent, formatUrl } from '@/lib/postUtils'
import { formatShortTime, formatDetailedTime } from '@/lib/timeUtils'
import { useSession } from 'next-auth/react'

interface PostCardProps {
  post: {
    id: string
    content: string
    createdAt: string
    author: {
      id: string
      userID: string
      name: string | null
      image: string | null
    }
    _count: {
      likes: number
      replies: number
      reposts: number
    }
  }
  onDelete?: (postId: string) => void
  onUpdate?: () => void
  clickable?: boolean
  variant?: 'home' | 'post' | 'comment'
}

export function PostCard({ post, onDelete, onUpdate, clickable = false, variant = 'home' }: PostCardProps) {
  const { data: session } = useSession()
  const isOwnPost = session?.user?.id === post.author.id
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [reposted, setReposted] = useState(false)
  const [repostCount, setRepostCount] = useState(post._count.reposts)
  const [loadingLike, setLoadingLike] = useState(false)
  const [loadingRepost, setLoadingRepost] = useState(false)
  const hasCheckedLikeRef = useRef(false)
  const hasCheckedRepostRef = useRef(false)
  const userActionRef = useRef(false)
  const parsedContent = parsePostContent(post.content)

  // Check if user liked/reposted this post (only once on mount)
  useEffect(() => {
    if (session?.user?.id && !hasCheckedLikeRef.current && !userActionRef.current) {
      checkLikeStatus()
      hasCheckedLikeRef.current = true
    }
  }, [session, post.id])

  useEffect(() => {
    if (session?.user?.id && !hasCheckedRepostRef.current && !userActionRef.current) {
      checkRepostStatus()
      hasCheckedRepostRef.current = true
    }
  }, [session, post.id])

  const checkLikeStatus = async () => {
    // Don't check if user has already taken action
    if (userActionRef.current) return
    
    try {
      const response = await fetch(`/api/posts/${post.id}/liked`)
      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
      }
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const checkRepostStatus = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/reposted`)
      if (response.ok) {
        const data = await response.json()
        setReposted(data.reposted)
      }
    } catch (error) {
      console.error('Error checking repost status:', error)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session?.user?.id || loadingLike) return

    const previousLiked = liked
    const previousCount = likeCount

    // Mark that user has taken action - prevent checkLikeStatus from overwriting
    userActionRef.current = true

    // Immediate optimistic update - no loading state
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(newLiked ? previousCount + 1 : previousCount - 1)

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        // Update with server response - ensure it stays liked
        setLiked(data.liked)
        setLikeCount(data.count)
      } else {
        // Revert on error
        setLiked(previousLiked)
        setLikeCount(previousCount)
        userActionRef.current = false
        const errorData = await response.json()
        alert(errorData.error || 'Failed to like post')
      }
    } catch (error) {
      // Revert on error
      setLiked(previousLiked)
      setLikeCount(previousCount)
      userActionRef.current = false
      console.error('Error toggling like:', error)
      alert('An error occurred')
    }
  }

  const handleRepost = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session?.user?.id || loadingRepost) return

    setLoadingRepost(true)
    const previousReposted = reposted
    const previousCount = repostCount

    // Optimistic update
    setReposted(!reposted)
    setRepostCount(previousReposted ? previousCount - 1 : previousCount + 1)

    try {
      const response = await fetch(`/api/posts/${post.id}/repost`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setReposted(data.reposted)
        setRepostCount(data.count)
        // Don't call onUpdate here to avoid re-fetching and resetting state
      } else {
        // Revert on error
        setReposted(previousReposted)
        setRepostCount(previousCount)
        const errorData = await response.json()
        alert(errorData.error || 'Failed to repost')
      }
    } catch (error) {
      // Revert on error
      setReposted(previousReposted)
      setRepostCount(previousCount)
      console.error('Error toggling repost:', error)
      alert('An error occurred')
    } finally {
      setLoadingRepost(false)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (!clickable) return
    
    // Don't navigate if clicking on links, buttons, or interactive elements
    const target = e.target as HTMLElement
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]')
    ) {
      return
    }
    
    // Navigate to post detail page
    window.location.href = `/post/${post.id}`
  }

  return (
    <div 
      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${clickable ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <Link href={`/profile/${post.author.userID}`} className="flex-shrink-0">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {post.author.name?.[0]?.toUpperCase() || post.author.userID[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </Link>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="mb-1 flex items-start justify-between">
              <div>
                <Link
                  href={`/profile/${post.author.userID}`}
                  className="font-semibold text-gray-900 dark:text-white hover:underline block"
                >
                  {post.author.name || 'User'}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <Link
                    href={`/profile/${post.author.userID}`}
                    className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
                  >
                    @{post.author.userID}
                  </Link>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
                  <Link
                    href={`/post/${post.id}`}
                    className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
                  >
                    {formatShortTime(post.createdAt)}
                  </Link>
                </div>
              </div>
              {isOwnPost && (
                <div className="relative group">
                  <button
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    title="More options"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
                      {onDelete && (
                        <button
                          onClick={() => onDelete(post.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Post Text with Links/Hashtags/Mentions */}
            <div className="text-gray-900 dark:text-white whitespace-pre-wrap break-words mb-3">
              {parsedContent.map((part, index) => {
                if (part.type === 'link') {
                  const url = formatUrl(part.content)
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {part.content}
                    </a>
                  )
                } else if (part.type === 'hashtag') {
                  return (
                    <span key={index} className="text-blue-500 font-semibold">
                      {part.content}
                    </span>
                  )
                } else if (part.type === 'mention') {
                  const userID = part.content.substring(1)
                  return (
                    <Link
                      key={index}
                      href={`/profile/${userID}`}
                      className="text-blue-500 hover:underline"
                    >
                      {part.content}
                    </Link>
                  )
                } else {
                  return <span key={index}>{part.content}</span>
                }
              })}
            </div>

            {/* Detailed Timestamp - only show for post variant, above buttons */}
            {variant === 'post' && (
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatDetailedTime(post.createdAt)}</span>
                </div>
              </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
              {/* Comment Button */}
              <Link
                href={`/post/${post.id}`}
                className="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm">{post._count.replies}</span>
              </Link>

              {/* Repost Button */}
              <button
                onClick={handleRepost}
                className={`flex items-center gap-2 transition-colors ${
                  reposted
                    ? 'text-green-500 dark:text-green-400'
                    : 'hover:text-green-500 dark:hover:text-green-400'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0 C1.01964844 -0.04898438 2.03929688 -0.09796875 3.08984375 -0.1484375 C7.08933875 0.55580998 8.2831863 2.46644602 11.0625 5.375 C12.68649224 6.8454362 14.31732117 8.30834011 15.953125 9.765625 C22.09524115 15.32908746 27.94741207 21.17888771 33.796875 27.046875 C34.52072639 27.77288658 34.52072639 27.77288658 35.25920105 28.51356506 C38.78051063 32.04719086 42.29695248 35.58564294 45.8125 39.125 C49.34659956 42.68291331 52.88245089 46.23905207 56.42255402 49.79099274 C57.8181293 51.19294095 59.2105964 52.59798106 60.60296631 54.00311279 C65.07791604 58.49521875 69.60191087 62.84716307 74.43087769 66.95840454 C76.59466636 68.83703368 78.53239909 70.86162143 80.4375 73 C81.08460938 73.71414062 81.73171875 74.42828125 82.3984375 75.1640625 C85.8170248 79.7061292 86.63512097 83.74422709 86.0625 89.375 C84.23572864 94.64795086 81.83729176 98.31423605 77.0625 101.375 C74.22761195 102.31996268 72.20691383 102.6011999 69.25 102.6875 C68.00283203 102.74357422 68.00283203 102.74357422 66.73046875 102.80078125 C60.62355098 101.82617797 56.16057699 96.86228512 51.8125 92.75 C51.23177734 92.20287354 50.65105469 91.65574707 50.05273438 91.09204102 C43.08454499 84.46760875 36.30426423 77.65872446 29.515625 70.8515625 C28.30298543 69.63703749 27.09025818 68.42260001 25.87744141 67.20825195 C22.93811733 64.26484132 19.99997718 61.32025377 17.0625 58.375 C16.99233144 80.8717818 16.93947339 103.36854548 16.90706348 125.86541462 C16.89161314 136.31176226 16.87055869 146.75804179 16.83618164 157.2043457 C16.80622314 166.3123284 16.78691168 175.42026176 16.78023452 184.52829236 C16.77633318 189.34821667 16.7672028 194.16799985 16.74530983 198.9878788 C16.72484268 203.53095952 16.71868676 208.07384189 16.72317696 212.61696434 C16.72235631 214.27812658 16.71645188 215.93929593 16.70488358 217.60041809 C16.59361676 234.41193651 19.82009497 249.95894383 32.0625 262.375 C43.46052498 271.72258663 55.03402128 276.53222898 69.84809875 276.51303101 C70.73285721 276.51585229 71.61761567 276.51867357 72.529185 276.52158034 C75.49383079 276.52991322 78.45843917 276.53126347 81.4230957 276.53271484 C83.54875798 276.53738399 85.67441927 276.54252773 87.80007935 276.54811096 C92.37809976 276.55938623 96.95611368 276.56782314 101.53414345 276.57423019 C108.7744298 276.58491399 116.01466949 276.60515955 123.25492859 276.62734985 C143.84367742 276.68926243 164.43242338 276.74329462 185.02124023 276.77636719 C196.39186958 276.79471239 207.76242064 276.82364577 219.13299245 276.8643719 C225.14933843 276.88544065 231.16558578 276.90089904 237.1819706 276.90317917 C242.84140049 276.9053266 248.50062491 276.92120597 254.15999222 276.94756889 C256.23521097 276.95475922 258.31045463 276.95686416 260.38568306 276.95346642 C263.22268127 276.9495639 266.05902576 276.96405165 268.89595032 276.98300171 C269.71357277 276.97747201 270.53119522 276.97194232 271.37359411 276.96624506 C278.12570917 277.04388834 283.65325814 278.3323819 288.9375 282.8125 C292.83759839 287.51555982 293.45409871 290.88830502 293.3125 296.90625 C292.83391667 301.63226035 291.08186591 304.40928493 287.6875 307.625 C282.29193692 311.22204205 277.68612381 311.66505793 271.29949951 311.63569641 C269.97576163 311.64143473 269.97576163 311.64143473 268.62528157 311.64728898 C265.66777037 311.65760833 262.7104537 311.65362867 259.75292969 311.6496582 C257.63201722 311.65400559 255.51110632 311.65918883 253.39019775 311.66514587 C247.62505578 311.67855273 241.85997932 311.67911204 236.09482479 311.67658257 C231.27463417 311.67551275 226.45445679 311.68039718 221.634269 311.685188 C210.24933334 311.6962917 198.86443065 311.6967175 187.47949219 311.69067383 C175.76391117 311.68464963 164.04845072 311.69690348 152.33289027 311.7182439 C142.25786475 311.73591626 132.18287739 311.7418519 122.10783696 311.73860615 C116.09845663 311.73680013 110.08916205 311.73935999 104.07979584 311.75332069 C98.41626053 311.7659841 92.75291112 311.76387507 87.08937836 311.75090981 C85.02276545 311.74856187 82.95613912 311.75121382 80.88954163 311.75953293 C51.575156 311.86892293 27.8229509 305.29320996 6 284.75 C-11.77108174 266.47675269 -17.39599599 243.25909999 -17.36987305 218.44580078 C-17.37891076 216.69005656 -17.38924284 214.9343186 -17.40075684 213.17858887 C-17.42811719 208.4564109 -17.43758256 203.73435332 -17.44361091 199.01210642 C-17.45304967 194.0606661 -17.47925713 189.10931381 -17.50361633 184.15792847 C-17.54713457 174.80151378 -17.5757714 165.44511631 -17.59893972 156.08863151 C-17.62607044 145.42824092 -17.66997684 134.76793952 -17.71522844 124.10761285 C-17.80786432 102.19679001 -17.87964104 80.28594048 -17.9375 58.375 C-18.43782745 58.88198929 -18.93815491 59.38897858 -19.4536438 59.91133118 C-24.18277607 64.70071165 -28.91920139 69.48274543 -33.66383553 74.25677204 C-36.10252708 76.71108283 -38.53836431 79.16808965 -40.96777344 81.6315918 C-43.76438685 84.46720159 -46.57325426 87.29049451 -49.3828125 90.11328125 C-50.24866974 90.99462234 -51.11452698 91.87596344 -52.00662231 92.78401184 C-62.01961331 102.79976842 -62.01961331 102.79976842 -69.875 102.8125 C-75.02804535 102.63427437 -77.83147352 101.49558013 -81.9375 98.375 C-85.46007768 94.20352643 -86.84486392 90.84052872 -86.9375 85.375 C-84.97517398 71.71517209 -69.26308735 60.52277501 -59.98046875 51.21484375 C-58.92466331 50.15479724 -58.92466331 50.15479724 -57.84752846 49.07333565 C-54.13679017 45.34772287 -50.42327841 41.62490244 -46.70727539 37.90454102 C-42.87276723 34.06450468 -39.04765764 30.2152433 -35.22455883 26.3638525 C-32.27423103 23.39494292 -29.31725738 20.43272189 -26.35839272 17.47232246 C-24.9440956 16.05499809 -23.5323007 14.63517226 -22.12306786 13.21281242 C-20.16088523 11.233632 -18.18952227 9.26406927 -16.21557617 7.29663086 C-15.63629868 6.70813858 -15.05702118 6.1196463 -14.46018982 5.51332092 C-9.71288294 0.81502753 -6.52952099 0.21408266 0 0 Z " fill="currentColor" transform="translate(117.9375,126.625)"/>
                  <path d="M0 0 C0.92696442 -0.00297112 1.85392884 -0.00594224 2.80898309 -0.0090034 C5.93477782 -0.01771846 9.06053439 -0.01920106 12.18634033 -0.02069092 C14.42004987 -0.02531739 16.65375861 -0.03034182 18.88746643 -0.03573608 C24.97280439 -0.0488852 31.0581313 -0.05531082 37.14348125 -0.05974674 C40.94707831 -0.06267558 44.75067234 -0.0667802 48.55426788 -0.07125092 C59.0936915 -0.08336765 69.63311247 -0.0937451 80.17254257 -0.09712601 C80.84753344 -0.09734557 81.5225243 -0.09756514 82.21796943 -0.09779136 C83.23285512 -0.09811878 83.23285512 -0.09811878 84.26824355 -0.09845281 C85.63921722 -0.09889627 87.01019089 -0.09934283 88.38116455 -0.09979248 C89.06121198 -0.10001391 89.74125942 -0.10023534 90.44191435 -0.10046348 C101.43515483 -0.10440251 112.42832866 -0.12182597 123.42154345 -0.145152 C134.71953942 -0.16892999 146.01750325 -0.18107357 157.31552815 -0.18249393 C163.65406331 -0.18353997 169.99250468 -0.1894042 176.33101654 -0.20731354 C182.30310122 -0.22385731 188.2750223 -0.22591913 194.24712181 -0.21717453 C196.43110023 -0.21640732 198.61508767 -0.22070482 200.79904366 -0.23063278 C226.66676396 -0.34125761 249.10754412 5.22448694 268.11309814 23.90216064 C282.13589022 38.37574785 290.28960754 57.79261275 290.31819153 77.89164734 C290.32312951 78.64083484 290.32806748 79.39002235 290.3331551 80.1619125 C290.34843038 82.65532321 290.35686346 85.14870837 290.36529541 87.64215088 C290.37488179 89.43626629 290.38489231 91.23037948 290.39529419 93.02449036 C290.42226701 97.88341075 290.44331773 102.74234077 290.46329618 107.60129428 C290.48520288 112.68353949 290.5125686 117.76575526 290.53935242 122.84797668 C290.58921606 132.46670415 290.63417831 142.08544802 290.67737478 151.70420748 C290.72680131 162.65702247 290.78169933 173.60980791 290.83705437 184.56259429 C290.95077724 207.0885159 291.05763731 229.61446588 291.15997314 252.14044189 C291.91046432 251.37995796 291.91046432 251.37995796 292.67611694 250.60411072 C297.40524921 245.81473024 302.14167453 241.03269646 306.88630867 236.25866985 C309.32500023 233.80435906 311.76083746 231.34735224 314.19024658 228.8838501 C316.98686 226.0482403 319.7957274 223.22494739 322.60528564 220.40216064 C323.9040715 219.080149 323.9040715 219.080149 325.22909546 217.73143005 C335.24208646 207.71567348 335.24208646 207.71567348 343.09747314 207.70294189 C348.2505185 207.88116752 351.05394666 209.01986177 355.15997314 212.14044189 C358.81702481 216.37492277 360.40284831 220.54375326 360.15997314 226.14044189 C358.66011689 234.25545365 352.94903396 239.78966459 346.86871338 244.92999268 C341.1457329 249.92627104 335.85361505 255.3519729 330.50983429 260.74598122 C328.57860739 262.69477768 326.64370399 264.63985552 324.70776367 266.58396912 C319.20980506 272.10623822 313.71766895 277.63427208 308.22979736 283.16656494 C304.8596763 286.56345305 301.48471173 289.95546587 298.10671234 293.34451866 C296.82420087 294.6332333 295.54358944 295.92384175 294.26493073 297.21637917 C292.48219765 299.01831219 290.69340366 300.81401536 288.90313721 302.60845947 C288.11602104 303.40871803 288.11602104 303.40871803 287.31300354 304.22514343 C283.16737413 308.35974735 280.23097329 310.42278835 274.34747314 310.51544189 C273.53665283 310.54380127 272.72583252 310.57216064 271.89044189 310.60137939 C264.77663676 309.40047953 259.85573874 304.26809633 254.98712158 299.33990479 C254.30816833 298.6646022 253.62921509 297.98929962 252.9296875 297.29353333 C250.70212867 295.07403714 248.48555088 292.84392915 246.26934814 290.61309814 C244.71763368 289.06086465 243.16539986 287.50915018 241.6126709 285.95793152 C238.36685367 282.71202477 235.12624976 279.4610294 231.88946533 276.20611572 C227.74298795 272.03692378 223.58549876 267.87892525 219.42428207 263.72445011 C216.22057886 260.52408961 213.02188671 257.31875936 209.8247757 254.1118145 C208.29351202 252.57670591 206.76090271 251.04293836 205.22692108 249.51054573 C203.08471649 247.36871242 200.94913271 245.2204904 198.81524658 243.07037354 C198.18247803 242.4400824 197.54970947 241.80979126 196.89776611 241.16040039 C191.77852082 235.9789442 188.41241071 231.71356873 188.15997314 224.14044189 C189.02510393 219.25203298 190.37525088 215.40303725 194.22247314 212.14044189 C198.00691954 209.56379754 199.87594618 208.94562839 204.40997314 208.82794189 C205.34325439 208.79055908 206.27653564 208.75317627 207.23809814 208.71466064 C214.88861403 209.82950855 220.33701494 217.0590739 225.49591064 222.28106689 C226.37526276 223.1632489 227.25461487 224.04543091 228.16061401 224.9543457 C230.48219035 227.28518636 232.79936411 229.62028767 235.11444092 231.95758057 C237.48401161 234.34771727 239.85935044 236.73210671 242.23419189 239.11700439 C246.88142115 243.78623635 251.52288739 248.46113729 256.15997314 253.14044189 C256.20676495 230.66091801 256.24199713 208.18140221 256.26359749 185.70183945 C256.27389501 175.26338825 256.28792614 164.82496738 256.31085205 154.38653564 C256.33083266 145.28476956 256.34370065 136.18302544 256.34815013 127.08123803 C256.35074961 122.26522873 256.35682761 117.44928225 256.37143326 112.63329315 C256.38509106 108.09270063 256.38917933 103.55219634 256.38618851 99.01158524 C256.38673502 97.35246169 256.39066333 95.69333495 256.39838409 94.03422928 C256.48094838 75.3633165 254.59534255 60.18149824 241.31622314 46.19903564 C231.78046968 37.15179414 219.63088141 33.82121793 206.77909851 33.88215637 C205.8665699 33.87848067 204.95404128 33.87480496 204.01386029 33.87101787 C200.97323269 33.86108227 197.93278956 33.86517979 194.89215088 33.86920166 C192.70531013 33.86481216 190.51847104 33.85950918 188.33163452 33.85336304 C183.63087886 33.84188111 178.93016818 33.83640496 174.22939873 33.83548164 C166.79590135 33.83353852 159.36249687 33.81547297 151.92903137 33.79472351 C133.46892975 33.74557285 115.00879861 33.7144837 96.54864502 33.69342041 C82.19491577 33.67692311 67.84125592 33.65410611 53.48757893 33.61039966 C46.09835856 33.58861562 38.70928991 33.58056612 31.32003963 33.5827924 C26.72428208 33.58112612 22.12862371 33.56708079 17.53290176 33.54957962 C15.40242928 33.54397897 13.27193625 33.54349593 11.14146233 33.54851723 C8.23203595 33.5546555 5.32323602 33.54243236 2.41386414 33.52571106 C1.57202951 33.53192288 0.73019489 33.53813469 -0.13714987 33.54453474 C-5.99733784 33.48320984 -11.0223241 32.62330554 -15.58221436 28.60528564 C-20.02603253 22.61379287 -20.59647355 18.56832822 -19.84002686 11.14044189 C-15.37594786 2.04694765 -9.4523712 -0.00935339 0 0 Z " fill="currentColor" transform="translate(120.84002685546875,74.85955810546875)"/>
                </svg>
                <span className="text-sm">{repostCount}</span>
              </button>

              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${
                  liked
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                }`}
              >
                {liked ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                <span className="text-sm">{likeCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

