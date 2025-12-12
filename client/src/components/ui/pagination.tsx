import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Pagination = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  )
)
Pagination.displayName = "Pagination"

export { Pagination }
