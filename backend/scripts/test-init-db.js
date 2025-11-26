// backend/scripts/test-init-db.js
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

// resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// paths
const dbPath = path.join(__dirname, '../src/database/app.db');
const sqlPath = path.join(__dirname, '../src/database/init-db.sql');

console.log('==========================================');
console.log(' Lucky Star — Database Init Script');
console.log('==========================================\n');

// 1. 删除旧数据库（可选）
if (fs.existsSync(dbPath)) {
  console.log(`🗑  Removing old database: ${dbPath}`);
  fs.unlinkSync(dbPath);
}

// 2. 创建新的空数据库
console.log('📦  Creating new SQLite database...');
const db = new Database(dbPath);

// 3. 读取 init-db.sql
console.log('📖  Reading init-db.sql...');
const initSQL = fs.readFileSync(sqlPath, 'utf8');

// 4. 分割多条 SQL 并执行
console.log('⚙️  Executing SQL schema...');
try {
  db.exec(initSQL);
  console.log('✅  Database initialized successfully!');
} catch (err) {
  console.error('❌  Error executing init-db.sql');
  console.error(err.message);
  process.exit(1);
}

console.log('\n🎉 Done! You can now open app.db in VS Code.');
console.log('==========================================');


