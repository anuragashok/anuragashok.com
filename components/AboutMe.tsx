import Image from '@/components/Image'
import SocialIcon from '@/components/social-icons'
import { allAuthors } from 'contentlayer/generated'

export default function AboutMe() {
  const author = allAuthors.find((p) => p.slug === 'default')

  if (!author) return null

  return (
    <div className="space-y-3">
      <h2 className="text-primary-500 dark:text-primary-400 text-xl font-bold tracking-tight">
        About Me
      </h2>
      <div className="flex flex-col items-center space-y-3">
        {author.avatar && (
          <Image
            src={author.avatar}
            alt="avatar"
            width={96}
            height={96}
            className="h-24 w-24 rounded-full"
          />
        )}
        <h4 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {author.name}
        </h4>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {author.occupation}
        </div>
        {author.company && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {author.company}
          </div>
        )}
        <div className="flex space-x-3 pt-2">
          <SocialIcon kind="mail" href={`mailto:${author.email}`} size={5} />
          <SocialIcon kind="github" href={author.github} size={5} />
          <SocialIcon kind="linkedin" href={author.linkedin} size={5} />
          <SocialIcon kind="x" href={author.twitter} size={5} />
          <SocialIcon kind="bluesky" href={author.bluesky} size={5} />
        </div>
      </div>
    </div>
  )
}
