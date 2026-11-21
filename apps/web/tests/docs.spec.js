import { expect, test } from '@playwright/test';

async function ready(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('tensum');
}

test('Shiki code blocks highlight and copy cleanly', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (value) => {
          window.copiedCode = value;
        },
      },
    });
  });
  await ready(page);
  const block = page.locator('[data-mdx="pre"]').first();
  await expect(block.locator('pre.shiki span[style]').first()).toBeAttached();
  await block.getByRole('button', { name: 'Copy code' }).click();
  await expect(block.getByRole('status')).toHaveText('Copied');
  const copied = await page.evaluate(() => window.copiedCode);
  expect(copied).toContain('pnpm add tensum gsap');
  expect(copied).not.toContain('Copied');
});

test('clipboard rejection gives usable feedback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Clipboard denied');
        },
      },
    });
  });
  await ready(page);
  const block = page.locator('[data-mdx="pre"]').first();
  await block.getByRole('button', { name: 'Copy code' }).click();
  await expect(block.getByRole('status')).toHaveText(
    'Could not copy. Select the code and copy it manually.',
  );
});

test('section links work on a fresh visit and every internal anchor resolves', async ({ page }) => {
  await page.goto('/#api-reference');
  const heading = page.locator('#api-reference');
  await expect(heading).toBeInViewport();
  await expect.poll(async () => (await heading.boundingBox()).y).toBeGreaterThanOrEqual(0);

  const missing = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links.flatMap((link) => {
      const id = decodeURIComponent(link.getAttribute('href').slice(1));

      return document.querySelector(`#${CSS.escape(id)}`) ? [] : [id];
    }),
  );

  expect(missing).toEqual([]);

  const ids = await page
    .locator('[id]')
    .evaluateAll((elements) => elements.map((element) => element.id));

  expect(new Set(ids).size).toBe(ids.length);
});

test('theme preference survives reload and can be toggled', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await ready(page);
  await page.locator('header').getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass('dark');
  await page.reload();
  await expect(
    page.locator('header').getByRole('button', { name: 'Switch to light theme' }),
  ).toBeVisible();

  await page.locator('header').getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).not.toHaveClass('dark');
});
