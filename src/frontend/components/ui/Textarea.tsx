import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const field =
  'w-full min-h-20 px-3 py-2 bg-bg text-fg text-sm rounded-base border ' +
  'placeholder:text-muted focus-visible:border-fg ' +
  'disabled:opacity-50 disabled:pointer-events-none'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
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

Textarea.displayName = 'Textarea'
