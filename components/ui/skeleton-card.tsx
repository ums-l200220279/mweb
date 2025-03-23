import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface SkeletonCardProps {
  className?: string
  hasHeader?: boolean
  hasFooter?: boolean
  headerHeight?: number
  contentCount?: number
  contentHeight?: number
  footerHeight?: number
}

export function SkeletonCard({
  className,
  hasHeader = true,
  hasFooter = false,
  headerHeight = 20,
  contentCount = 3,
  contentHeight = 16,
  footerHeight = 40,
}: SkeletonCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {hasHeader && (
        <CardHeader className="p-4">
          <Skeleton className={`h-${headerHeight} w-3/4`} />
        </CardHeader>
      )}
      <CardContent className="p-4 pt-0 space-y-3">
        {Array.from({ length: contentCount }).map((_, i) => (
          <Skeleton key={i} className={`h-${contentHeight} w-full`} />
        ))}
      </CardContent>
      {hasFooter && (
        <CardFooter className="p-4 pt-0">
          <Skeleton className={`h-${footerHeight} w-full`} />
        </CardFooter>
      )}
    </Card>
  )
}

