import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  rootMargin?: string
  threshold?: number
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '150px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    },
    [onLoadMore, hasMore, isLoading]
  )

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin,
      threshold,
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [handleObserver, rootMargin, threshold])

  return { sentinelRef }
}
