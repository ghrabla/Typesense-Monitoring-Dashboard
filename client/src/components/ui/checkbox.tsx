import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white shadow-sm transition data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      <Check className="h-3 w-3 text-white" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
