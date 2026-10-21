import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const port = Number(process.env.PORT || 3000);
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filename = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = path.relative(root, filename);
    const publicFile = ['index.html', 'styles.css', 'app.js'].includes(relative) || (relative.startsWith(`assets${path.sep}`) && !relative.split(path.sep).some(segment => segment.startsWith('.')));
    if (!publicFile) {
      response.writeHead(404).end('Not found');
      return;
    }
    const data = await readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    response.end(data);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.on('error', error => {
  console.error(`SWING LAB server failed to start: ${error.message}`);
  process.exit(1);
});
server.listen(port, '0.0.0.0', () => {
  console.log('SWING LAB development server is ready');
  console.log(`  Local:   http://localhost:${server.address().port}/`);
  console.log(`  Listen:  0.0.0.0:${server.address().port}`);
});
