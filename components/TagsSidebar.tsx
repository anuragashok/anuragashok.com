'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import Link from '@/components/Link'
import tagData from 'app/tag-data.json'

export default function TagsSidebar() {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  // Only show on /blog and /tags pages
  const shouldShow = pathname.startsWith('/blog') || pathname.startsWith('/tags')

  if (!shouldShow) return null

  return (
    <div className="space-y-3">
      <h2 className="text-primary-500 dark:text-primary-400 text-xl font-bold tracking-tight">
        Tags
      </h2>
      <div className="space-y-2">
        {pathname.startsWith('/blog') ? (
          <h3 className="text-primary-500 px-3 py-2 text-sm font-bold uppercase">All Posts</h3>
        ) : (
          <Link
            href={`/blog`}
            className="hover:text-primary-500 dark:hover:text-primary-500 block px-3 py-2 text-sm font-bold text-gray-700 uppercase dark:text-gray-300"
          >
            All Posts
          </Link>
        )}
        <ul>
          {sortedTags.map((t) => {
            return (
              <li key={t} className="my-3">
                {decodeURI(pathname.split('/tags/')[1]) === slug(t) ? (
                  <h3 className="text-primary-500 inline px-3 py-2 text-sm font-bold uppercase">
                    {`${t} (${tagCounts[t]})`}
                  </h3>
                ) : (
                  <Link
                    href={`/tags/${slug(t)}`}
                    className="hover:text-primary-500 dark:hover:text-primary-500 px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                    aria-label={`View posts tagged ${t}`}
                  >
                    {`${t} (${tagCounts[t]})`}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
