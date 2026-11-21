import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

import { Icon } from './icon';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipText, TooltipTrigger } from './ui/tooltip';

const anchorStates = [
  'Copy link to this section',
  'Section link copied',
  'Could not copy section link',
] as const;

function HeadingAnchor({ id }: { id: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copied = status === 'copied';

  const label = copied
    ? 'Section link copied'
    : status === 'error'
      ? 'Could not copy section link'
      : 'Copy link to this section';

  useEffect(() => () => clearTimeout(reset.current), []);

  async function copy(): Promise<void> {
    clearTimeout(reset.current);
    const url = new URL(location.href);
    url.hash = id;

    try {
      await navigator.clipboard.writeText(url.href);
      setStatus('copied');
      reset.current = setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          closeOnClick={false}
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="ms-1 opacity-0 group-hover/heading:opacity-100 focus-visible:opacity-100 focus-visible:transition-none [@media(hover:none)]:opacity-100"
            />
          }
          data-heading-anchor="true"
          data-copied={copied}
          aria-label={label}
          onClick={() => {
            void copy();
          }}
        >
          <span className="relative size-4" aria-hidden="true">
            <span
              data-visible={!copied}
              className="absolute inset-0 transition-[opacity,filter,scale] duration-200 ease-in-out data-[visible=false]:scale-25 data-[visible=false]:opacity-0 data-[visible=false]:blur-xs"
            >
              <Icon name="link" className="size-4" />
            </span>
            <span
              data-visible={copied}
              className="absolute inset-0 text-emerald-500 transition-[opacity,filter,scale] duration-200 ease-in-out data-[visible=false]:scale-25 data-[visible=false]:opacity-0 data-[visible=false]:blur-xs"
            >
              <Icon name="check" className="size-4" />
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <TooltipText text={label} states={anchorStates} />
        </TooltipContent>
      </Tooltip>
      <output className="sr-only" aria-atomic="true">
        {status === 'idle' ? '' : label}
      </output>
    </>
  );
}

const spacing = {
  h1: 'mb-5',
  h2: 'mt-20 mb-5 sm:mt-24',
  h3: 'mt-10 mb-4',
  h4: 'mt-8 mb-3',
  h5: 'mt-8 mb-3',
  h6: 'mt-8 mb-3',
};

const typography = {
  h1: 'type-display text-2xl',
  h2: 'type-display text-lg',
  h3: 'type-display text-sm',
  h4: 'type-display text-sm',
  h5: 'type-display text-xs',
  h6: 'type-display text-xs',
};

export function Heading({
  level: Tag,
  children,
  className,
  id,
  ...props
}: ComponentProps<'h2'> & { level: keyof typeof spacing }) {
  return (
    <div
      data-heading=""
      data-level={Tag}
      className={cn('layout-band group/heading flex items-center gap-1', spacing[Tag])}
    >
      <Tag
        {...props}
        id={id}
        className={cn(
          'min-w-0 scroll-mt-24 font-medium text-foreground',
          typography[Tag],
          className,
        )}
        data-mdx={Tag}
      >
        {children}
      </Tag>
      {Tag !== 'h1' && id !== undefined && id.length > 0 ? <HeadingAnchor id={id} /> : null}
    </div>
  );
}
