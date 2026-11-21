import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

import { HorizontalScroll, ScrollCard } from './horizontal-scroll';
import { Icon } from './icon';
import { Button } from './ui/button';
import { CardContent } from './ui/card';
import { Tooltip, TooltipContent, TooltipText, TooltipTrigger } from './ui/tooltip';

const copyStates = ['Copy code', 'Code copied', 'Could not copy code'] as const;

const CodeContext = createContext(false);

export function CodeBlock({ children, ...props }: ComponentProps<'pre'>) {
  const code = useRef<HTMLPreElement>(null);
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const copied = status === 'copied';

  const label = copied ? 'Code copied' : status === 'error' ? 'Could not copy code' : 'Copy code';

  useEffect(() => () => clearTimeout(reset.current), []);

  async function copy(): Promise<void> {
    clearTimeout(reset.current);

    try {
      await navigator.clipboard.writeText(code.current?.textContent ?? '');
      setStatus('copied');
      reset.current = setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
    }
  }

  return (
    <ScrollCard className="relative" data-mdx="pre">
      <Tooltip>
        <TooltipTrigger
          closeOnClick={false}
          render={<Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" />}
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
              <Icon name="copy" />
            </span>
            <span
              data-visible={copied}
              className="absolute inset-0 text-emerald-500 transition-[opacity,filter,scale] duration-200 ease-in-out data-[visible=false]:scale-25 data-[visible=false]:opacity-0 data-[visible=false]:blur-xs"
            >
              <Icon name="check" />
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <TooltipText text={label} states={copyStates} />
        </TooltipContent>
      </Tooltip>
      <HorizontalScroll label="Code block">
        <CardContent className="py-(--card-spacing)">
          <CodeContext value={true}>
            <pre
              {...props}
              ref={code}
              className={cn(
                'min-w-full bg-transparent! pr-10 font-mono text-xs leading-relaxed outline-none sm:text-[13px] [&>code]:block [&>code]:w-max [&>code]:min-w-full',
                props.className,
              )}
              tabIndex={-1}
            >
              {children}
            </pre>
          </CodeContext>
        </CardContent>
      </HorizontalScroll>
      <output
        className={status === 'error' ? 'block px-4 pb-4 text-xs text-destructive' : 'sr-only'}
      >
        {copied
          ? 'Copied'
          : status === 'error'
            ? 'Could not copy. Select the code and copy it manually.'
            : ''}
      </output>
    </ScrollCard>
  );
}

export function InlineCode({ children, ...props }: ComponentProps<'code'>) {
  const block = useContext(CodeContext);

  return (
    <code
      {...props}
      className={cn(
        !block && 'rounded bg-muted px-1 py-0.5 font-mono text-[0.8em] text-foreground',
        props.className,
      )}
      data-mdx={block ? 'block-code' : 'inline-code'}
    >
      {children}
    </code>
  );
}
