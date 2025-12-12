import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Carousel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      {...props}
    />
  )
)
Carousel.displayName = "Carousel"

export { Carousel }
