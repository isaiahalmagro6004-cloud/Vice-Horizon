// VICE HORIZON — Express Static Web Server (Render.com Ready)
// Serves index.html, enables CORS, and binds dynamically to process.env.PORT.

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES Module scope ("type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use(cors());
app.disable('x-powered-by');

const INDEX_HTML_PATH = path.join(__dirname, 'index.html');

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    game: 'Vice Horizon',
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Serve the Vice Horizon HTML5 game client
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
app.get('*', serveGameClient);

// Startup confirmation log
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

// Listen dynamically to process.env.PORT (no hardcoded port)
const envPort = process.env.PORT;
const server = envPort
  ? app.listen(envPort, '0.0.0.0', onServerReady)
  : app.listen(onServerReady);

// Graceful shutdown handlers
function shutdown(signal) {
  console.log(`[VICE HORIZON] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[VICE HORIZON] HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
