import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const ContextMenu = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
ContextMenu.displayName = "ContextMenu"

export { ContextMenu }
