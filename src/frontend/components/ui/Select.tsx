import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../../lib/cn'

export type SelectSize = 'sm' | 'md'

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize
}

const base =
  'w-full bg-bg text-fg rounded-base border border-border appearance-none ' +
  'focus-visible:outline-none focus-visible:border-fg ' +
  'disabled:opacity-50 disabled:pointer-events-none'

const sizes: Record<SelectSize, string> = {
  sm: 'h-8 pl-2.5 pr-8 text-[13px]',
  md: 'h-10 pl-3 pr-9 text-sm',
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ size = 'md', className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(base, sizes[size], className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={size === 'sm' ? 14 : 16}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted',
            size === 'sm' ? 'right-2.5' : 'right-3',
          )}
        />
      </div>
    )
  },
)

Select.displayName = 'Select'
