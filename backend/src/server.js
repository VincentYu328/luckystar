// backend/src/server.js
import app from './app.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESModule path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 8080;
const ENV = process.env.NODE_ENV || 'development';

console.log('='.repeat(60));
console.log(`🚀 Lucky Star Backend Starting...`);
console.log(`🌍 Environment: ${ENV}`);
console.log(`📦 DB File: ${process.env.DB_FILE}`);
console.log(`🌐 Allowed CORS Origin(s): ${process.env.FRONTEND_ORIGIN}`);
console.log('='.repeat(60));

// -------------------------------------------------------
// Start HTTP server
// -------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
  console.log('='.repeat(60));
});

// -------------------------------------------------------
// Graceful Shutdown Handling
// -------------------------------------------------------
const shutdown = (signal) => {
  console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
