import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Resizable = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("resize", className)} {...props} />
  )
)
Resizable.displayName = "Resizable"

export { Resizable }
