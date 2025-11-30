import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ==========================================
// 🎯 修正: 强制加载环境变量并解析数据库路径
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, '..'); // 明确指向 backend/ 根目录

// 1. 确定要加载的 .env 文件名
const envFileName = process.env.NODE_ENV === 'production' 
    ? '.env' 
    : '.env.development';
    
// 2. 使用绝对路径加载 .env 文件，无论脚本从何处运行
const envPath = path.resolve(backendRoot, envFileName);

if (!fs.existsSync(envPath)) {
    console.warn(`⚠️ Environment file not found at: ${envPath}. Using fallback to process.env.`);
} else {
    dotenv.config({ path: envPath });
}


// --- 检查 DB_FILE ---
const dbFilePath = process.env.DB_FILE; 

if (!dbFilePath || dbFilePath === ':memory:') {
    throw new Error('❌ 无法从 .env 文件中获取有效的 DB_FILE 路径。请确保 DB_FILE=./src/database/app.db 已设置。');
}

// 2. 解析 DB_FILE 为绝对路径 (相对于 backendRoot)
const dbPath = path.resolve(backendRoot, dbFilePath);
const sqlPath = path.join(__dirname, '../src/database/init-db.sql'); // 保持不变

// 提取数据库文件所在的目录路径
const dbDir = path.dirname(dbPath);

console.log('==========================================');
console.log(' Lucky Star — Database Init Script');
console.log('==========================================\n');
console.log(`\u{1F4C0} Database file path: ${dbPath}`);

// 1. 删除旧数据库（可选）
if (fs.existsSync(dbPath)) {
  console.log(`🗑  Removing old database: ${dbPath}`);
  fs.unlinkSync(dbPath);
}

// ==========================================
// 🎯 新增: 确保数据库目录存在
// ==========================================
if (!fs.existsSync(dbDir)) {
    console.log(`\u{1F4C1} Creating database directory: ${dbDir}`);
    // recursive: true 确保可以创建多级目录
    fs.mkdirSync(dbDir, { recursive: true });
}
// ==========================================

// 2. 创建新的空数据库
console.log('📦  Creating new SQLite database...');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // 启用 WAL 模式，提高并发性能
db.pragma('foreign_keys = ON');  // 确保外键约束开启

// 3. 读取 init-db.sql
console.log('📖  Reading init-db.sql...');
const initSQL = fs.readFileSync(sqlPath, 'utf8');

// 4. 分割多条 SQL 并执行
console.log('⚙️  Executing SQL schema...');
try {
  db.exec(initSQL);
  console.log('✅  Database initialized successfully!');
} catch (err) {
  console.error('❌  Error executing init-db.sql');
  console.error(err.message);
  db.close();
  process.exit(1);
}

db.close();
console.log('\n🎉 Done! You can now open app.db in VS Code.');
console.log('==========================================');