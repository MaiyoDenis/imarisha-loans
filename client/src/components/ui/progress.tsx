import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Progress = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props} />
  )
)
Progress.displayName = "Progress"

export { Progress }
