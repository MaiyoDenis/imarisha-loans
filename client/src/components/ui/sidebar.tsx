import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Sidebar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <aside ref={ref} className={cn("w-64 border-r bg-background", className)} {...props} />
  )
)
Sidebar.displayName = "Sidebar"

export { Sidebar }
