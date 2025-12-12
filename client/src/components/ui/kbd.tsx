import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 font-mono text-sm font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
Kbd.displayName = "Kbd"

export { Kbd }
