import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Calendar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full max-w-sm", className)}
      {...props}
    />
  )
)
Calendar.displayName = "Calendar"

export { Calendar }
