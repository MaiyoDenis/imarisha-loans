import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Field = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
)
Field.displayName = "Field"

export { Field }
