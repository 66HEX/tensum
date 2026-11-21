import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Surface({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} data-layout-surface="" className={cn('layout-band min-w-0', className)} />;
}
