import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white/60 p-1 backdrop-blur',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('mt-4 focus-visible:outline-none', className)} {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName
