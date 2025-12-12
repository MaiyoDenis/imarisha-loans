import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Chart = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full h-96", className)} {...props} />
  )
)
Chart.displayName = "Chart"

export { Chart }
