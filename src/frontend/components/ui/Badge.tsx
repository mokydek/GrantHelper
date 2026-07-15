import { type HTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'

export type BadgeVariant = 'default' | 'muted'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const base =
  'inline-flex items-center border border-border rounded-base px-2 py-0.5 ' +
  'text-[11px] font-mono uppercase tracking-[0.05em]'

const variants: Record<BadgeVariant, string> = {
  default: 'text-fg',
  muted: 'text-muted',
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return <span className={cn(base, variants[variant], className)} {...props} />
}
