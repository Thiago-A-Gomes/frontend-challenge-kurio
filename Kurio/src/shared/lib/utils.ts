/**
 * PT: Combina classes condicionais e resolve conflitos de utilitários Tailwind.
 * EN: Merges conditional classes and resolves conflicting Tailwind utilities.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
// Utilitário usado pelos componentes shadcn/ui: combina classes e resolve conflitos.
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
