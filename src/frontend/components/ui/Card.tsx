import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'

export type CardProps = HTMLAttributes<HTMLDivElement>

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-bg border border-border rounded-base p-6', className)}
        {...props}
      />
    )
  },
)

Card.displayName = 'Card'
