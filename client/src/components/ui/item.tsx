import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Item = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-2 py-1.5", className)} {...props} />
  )
)
Item.displayName = "Item"

export { Item }
