import type { MDXComponents } from 'mdx/types';
import { Children, createContext, isValidElement, useContext } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { SpringDemo } from '@/demos/spring-demo';
import { cn } from '@/lib/utils';

import { CodeBlock, InlineCode } from './code-block';
import { Heading } from './heading';
import { HorizontalScroll, ScrollCard } from './horizontal-scroll';
import { Icon } from './icon';
import { Surface } from './layout';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './ui/table';

function Callout({ title = 'A note', children }: { title?: string; children: ReactNode }) {
  return (
    <Surface>
      <Alert role="note" className="border-0 rounded-none shadow-none!">
        <Icon name="info" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="[&>p:last-child]:mb-0">{children}</AlertDescription>
      </Alert>
    </Surface>
  );
}

const InlineImageContext = createContext(false);

function Image({ className, alt = '', ...props }: ComponentProps<'img'>) {
  const inline = useContext(InlineImageContext);

  const image = (
    <img
      {...props}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('h-auto max-w-full rounded-lg', !inline && 'w-full', className)}
      data-mdx="img"
    />
  );

  return inline ? (
    image
  ) : (
    <Surface>
      <Card className="py-0">
        <CardContent className="p-0">{image}</CardContent>
      </Card>
    </Surface>
  );
}

function Paragraph({ children, className, ...props }: ComponentProps<'p'>) {
  const content = Children.toArray(children);
  const child = content[0];

  if (content.length === 1 && isValidElement(child) && child.type === Image) {
    return child;
  }

  return (
    <InlineImageContext value={true}>
      <p {...props} className={cn('mb-6', className)} data-mdx="p">
        {children}
      </p>
    </InlineImageContext>
  );
}

function Figure({ className, ...props }: ComponentProps<'figure'>) {
  return <figure {...props} className={cn('my-8 [&>img]:mb-0', className)} data-mdx="figure" />;
}

function Caption({ className, ...props }: ComponentProps<'figcaption'>) {
  return (
    <figcaption
      {...props}
      className={cn('mt-3 text-center text-xs leading-relaxed text-muted-foreground', className)}
      data-mdx="figcaption"
    />
  );
}

function Details({ className, ...props }: ComponentProps<'details'>) {
  return (
    <details
      {...props}
      className={cn('my-7 border-y py-4 text-sm open:[&>summary]:mb-4', className)}
      data-mdx="details"
    />
  );
}

function Summary({ className, ...props }: ComponentProps<'summary'>) {
  return (
    <summary
      {...props}
      className={cn('cursor-pointer font-medium text-foreground', className)}
      data-mdx="summary"
    />
  );
}

