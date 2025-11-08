'use client'

export function RightSidebar() {
  return (
    <aside className="hidden xl:block fixed right-0 top-0 h-screen w-[28vw] border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10 flex justify-end">
      <div className="p-4 w-full max-w-[320px]">
        {/* Search Bar - Placeholder for future implementation */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />
          </div>
        </div>

        {/* Who to Follow - Placeholder for future implementation */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Who to follow
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Suggestions will appear here
          </p>
        </div>
      </div>
    </aside>
  )
}

