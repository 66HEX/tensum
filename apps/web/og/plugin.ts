import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';

import { createOgImage, ogInputs } from './image.ts';

export function ogImagePlugin(): Plugin {
  const inputs = new Set(Object.values(ogInputs).map((url) => fileURLToPath(url)));
  let image: ReturnType<typeof createOgImage> | undefined;

  function getImage() {
    image ??= createOgImage().catch((error: Error) => {
      image = undefined;
      throw error;
    });

    return image;
  }

  return {
    name: 'tensum-og-image',
    buildStart() {
      image = undefined;

      for (const file of inputs) {
        this.addWatchFile(file);
      }
    },
    configureServer(server) {
      server.watcher.add([...inputs]);
      server.middlewares.use('/og.png', (request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          next();

          return;
        }

        async function respond() {
          try {
            const bytes = await getImage();

            response.setHeader('Content-Type', 'image/png');
            response.setHeader('Content-Length', bytes.byteLength);
            response.setHeader('Cache-Control', 'no-cache');
            response.end(request.method === 'HEAD' ? undefined : bytes);
          } catch (error) {
            next(error);
          }
        }

        void respond();
      });
    },
    handleHotUpdate(context) {
      if (inputs.has(context.file)) {
        image = undefined;
      }
    },
    async generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'og.png', source: await getImage() });
    },
  };
}
