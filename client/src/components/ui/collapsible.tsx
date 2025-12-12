import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Collapsible = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
Collapsible.displayName = "Collapsible"

export { Collapsible }
