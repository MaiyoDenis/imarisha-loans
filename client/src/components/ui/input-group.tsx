import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const InputGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", className)} {...props} />
  )
)
InputGroup.displayName = "InputGroup"

export { InputGroup }
