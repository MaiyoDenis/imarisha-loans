import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Menubar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex gap-1", className)} {...props} />
  )
)
Menubar.displayName = "Menubar"

export { Menubar }
