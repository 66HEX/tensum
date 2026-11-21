import { useDirection } from '@base-ui/react/direction-provider';
import { ScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Surface } from './layout';
import { Card } from './ui/card';
import { ScrollBar } from './ui/scroll-area';

export function ScrollCard({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Surface>
      <Card
        className={cn(
          'gap-0 rounded-none py-0 shadow-none! transition-shadow has-[[data-scrollable]:focus-visible]:ring-3 has-[[data-scrollable]:focus-visible]:ring-ring/50 has-[[data-scrollable]:focus-visible]:outline-1',
          className,
        )}
        {...props}
      />
    </Surface>
  );
}

export function HorizontalScroll({ children, label }: { children: ReactNode; label: string }) {
  const direction = useDirection();

  return (
    <ScrollArea.Root data-slot="scroll-area" className="relative min-w-0" overflowEdgeThreshold={1}>
      <ScrollArea.Viewport
        data-slot="scroll-area-viewport"
        aria-label={label}
        className="size-full rounded-[inherit] outline-none"
        render={(props, state) => (
          <section {...props} data-scrollable={state.hasOverflowX ? '' : undefined} />
        )}
        style={(state) => {
          const start = state.overflowXStart
            ? 'min(24px, var(--scroll-area-overflow-x-start))'
            : '0px';

          const end = state.overflowXEnd ? 'min(24px, var(--scroll-area-overflow-x-end))' : '0px';

          return {
            maskImage:
              state.overflowXStart || state.overflowXEnd
                ? `linear-gradient(to ${direction === 'rtl' ? 'left' : 'right'}, transparent, black ${start}, black calc(100% - ${end}), transparent)`
                : undefined,
          };
        }}
      >
        <ScrollArea.Content data-slot="scroll-area-content" className="min-w-full">
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollBar orientation="horizontal" />
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
