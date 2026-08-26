/**
 * cn — junta classes e resolve conflitos do Tailwind.
 *
 * Sem o twMerge, `cn('px-4', props.className)` com um `px-8` vindo de fora deixa as duas
 * classes no elemento e ganha a que vier depois no CSS gerado — que não é previsível.
 * Com ele, a última vence sempre, que é o que qualquer pessoa espera ao passar className.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}
