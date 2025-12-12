import { forwardRef, type TableHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table ref={ref} className={cn("w-full border-collapse", className)} {...props} />
  )
)
Table.displayName = "Table"

export { Table }
