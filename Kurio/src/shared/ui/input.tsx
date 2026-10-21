/**
 * PT: Compartilha aparência e referência de campos sem substituir a validação nativa.
 * EN: Shares field appearance and refs without replacing native validation.
 */
import * as React from 'react';
import { cn } from '../lib/utils';

// Input shadcn/ui com foco visível e tipografia herdada do projeto.
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => <input type={type} className={cn('flex h-10 w-full min-w-0 rounded border border-solid border-[#573320] bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-[#cfb28c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50', className)} ref={ref} {...props} />);
Input.displayName = 'Input';
