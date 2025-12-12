import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Drawer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fixed inset-0", className)} {...props} />
  )
)
Drawer.displayName = "Drawer"

export { Drawer }
