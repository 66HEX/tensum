function customProperties(css: string, selector: string): Map<string, string> {
  const escaped = selector.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 'u'))?.[1];

  if (block === undefined || block.length === 0) {
    throw new Error(`Missing ${selector} theme in styles.css`);
  }

  const properties = new Map<string, string>();

  for (const match of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/gu)) {
    const [, name, value] = match;

    if (name && value) {
      properties.set(name, value.trim());
    }
  }

  return properties;
}

function resolveProperty(
  name: string,
  properties: Map<string, string>,
  stack = new Set<string>(),
): string {
  const value = properties.get(name);

  if (value === undefined || value.length === 0 || stack.has(name)) {
    throw new Error(`Missing or circular OG theme token: ${name}`);
  }

  const nextStack = new Set(stack).add(name);

  return value.replaceAll(/var\((--[\w-]+)\)/gu, (_, reference: string) =>
    resolveProperty(reference, properties, nextStack),
  );
}

function toHexChannel(channel: number): string {
  const clamped = Math.max(0, Math.min(1, channel));
  const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;

  return Math.round(srgb * 255)
    .toString(16)
    .padStart(2, '0');
}

// SVG decoders need sRGB rather than the theme's CSS Color 4 values
function toSvgColor(color: string): string {
  const match = color.match(
    /^oklch\(\s*([\d.]+)(%)?\s+([\d.]+)(%)?\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+)(%)?)?\s*\)$/iu,
  );

  if (!match) {
    return color;
  }

  const lightness = Number(match[1]) / (match[2] ? 100 : 1);
  const chroma = Number(match[3]) * (match[4] ? 0.004 : 1);
  const hue = (Number(match[5]) * Math.PI) / 180;
  const alpha = match[6] ? Number(match[6]) / (match[7] ? 100 : 1) : 1;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
    .map((channel) => toHexChannel(channel))
    .join('');

  const opacity =
    alpha < 1
      ? Math.round(Math.max(0, Math.min(1, alpha)) * 255)
          .toString(16)
          .padStart(2, '0')
      : '';

  return `#${rgb}${opacity}`;
}

export function getDarkTheme(css: string) {
  const properties = new Map([
    ...customProperties(css, ':root'),
    ...customProperties(css, '.dark'),
  ]);

  const color = (name: string) => toSvgColor(resolveProperty(name, properties));

  return {
    background: color('--background'),
    foreground: color('--foreground'),
    card: color('--card'),
    cardForeground: color('--card-foreground'),
    mutedForeground: color('--muted-foreground'),
    border: color('--border'),
  };
}
