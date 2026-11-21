import { expect, test } from '@playwright/test';

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('social crawlers receive complete metadata and a PNG using the dark theme', async ({
    page,
    request,
  }) => {
    await page.goto('/');

    const imageUrl = 'https://tensum.madebyhex.com/og.png';
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://tensum.madebyhex.com/',
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', imageUrl);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', imageUrl);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
      'content',
      '1200',
    );
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
      'content',
      '630',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );

    const response = await request.get(new URL(imageUrl).pathname);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');

    const bytes = await response.body();
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(630);
  });
});
