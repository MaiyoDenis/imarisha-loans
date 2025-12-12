import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const NavigationMenu = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex gap-8", className)} {...props} />
  )
)
NavigationMenu.displayName = "NavigationMenu"

export { NavigationMenu }
