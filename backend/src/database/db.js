// backend/src/database/db.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// -------------------------------------------------------
// 获取当前文件真实目录
// -------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------
// 解析数据库文件路径（自动支持绝对/相对路径）
// -------------------------------------------------------
let dbFile;

if (!process.env.DB_FILE) {
  // 默认路径
  console.warn('⚠️  DB_FILE not set in .env, using default: data/app.db');
  dbFile = path.resolve(__dirname, '../../data/app.db');
} else if (path.isAbsolute(process.env.DB_FILE)) {
  // 绝对路径
  dbFile = process.env.DB_FILE;
} else {
  // 相对路径（相对于项目根目录 backend/）
  dbFile = path.resolve(__dirname, '../../', process.env.DB_FILE);
}

console.log('📦 Database file path:', dbFile);

// -------------------------------------------------------
// 获取数据库模式（dev / prod）
// -------------------------------------------------------
const dbMode = process.env.DB_MODE || process.env.APP_MODE || 'dev';
console.log(`🔧 Database mode: ${dbMode}`);

// -------------------------------------------------------
// 检查数据库文件是否存在
// -------------------------------------------------------
const dbExists = fs.existsSync(dbFile);

// 如果数据库目录不存在，自动创建
if (!dbExists) {
  const folder = path.dirname(dbFile);
  if (!fs.existsSync(folder)) {
    console.log('📁 Creating DB directory:', folder);
    fs.mkdirSync(folder, { recursive: true });
  }
}

// -------------------------------------------------------
// 连接 SQLite
// -------------------------------------------------------
const db = new Database(dbFile, {
  verbose: process.env.SQL_VERBOSE === 'true' ? console.log : null
});

// -------------------------------------------------------
// SQLite 性能优化配置
// -------------------------------------------------------
db.pragma('foreign_keys = ON');           // 启用外键约束
db.pragma('journal_mode = WAL');          // 使用 WAL 模式提高并发性能
db.pragma('synchronous = NORMAL');        // 平衡性能与安全性
db.pragma('temp_store = MEMORY');         // 临时表存储在内存
db.pragma('mmap_size = 30000000000');     // 使用内存映射 I/O
db.pragma('page_size = 4096');            // 设置页面大小
db.pragma('cache_size = -64000');         // 设置缓存大小 (64MB)

console.log('✅ SQLite connected with optimized settings');

