import { forwardRef, type FormHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Form = forwardRef<HTMLFormElement, FormHTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => (
    <form ref={ref} className={cn("space-y-6", className)} {...props} />
  )
)
Form.displayName = "Form"

export { Form }
