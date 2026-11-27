* ============================================================================
 * VICE HORIZON — Express Static Web Server (Render.com Ready)
 * ============================================================================
 * Serves the self-contained Vice Horizon HTML5 Canvas game (`index.html`),
 * enables Cross-Origin Resource Sharing (CORS), and dynamically binds to
 * `process.env.PORT` without any hardcoded port numbers or secrets.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES Module scope ("type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Express application
const app = express();

// Enable CORS for cross-origin compatibility
app.use(cors());

// Disable x-powered-by header for cleaner HTTP responses
app.disable('x-powered-by');

// Path to the single-file client game
const INDEX_HTML_PATH = path.join(__dirname, 'index.html');

/**
 * Health check endpoint used by hosting platforms (such as Render) to verify
 * that the Node.js process is alive and responsive.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    game: 'Vice Horizon',
    uptimeSeconds: Math.floor(process.uptime())
  });
});

/**
 * Serve the main Vice Horizon game file at the root route and /index.html.
 */
function serveGameClient(req, res) {
  res.sendFile(INDEX_HTML_PATH, (err) => {
    if (err) {
      console.error('[VICE HORIZON] Error sending index.html:', err.message);
      if (!res.headersSent) {
        res.status(500).send('Failed to load Vice Horizon game client.');
      }
    }
  });
}

app.get('/', serveGameClient);
app.get('/index.html', serveGameClient);

/**
 * Fallback route so direct navigation to subpaths still loads the game client
 * cleanly rather than exposing server source files.
 */
app.get('*', serveGameClient);

/**
 * Callback executed once the HTTP server successfully binds to a port.
 * Uses the active socket address to confirm the assigned port in logs.
 */
function onServerReady() {
  const address = server.address();
  const activePort =
    typeof address === 'object' && address !== null ? address.port : envPort;

  console.log('============================================================');
  console.log('🌴 VICE HORIZON SERVER ONLINE');
  console.log(`🚀 Listening on port: ${activePort}`);
  console.log(`🌐 Local URL: http://localhost:${activePort}`);
  console.log('📁 Serving game client: index.html');
  console.log('============================================================');
}

/**
 * Read port exclusively from environment configuration (process.env.PORT).
 * If process.env.PORT is provided (as on Render.com), bind 0.0.0.0 on that port.
 * Otherwise, let Node select an available OS-assigned ephemeral port without
 * hardcoding any fixed fallback port.
 */
const envPort = process.env.PORT;
const server = envPort
  ? app.listen(envPort, '0.0.0.0', onServerReady)
  : app.listen(onServerReady);

/**
 * Graceful shutdown handlers for Render / container lifecycle signals.
 */
function shutdown(signal) {
  console.log(`[VICE HORIZON] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[VICE HORIZON] HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```
