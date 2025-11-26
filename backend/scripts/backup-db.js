// backend/scripts/backup-db.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==========================================');
console.log(' Lucky Star — Database Backup');
console.log('==========================================\n');

try {
  // 解析数据库路径
  let dbFile;
  if (path.isAbsolute(process.env.DB_FILE)) {
    dbFile = process.env.DB_FILE;
  } else {
    dbFile = path.resolve(__dirname, '../', process.env.DB_FILE);
  }

  if (!fs.existsSync(dbFile)) {
    console.error('❌ Database file not found:', dbFile);
    process.exit(1);
  }

  console.log('📦 Source database:', dbFile);

  // 创建备份目录
  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    console.log('📁 Creating backup directory:', backupDir);
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 生成备份文件名（带时间戳）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(backupDir, `app-backup-${timestamp}.db`);

  console.log('💾 Backup destination:', backupFile);
  console.log('⏳ Creating backup...\n');

  // 方法 1: 使用 SQLite VACUUM INTO（推荐，会优化数据库）
  const db = new Database(dbFile, { readonly: true });
  
  try {
    // 执行 VACUUM INTO 创建优化的备份
    db.prepare(`VACUUM INTO '${backupFile}'`).run();
    
    console.log('✅ Backup created successfully using VACUUM INTO');
  } catch (error) {
    console.log('⚠️  VACUUM INTO not supported, falling back to file copy...');
    
    // 方法 2: 直接文件复制（兼容旧版本）
    // 先执行 WAL checkpoint 确保数据完整
    db.pragma('wal_checkpoint(TRUNCATE)');
    
    // 复制主数据库文件
    fs.copyFileSync(dbFile, backupFile);
    
    console.log('✅ Backup created successfully using file copy');
  }
  
  db.close();

  // 验证备份文件
  console.log('\n🔍 Verifying backup...');
  const backupDb = new Database(backupFile, { readonly: true });
  
  const integrity = backupDb.pragma('integrity_check', { simple: true });
  if (integrity === 'ok') {
    console.log('✅ Backup integrity verified');
  } else {
    console.error('❌ Backup integrity check failed:', integrity);
    backupDb.close();
    process.exit(1);
  }

  // 显示备份统计
  const tables = backupDb.prepare(`
    SELECT COUNT(*) as count FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).get();

  const backupSize = fs.statSync(backupFile).size;
  const originalSize = fs.statSync(dbFile).size;

  console.log('\n📊 Backup Statistics:');
  console.log(`   Tables: ${tables.count}`);
  console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Backup size: ${(backupSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Compression: ${((1 - backupSize / originalSize) * 100).toFixed(1)}%`);

  backupDb.close();

  // 清理旧备份（保留最近10个）
  console.log('\n🧹 Cleaning old backups...');
  const backups = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('app-backup-') && file.endsWith('.db'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  const keepCount = 10;
  if (backups.length > keepCount) {
    const toDelete = backups.slice(keepCount);
    console.log(`   Removing ${toDelete.length} old backup(s)...`);
    
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`   🗑  Deleted: ${backup.name}`);
    });
  } else {
    console.log(`   Keeping all ${backups.length} backup(s)`);
  }

  console.log('\n✅ Backup completed successfully!');
  console.log('==========================================\n');

  process.exit(0);

} catch (error) {
  console.error('\n❌ Backup failed:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}