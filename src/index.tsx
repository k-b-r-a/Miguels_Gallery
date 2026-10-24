import { serve } from 'bun';
import indexHTML from './index.html';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

const getTailwindBin = (): string => {
  const isWin = process.platform === 'win32';
  const candidates = isWin
    ? [
        path.join(process.cwd(), 'node_modules', '.bin', 'tailwindcss.exe'),
        path.join(process.cwd(), 'node_modules', '.bin', 'tailwindcss.cmd'),
        path.join(process.cwd(), 'node_modules', '.bin', 'tailwindcss')
      ]
    : [
        path.join(process.cwd(), 'node_modules', '.bin', 'tailwindcss')
      ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return 'tailwindcss';
};

const tailwindBin = getTailwindBin();
const distDir = path.join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Ensure initial Tailwind build before serving
const distTailwindPath = path.join(distDir, 'tailwind.css');
if (!existsSync(distTailwindPath)) {
  Bun.spawnSync([tailwindBin, '-i', './src/index.css', '-o', './dist/tailwind.css']);
}

// Start Tailwind CLI in watch mode
const tailwindProcess = Bun.spawn([tailwindBin, '-i', './src/index.css', '-o', './dist/tailwind.css', '--watch'], {
  stdout: 'inherit',
  stderr: 'inherit',
});

const server = serve({
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // API Routes
    if (pathname === '/api/hello') {
      return Response.json({ message: 'Hello, world!' });
    }

    // Special handling for frontend.tsx - Bundle it!
    if (pathname === '/frontend.tsx') {
      const result = await Bun.build({
        entrypoints: [path.join(import.meta.dir, 'frontend.tsx')],
        target: 'browser',
        minify: false,
      });
      if (result.success) {
        return new Response(result.outputs[0], {
          headers: { 'Content-Type': 'text/javascript;charset=utf-8' }
        });
      } else {
        return new Response(result.logs.map(l => l.message).join('\n'), { status: 500 });
      }
    }

    // Serve the generated Tailwind CSS
    if (pathname === '/index.css') {
      const cssFile = Bun.file(distTailwindPath);
      if (await cssFile.exists()) {
        return new Response(cssFile, {
          headers: { 'Content-Type': 'text/css' }
        });
      }
      Bun.spawnSync([tailwindBin, '-i', './src/index.css', '-o', './dist/tailwind.css']);
      return new Response(Bun.file(distTailwindPath), {
        headers: { 'Content-Type': 'text/css' }
      });
    }

    // Static Files
    const filePath = path.join(import.meta.dir, pathname === '/' ? 'index.html' : pathname);
    const file = Bun.file(filePath);

    if (await file.exists()) {
      const extension = path.extname(filePath);
      const mimeTypes: Record<string, string> = {
        '.css': 'text/css',
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
      };
      return new Response(file, {
        headers: { 'Content-Type': mimeTypes[extension] || 'application/octet-stream' }
      });
    }

    // SPA Fallback
    if (!pathname.startsWith('/api/')) {
        return new Response(indexHTML, {
            headers: { 'Content-Type': 'text/html' },
        });
    }

    return new Response('Not Found', { status: 404 });
  },
  port: 3000,
  hostname: '0.0.0.0',
  development: true,
});

console.log(`🚀 Dev server running at ${server.url}`);

process.on('SIGINT', () => {
  tailwindProcess.kill();
  process.exit();
});
