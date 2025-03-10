// src/components/ui/badge.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-neutral-900 font-medium",
        category: 
          "bg-transparent text-neutral-800 font-medium",
        country: 
          "bg-transparent text-neutral-800 font-normal tracking-wide",
        utvalg: 
          "bg-transparent text-neutral-800 font-light italic",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }