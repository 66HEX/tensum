import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { useLayoutEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            'z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

const emptyStates: readonly string[] = [];

function readCssWidth(node: HTMLElement): number {
  const width = getComputedStyle(node).width;

  return width.endsWith('px') ? Number(width.slice(0, -2)) : 0;
}

function TooltipText({ text, states = emptyStates }: { text: string; states?: readonly string[] }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const animationRef = useRef<{
    previousWidth: number;
    animation: Animation | undefined;
    activeLabel: HTMLElement | null;
    lastText: string | undefined;
  }>({
    previousWidth: 0,
    animation: undefined,
    activeLabel: null,
    lastText: undefined,
  });

  const labels = [...new Set([...states, text])];
  const activeIndex = labels.indexOf(text);

  useLayoutEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return () => {};
    }

    const element = node;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const state = animationRef.current;

    function finish() {
      state.animation?.cancel();
      state.animation = undefined;
      state.activeLabel?.style.removeProperty('width');
      state.activeLabel = null;
      state.previousWidth = readCssWidth(element);
    }

    state.previousWidth = readCssWidth(element);

    // Track font and viewport changes without treating animation frames as new targets
    const observer = new ResizeObserver(() => {
      if (!state.animation) {
        state.previousWidth = readCssWidth(element);
      }
    });

    observer.observe(element);
    reducedMotion.addEventListener('change', finish);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', finish);
      finish();
    };
  }, []);

  useLayoutEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const element = node;
    const state = animationRef.current;

    if (state.lastText === undefined) {
      state.lastText = text;
      state.previousWidth = readCssWidth(element);

      return;
    }

    if (state.lastText === text) {
      return;
    }

    state.lastText = text;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const from = state.animation ? readCssWidth(element) : state.previousWidth;

    function finish() {
      state.animation?.cancel();
      state.animation = undefined;
      state.activeLabel?.style.removeProperty('width');
      state.activeLabel = null;
      state.previousWidth = readCssWidth(element);
    }

    finish();
    const to = readCssWidth(element);

    if (reducedMotion.matches || Math.abs(from - to) < 0.5) {
      return;
    }

    // Keep the incoming text at its final measure while the shell changes width
    state.activeLabel = element.querySelector<HTMLElement>('[data-active="true"]');

    if (state.activeLabel) {
      state.activeLabel.style.width = `${to}px`;
    }

    state.animation = element.animate([{ width: `${from}px` }, { width: `${to}px` }], {
      duration: 150,
      easing: 'ease-out',
    });
    state.animation.onfinish = finish;
  }, [text]);

  return (
    <span
      ref={containerRef}
      data-slot="tooltip-text"
      className="tooltip-text relative grid min-w-0"
    >
      {labels.map((label, index) => (
        <span
          key={label}
          className="tooltip-text-state col-start-1 row-start-1"
          data-active={label === text}
          data-before={index < activeIndex}
          aria-hidden={label !== text}
        >
          {label}
        </span>
      ))}
    </span>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipText };
