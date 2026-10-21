/**
 * PT: Padroniza variantes e foco; Radix Slot permite reutilizar o estilo em links.
 * EN: Standardizes variants and focus; Radix Slot reuses button styling for links.
 */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

// Componente shadcn/ui (Radix Slot + CVA), adaptado à paleta da Kurio.
export const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-mono text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: { default: 'border-0 bg-primary text-background hover:bg-white', outline: 'border border-solid border-[#573320] bg-transparent text-[#cfb28c] hover:border-primary', ghost: 'border-0 bg-transparent text-primary hover:text-white' },
    size: { default: 'min-h-9 px-5 py-2', sm: 'min-h-8 px-3 py-1 text-xs', icon: 'h-9 w-9 p-0' },
  }, defaultVariants: { variant: 'default', size: 'default' },
});
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };
export const Button = React.forwardRef<HTMLButtonElement, Props>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});
Button.displayName = 'Button';
