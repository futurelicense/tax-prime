import { twMerge } from 'tailwind-merge'

export function cn(...parts: (string | false | undefined)[]) {
  return twMerge(parts.filter(Boolean).join(' '))
}