'use client'

import { useEffect, useRef, useState } from 'react'

import { getLevelThumbnailUrl } from '@/lib/level-thumbnails'

export function LevelThumbnail({
  levelId,
}: {
  levelId: number
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = imageRef.current

    if (!image || image.complete || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        // Warm the browser cache shortly before the thumbnail enters view.
        const preloadImage = new window.Image()
        preloadImage.src = image.src
        observer.disconnect()
      },
      { rootMargin: '800px 0px' },
    )

    observer.observe(image)

    return () => observer.disconnect()
  }, [])

  if (imageFailed) {
    return null
  }

  return (
    // This external image needs onError so unavailable level thumbnails can disappear cleanly.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      src={getLevelThumbnailUrl(levelId)}
      alt=""
      className="level-thumbnail-image"
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  )
}

export function LevelPlaceholder({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 5 40.5 14.5v19L24 43 7.5 33.5v-19L24 5Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="m15 18 9-5 9 5-9 5-9-5Zm0 7 9 5 9-5M15 25v7l9 5 9-5v-7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
