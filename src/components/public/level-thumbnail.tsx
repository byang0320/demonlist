'use client'

import { useState } from 'react'

export function LevelThumbnail({
  levelId,
}: {
  levelId: number
}) {
  const [imageFailed, setImageFailed] = useState(false)

  if (imageFailed) {
    return null
  }

  return (
    // This external image needs onError so unavailable level thumbnails can disappear cleanly.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://levelthumbs.prevter.me/thumbnail/${levelId}`}
      alt=""
      className="level-thumbnail-image"
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
