import { forwardRef } from 'react'
import type { LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('text-xs font-medium text-slate-600', className)} {...props} />
  ),
)
Label.displayName = 'Label'