// -------------------------------------------------------
// 初次运行：执行 init-db.sql
// -------------------------------------------------------
if (!dbExists) {
  console.log('\n📦 New database detected — initializing from init-db.sql...');

  const initSqlPath = path.resolve(__dirname, './init-db.sql');

  if (!fs.existsSync(initSqlPath)) {
    console.error('❌ init-db.sql not found at:', initSqlPath);
    throw new Error('Database initialization file missing');
  }

  try {
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');
    
    console.log('⚙️  Executing schema creation...');
    db.exec(initSql);

    console.log('✅ Database initialized successfully');
    
    // 根据环境变量设置数据库模式
    console.log(`🔧 Setting database mode to: ${dbMode}`);
    db.prepare('UPDATE system_config SET value = ? WHERE key = ?').run(dbMode, 'mode');
    
    const currentMode = db.prepare('SELECT value FROM system_config WHERE key = ?').get('mode');
    console.log(`✅ Database mode set to: ${currentMode.value}`);
    
    if (dbMode === 'prod') {
      console.log('🔒 Production mode enabled - inventory triggers are ACTIVE');
    } else {
      console.log('🔓 Development mode enabled - inventory triggers are INACTIVE');
    }

    // 验证数据库完整性
    console.log('\n🔍 Verifying database integrity...');
    const integrity = db.pragma('integrity_check', { simple: true });
    if (integrity === 'ok') {
      console.log('✅ Database integrity check passed');
    } else {
      console.error('❌ Database integrity check failed:', integrity);
    }

    // 显示表统计信息
    console.log('\n📈 Database statistics:');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();
    
    console.log(`   Total tables: ${tables.length}`);
    tables.forEach(({ name }) => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get();
      console.log(`   - ${name}: ${count.count} rows`);
    });

    console.log('\n');

  } catch (err) {
    console.error('❌ Failed to execute init-db.sql');
    console.error('Error details:', err.message);
    
    // 清理失败的数据库文件
    if (fs.existsSync(dbFile)) {
      console.log('🗑  Cleaning up failed database file...');
      fs.unlinkSync(dbFile);
    }
    
    throw err;
  }
} else {
  console.log('🔍 Existing database detected — skipping initialization');
  
  // 验证并更新数据库模式（如果需要）
  try {
    const currentMode = db.prepare('SELECT value FROM system_config WHERE key = ?').get('mode');
    
    if (currentMode && currentMode.value !== dbMode) {
      console.log(`🔄 Updating database mode from '${currentMode.value}' to '${dbMode}'`);
      db.prepare('UPDATE system_config SET value = ? WHERE key = ?').run(dbMode, 'mode');
      
      if (dbMode === 'prod') {
        console.log('🔒 Production mode enabled - inventory triggers are now ACTIVE');
      } else {
        console.log('🔓 Development mode enabled - inventory triggers are now INACTIVE');
      }
    } else {
      console.log(`🔧 Database mode: ${dbMode}`);
      
      if (dbMode === 'prod') {
        console.log('🔒 Production mode - inventory triggers are ACTIVE');
      } else {
        console.log('🔓 Development mode - inventory triggers are INACTIVE');
      }
    }

    // 验证数据库完整性
    const integrity = db.pragma('integrity_check', { simple: true });
    if (integrity === 'ok') {
      console.log('✅ Database integrity verified');
    } else {
      console.warn('⚠️  Database integrity issues detected:', integrity);
    }

    // 显示数据库信息
    const tables = db.prepare(`
      SELECT COUNT(*) as count FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).get();
    console.log(`📊 Database contains ${tables.count} tables`);

  } catch (err) {
    console.error('❌ Error verifying database:', err.message);
  }
}

// -------------------------------------------------------
// 数据库健康检查函数
// -------------------------------------------------------
export function checkDatabaseHealth() {
  try {
    // 检查连接
    db.prepare('SELECT 1').get();
    
    // 检查完整性
    const integrity = db.pragma('integrity_check', { simple: true });
    
    // 检查外键
    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    
    // 检查数据库模式
    const mode = db.prepare('SELECT value FROM system_config WHERE key = ?').get('mode');
    
    return {
      healthy: true,
      integrity: integrity === 'ok',
      foreignKeysEnabled: foreignKeys === 1,
      mode: mode?.value || 'unknown',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// -------------------------------------------------------
// 切换数据库模式（开发工具函数）
// -------------------------------------------------------
export function setDatabaseMode(mode) {
  if (mode !== 'dev' && mode !== 'prod') {
    throw new Error('Invalid mode. Must be "dev" or "prod"');
  }
  
  try {
    db.prepare('UPDATE system_config SET value = ? WHERE key = ?').run(mode, 'mode');
    console.log(`✅ Database mode set to: ${mode}`);
    
    if (mode === 'prod') {
      console.log('🔒 Inventory triggers are now ACTIVE');
    } else {
      console.log('🔓 Inventory triggers are now INACTIVE');
    }
    
    return { success: true, mode };
  } catch (error) {
    console.error('❌ Failed to set database mode:', error.message);
    throw error;
  }
}

// -------------------------------------------------------
// 获取当前数据库模式
// -------------------------------------------------------
export function getDatabaseMode() {
  try {
    const result = db.prepare('SELECT value FROM system_config WHERE key = ?').get('mode');
    return result?.value || 'unknown';
  } catch (error) {
    console.error('❌ Failed to get database mode:', error.message);
    return 'unknown';
  }
}

// -------------------------------------------------------
// 优雅关闭数据库连接
// -------------------------------------------------------
export function closeDatabase() {
  try {
    console.log('🔒 Closing database connection...');
    
    // 执行 WAL checkpoint
    db.pragma('wal_checkpoint(TRUNCATE)');
    
    // 关闭连接
    db.close();
    
    console.log('✅ Database connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database:', error.message);
    throw error;
  }
}

// -------------------------------------------------------
// 进程退出时自动关闭数据库
// -------------------------------------------------------
const shutdownHandler = (signal) => {
  console.log(`\n📡 Received ${signal}, closing database...`);
  try {
    closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdownHandler);   // Ctrl+C
process.on('SIGTERM', shutdownHandler);  // kill command
process.on('SIGHUP', shutdownHandler);   // terminal closed

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  try {
    closeDatabase();
  } catch (e) {
    console.error('Error during emergency shutdown:', e);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// -------------------------------------------------------
// 导出数据库实例
// -------------------------------------------------------
export default db;