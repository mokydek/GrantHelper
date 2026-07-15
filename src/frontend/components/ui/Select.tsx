import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../../lib/cn'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

const field =
  'w-full h-10 pl-3 pr-9 bg-bg text-fg text-sm rounded-base border border-border ' +
  'appearance-none focus-visible:outline-none focus-visible:border-fg ' +
  'disabled:opacity-50 disabled:pointer-events-none'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select ref={ref} className={cn(field, className)} {...props}>
          {children}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    )
  },
)

Select.displayName = 'Select'
