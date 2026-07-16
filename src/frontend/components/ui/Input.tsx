import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const field =
  'w-full h-10 px-3 bg-bg text-fg text-sm rounded-base border ' +
  'placeholder:text-muted focus-visible:border-fg ' +
  'disabled:opacity-50 disabled:pointer-events-none'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          aria-invalid={error ? true : undefined}
          className={cn(field, error ? 'border-fg' : 'border-border', className)}
          {...props}
        />
        {error && <p className="mt-1 text-[13px] text-muted">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