export const mdxComponents = {
  pre: CodeBlock,
  code: InlineCode,
  img: Image,
  figure: Figure,
  figcaption: Caption,
  details: Details,
  summary: Summary,
  table: (props: ComponentProps<'table'>) => (
    <ScrollCard>
      <HorizontalScroll label="Scrollable table">
        <CardContent className="p-0!">
          <Table {...props} containerClassName="overflow-visible" data-mdx="table" />
        </CardContent>
      </HorizontalScroll>
    </ScrollCard>
  ),
  input: ({ checked, disabled, className, id }: ComponentProps<'input'>) => (
    <Checkbox
      id={id}
      checked={checked ?? false}
      disabled={disabled}
      readOnly
      aria-label="Checklist item"
      className={cn('mr-2 inline-flex align-middle', className)}
      data-mdx="input"
    />
  ),
  SpringDemo,
  Callout,
  Image,
  Figure,
  Caption,
  Details,
  Summary,
  h1: (props: ComponentProps<'h1'>) => <Heading level="h1" {...props} />,
  h2: (props: ComponentProps<'h2'>) => <Heading level="h2" {...props} />,
  h3: (props: ComponentProps<'h3'>) => <Heading level="h3" {...props} />,
  h4: (props: ComponentProps<'h4'>) => <Heading level="h4" {...props} />,
  h5: (props: ComponentProps<'h5'>) => <Heading level="h5" {...props} />,
  h6: (props: ComponentProps<'h6'>) => <Heading level="h6" {...props} />,
  p: Paragraph,
  a: ({ className, children, ...props }: ComponentProps<'a'>) => (
    <a
      {...props}
      className={cn(
        'underline decoration-muted-foreground/50 underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground',
        className,
      )}
      data-mdx="a"
    >
      {children}
    </a>
  ),
  blockquote: ({ className, ...props }: ComponentProps<'blockquote'>) => (
    <blockquote
      {...props}
      className={cn(
        'my-8 border-l-2 py-1 pl-5 text-muted-foreground [&>p:last-child]:mb-0',
        className,
      )}
      data-mdx="blockquote"
    />
  ),
  ul: ({ className, ...props }: ComponentProps<'ul'>) => (
    <ul
      {...props}
      className={cn(
        'my-6 list-disc pl-6 [&.contains-task-list]:list-none [&.contains-task-list]:pl-0',
        className,
      )}
      data-mdx="ul"
    />
  ),
  ol: ({ className, ...props }: ComponentProps<'ol'>) => (
    <ol {...props} className={cn('my-6 list-decimal pl-6', className)} data-mdx="ol" />
  ),
  li: ({ className, ...props }: ComponentProps<'li'>) => (
    <li
      {...props}
      className={cn(
        'my-2 pl-1 marker:text-muted-foreground [&>ol]:my-2 [&>p]:mb-2 [&>ul]:my-2',
        className,
      )}
      data-mdx="li"
    />
  ),
  hr: () => <Separator className="my-12" data-mdx="hr" />,
  strong: ({ className, ...props }: ComponentProps<'strong'>) => (
    <strong {...props} className={cn('font-[550] text-foreground', className)} data-mdx="strong" />
  ),
  em: ({ className, ...props }: ComponentProps<'em'>) => (
    <em {...props} className={cn('italic', className)} data-mdx="em" />
  ),
  del: ({ className, ...props }: ComponentProps<'del'>) => (
    <del {...props} className={cn('line-through', className)} data-mdx="del" />
  ),
  s: ({ className, ...props }: ComponentProps<'s'>) => (
    <s {...props} className={cn('line-through', className)} data-mdx="s" />
  ),
  br: (props: ComponentProps<'br'>) => <br {...props} data-mdx="br" />,
  thead: (props: ComponentProps<'thead'>) => <TableHeader {...props} data-mdx="thead" />,
  tbody: (props: ComponentProps<'tbody'>) => <TableBody {...props} data-mdx="tbody" />,
  tfoot: (props: ComponentProps<'tfoot'>) => <TableFooter {...props} data-mdx="tfoot" />,
  tr: (props: ComponentProps<'tr'>) => <TableRow {...props} data-mdx="tr" />,
  th: (props: ComponentProps<'th'>) => <TableHead {...props} data-mdx="th" />,
  td: (props: ComponentProps<'td'>) => <TableCell {...props} data-mdx="td" />,
  caption: (props: ComponentProps<'caption'>) => <TableCaption {...props} data-mdx="caption" />,
  colgroup: (props: ComponentProps<'colgroup'>) => <colgroup {...props} data-mdx="colgroup" />,
  col: (props: ComponentProps<'col'>) => <col {...props} data-mdx="col" />,
  sup: ({ className, ...props }: ComponentProps<'sup'>) => (
    <sup {...props} className={cn('text-xs', className)} data-mdx="sup" />
  ),
  sub: ({ className, ...props }: ComponentProps<'sub'>) => (
    <sub {...props} className={cn('text-xs', className)} data-mdx="sub" />
  ),
  section: ({ className, ...props }: ComponentProps<'section'>) => (
    <section
      {...props}
      className={cn(
        'data-footnotes:mt-16 data-footnotes:border-t data-footnotes:text-sm',
        className,
      )}
      data-mdx="section"
    />
  ),
  div: (props: ComponentProps<'div'>) => <div {...props} data-mdx="div" />,
  span: (props: ComponentProps<'span'>) => <span {...props} data-mdx="span" />,
  dl: ({ className, ...props }: ComponentProps<'dl'>) => (
    <dl {...props} className={cn('my-6', className)} data-mdx="dl" />
  ),
  dt: ({ className, ...props }: ComponentProps<'dt'>) => (
    <dt {...props} className={cn('mt-5 font-medium text-foreground', className)} data-mdx="dt" />
  ),
  dd: ({ className, ...props }: ComponentProps<'dd'>) => (
    <dd {...props} className={cn('mt-1 mb-5 ml-5', className)} data-mdx="dd" />
  ),
  kbd: ({ className, ...props }: ComponentProps<'kbd'>) => (
    <kbd
      {...props}
      className={cn(
        'rounded border border-b-2 bg-card px-1.5 py-0.5 font-mono text-xs text-foreground',
        className,
      )}
      data-mdx="kbd"
    />
  ),
  mark: ({ className, ...props }: ComponentProps<'mark'>) => (
    <mark
      {...props}
      className={cn(
        'rounded bg-emerald-100 px-1 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100',
        className,
      )}
      data-mdx="mark"
    />
  ),
  abbr: ({ className, ...props }: ComponentProps<'abbr'>) => (
    <abbr
      {...props}
      className={cn('underline decoration-dotted underline-offset-4', className)}
      data-mdx="abbr"
    />
  ),
  video: ({ className, ...props }: ComponentProps<'video'>) => (
    // oxlint-disable-next-line jsx-a11y/media-has-caption -- MDX authors supply caption tracks as children
    <video
      {...props}
      className={cn('my-6 max-w-full rounded-xl border', className)}
      data-mdx="video"
    />
  ),
  audio: ({ className, ...props }: ComponentProps<'audio'>) => (
    // oxlint-disable-next-line jsx-a11y/media-has-caption -- MDX authors supply caption tracks as children
    <audio {...props} className={cn('my-6 max-w-full', className)} data-mdx="audio" />
  ),
  track: (props: ComponentProps<'track'>) => <track {...props} data-mdx="track" />,
  source: (props: ComponentProps<'source'>) => <source {...props} data-mdx="source" />,
  time: ({ className, ...props }: ComponentProps<'time'>) => (
    <time {...props} className={cn('tabular-nums', className)} data-mdx="time" />
  ),
  small: ({ className, ...props }: ComponentProps<'small'>) => (
    <small {...props} className={cn('text-sm', className)} data-mdx="small" />
  ),
  u: ({ className, ...props }: ComponentProps<'u'>) => (
    <u {...props} className={cn('underline', className)} data-mdx="u" />
  ),
  b: ({ className, ...props }: ComponentProps<'b'>) => (
    <b {...props} className={cn('font-semibold', className)} data-mdx="b" />
  ),
  i: ({ className, ...props }: ComponentProps<'i'>) => (
    <i {...props} className={cn('italic', className)} data-mdx="i" />
  ),
} satisfies MDXComponents;
