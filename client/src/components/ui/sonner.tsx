import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Sonner = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fixed bottom-0 right-0 z-50", className)} {...props} />
  )
)
Sonner.displayName = "Sonner"

export { Sonner }
