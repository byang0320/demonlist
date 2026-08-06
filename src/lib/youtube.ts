export function getYouTubeVideoKey(videoUrl: string | null) {
  if (!videoUrl) {
    return null
  }

  const match = videoUrl.match(/[?&]v=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function getYouTubeThumbnailUrl(videoUrl: string | null) {
  const videoKey = getYouTubeVideoKey(videoUrl)
  return videoKey
    ? `https://i.ytimg.com/vi/${encodeURIComponent(videoKey)}/maxresdefault.jpg`
    : null
}
