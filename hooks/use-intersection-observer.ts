"use client"

import { useEffect, useState, useRef, type RefObject } from "react"

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver<T extends Element>({
  threshold = 0,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [RefObject<T>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref?.current

    if (!node) return

    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport) {
      // Fallback for browsers that don't support IntersectionObserver
      setIsIntersecting(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state when observer callback fires
        setIsIntersecting(entry.isIntersecting)

        if (entry.isIntersecting && freezeOnceVisible) {
          observer.unobserve(node)
        }
      },
      { threshold, root, rootMargin },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return [ref, isIntersecting]
}

