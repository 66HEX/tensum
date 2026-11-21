import { MDXProvider } from '@mdx-js/react';
import { useEffect } from 'react';

import { HeaderBrand } from '@/components/header-brand';
import { Icon } from '@/components/icon';
import { mdxComponents } from '@/components/mdx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import Documentation from '@/content/index.mdx';
import { PreferencesProvider, usePreferences } from '@/lib/preferences';

function ThemeToggle() {
  const { dark, toggleTheme } = usePreferences();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    >
      <Icon name={dark ? 'sun' : 'moon'} />
    </Button>
  );
}

function Document() {
  useEffect(() => {
    function scrollToAnchor(): void {
      if (!location.hash) {
        return;
      }

      try {
        const target = document.querySelector(
          `#${CSS.escape(decodeURIComponent(location.hash.slice(1)))}`,
        );

        target?.scrollIntoView();
      } catch {
        // A malformed hash does not identify a section
      }
    }

    const frame = requestAnimationFrame(scrollToAnchor);
    window.addEventListener('hashchange', scrollToAnchor);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', scrollToAnchor);
    };
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="fixed -top-20 left-6 z-50 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground focus:top-4"
      >
        Skip to content
      </a>
      <div className="page-frame">
        <div className="page-column">
          <header className="layout-band flex flex-wrap items-center justify-between gap-2 p-4">
            <HeaderBrand />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a
                href="https://github.com/66HEX/tensum"
                target="_blank"
                rel="noreferrer"
                aria-label="Tensum on GitHub"
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
              >
                <Icon name="github" />
              </a>
            </div>
          </header>
          <main id="main-content" tabIndex={-1} className="min-w-0 outline-none">
            <article
              data-document="tensum"
              className="text-sm leading-relaxed wrap-break-word text-zinc-700 dark:text-zinc-300"
            >
              <Documentation />
            </article>
            <footer className="layout-band flex flex-col items-start gap-4 p-4 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <a
                href="#main-content"
                className="inline-flex items-center gap-2 type-display text-lg text-foreground"
              >
                <img src="/logo.svg" alt="" aria-hidden="true" className="h-4 w-auto dark:invert" />
                tensum
              </a>
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <Avatar aria-hidden="true">
                  <AvatarImage
                    src="https://www.madebyhex.com/images/avatar.webp"
                    alt=""
                    loading="lazy"
                  />
                  <AvatarFallback>
                    <Icon name="user" />
                  </AvatarFallback>
                </Avatar>
                <span>
                  By{' '}
                  <a
                    href="https://www.madebyhex.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground transition-colors hover:text-muted-foreground"
                  >
                    Marek Jóźwiak
                  </a>
                </span>
              </div>
              <a href="#main-content" className="text-xs">
                Back to top <span aria-hidden="true">↑</span>
              </a>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <TooltipProvider>
        <MDXProvider components={mdxComponents}>
          <Document />
        </MDXProvider>
      </TooltipProvider>
    </PreferencesProvider>
  );
}
