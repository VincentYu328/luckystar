// backend/src/utils/logger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// log directory
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');
const ENV = process.env.NODE_ENV || 'development';

// timestamp formatter
function time() {
  return new Date().toISOString();
}

// color codes
const color = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// write to file in production
function writeToFile(level, msg) {
  const line = `[${time()}] [${level.toUpperCase()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
}

function log(level, colorCode, msg) {
  const formatted = `[${time()}] ${level.toUpperCase()}: ${msg}`;

  if (ENV === 'development') {
    console.log(colorCode + formatted + color.reset);
  } else {
    writeToFile(level, msg);
  }
}

export default {
  info(msg) {
    log('info', color.green, msg);
  },
  warn(msg) {
    log('warn', color.yellow, msg);
  },
  error(msg) {
    log('error', color.red, msg);
  },
  debug(msg) {
    // debug only visible in development
    if (ENV === 'development') {
      log('debug', color.cyan, msg);
    }
  }
};
