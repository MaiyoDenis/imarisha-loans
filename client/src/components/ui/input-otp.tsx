import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const InputOTP = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex gap-2", className)} {...props} />
  )
)
InputOTP.displayName = "InputOTP"

export { InputOTP }
