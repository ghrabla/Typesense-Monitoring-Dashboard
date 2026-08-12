import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-400 active:scale-[0.98]',
        outline:
          'border border-slate-200 bg-white/70 text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:border-slate-300 focus-visible:ring-slate-300 active:scale-[0.98]',
        ghost:
          'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-slate-300',
        destructive:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus-visible:ring-rose-300 active:scale-[0.98]',
        subtle:
          'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-300',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
