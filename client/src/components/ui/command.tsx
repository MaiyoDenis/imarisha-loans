import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Command = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("overflow-hidden rounded-md border", className)} {...props} />
  )
)
Command.displayName = "Command"

export { Command }
