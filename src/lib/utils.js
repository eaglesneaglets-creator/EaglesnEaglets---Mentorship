import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names; later Tailwind utilities win over earlier conflicting
 * ones (e.g. cn('px-2', 'px-4') -> 'px-4'). Used by every shadcn component.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
