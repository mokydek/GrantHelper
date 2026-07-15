import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-[13px] font-medium text-muted',
          className,
        )}
        {...props}
      />
    )
  },
)

Label.displayName = 'Label'
