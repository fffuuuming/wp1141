'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type FilterType = 'all' | 'following'

interface HomeFilterContextType {
  filter: FilterType
  setFilter: (filter: FilterType) => void
}

const HomeFilterContext = createContext<HomeFilterContextType | undefined>(undefined)

export function useHomeFilter() {
  const context = useContext(HomeFilterContext)
  if (!context) {
    throw new Error('useHomeFilter must be used within HomeFilterProvider')
  }
  return context
}

export function HomeFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterType>('all')
  return (
    <HomeFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </HomeFilterContext.Provider>
  )
}

export function HomeHeader() {
  const { filter, setFilter } = useHomeFilter()

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="w-full">
        <div className="flex">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-3 font-semibold text-sm relative transition-colors ${
              filter === 'all'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            All
            {filter === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setFilter('following')}
            className={`flex-1 px-4 py-3 font-semibold text-sm relative transition-colors ${
              filter === 'following'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Following
            {filter === 'following' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

