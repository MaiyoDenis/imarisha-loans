import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Toast = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-md border p-4", className)} {...props} />
  )
)
Toast.displayName = "Toast"

export { Toast }
