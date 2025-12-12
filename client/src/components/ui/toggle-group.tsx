import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const ToggleGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex gap-1", className)} role="group" {...props} />
  )
)
ToggleGroup.displayName = "ToggleGroup"

export { ToggleGroup }
