import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Empty = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col items-center justify-center py-12", className)} {...props} />
  )
)
Empty.displayName = "Empty"

export { Empty }
