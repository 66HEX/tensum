import { readFile } from 'node:fs/promises';

import { createElement as el } from 'react';
import { render } from 'takumi-js';

import { getDarkTheme } from './theme.ts';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const ogInputs = {
  theme: new URL('../src/styles.css', import.meta.url),
  logo: new URL('../public/logo.svg', import.meta.url),
  displayFont: new URL(
    import.meta.resolve('@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2'),
  ),
  monoFont: new URL('../public/fonts/IoskeleyMono-Medium.woff2', import.meta.url),
};

function svgUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

export async function createOgImage() {
  const [css, logo, displayFont, monoFont] = await Promise.all([
    readFile(ogInputs.theme, 'utf8'),
    readFile(ogInputs.logo, 'utf8'),
    readFile(ogInputs.displayFont),
    readFile(ogInputs.monoFont),
  ]);

  const colors = getDarkTheme(css);
  const mark = svgUri(logo.replaceAll('currentColor', colors.foreground));

  const blueprint = svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="${colors.background}" />
      <rect x="64" y="64" width="1072" height="502" fill="${colors.card}" />
      <path d="M64 0V630M1136 0V630M0 64H1200M0 566H1200"
        fill="none" stroke="${colors.border}" stroke-width="2" stroke-dasharray="6 6" />
    </svg>
  `);

  const component = el(
    'div',
    {
      tw: 'relative flex h-full w-full overflow-hidden font-normal',
      style: { fontFamily: 'Inter', color: colors.cardForeground },
    },
    el('img', {
      src: blueprint,
      alt: '',
      width: OG_WIDTH,
      height: OG_HEIGHT,
      style: { position: 'absolute', inset: 0 },
    }),
    el(
      'div',
      {
        tw: 'absolute flex flex-col justify-center gap-6',
        style: { left: 104, top: 144, width: 680, height: 330 },
      },
      el(
        'div',
        { tw: 'flex flex-col text-7xl' },
        el('div', {}, 'Analytical springs'),
        el('div', {}, 'wired to GSAP.'),
      ),
      el(
        'div',
        {
          tw: 'text-xl leading-relaxed',
          style: { width: 610, color: colors.mutedForeground },
        },
        'Derived-duration timelines, direct controllers, and certified CSS linear() export.',
      ),
    ),
    el('img', {
      src: mark,
      alt: 'Tensum logo',
      width: 240,
      height: 220,
      style: { position: 'absolute', right: 104, top: 199 },
    }),
  );

  return render(component, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    format: 'png',
    fonts: [
      { name: 'Inter', data: displayFont, weight: 400, style: 'normal' },
      { name: 'Ioskeley Mono', data: monoFont, weight: 500, style: 'normal' },
    ],
  });
}
