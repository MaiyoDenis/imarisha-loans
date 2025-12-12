import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Slider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props} />
  )
)
Slider.displayName = "Slider"

export { Slider }
