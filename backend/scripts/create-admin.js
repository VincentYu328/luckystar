// backend/scripts/create-admin.js
import db from '../src/database/db.js';
import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('==========================================');
console.log(' Lucky Star — Create Admin Account');
console.log('==========================================\n');

async function createAdmin() {
  try {
    // 获取用户输入
    const fullName = await question('Full Name: ');
    const email = await question('Email: ');
    const phone = await question('Phone: ');
    const password = await question('Password: ');
    const confirmPassword = await question('Confirm Password: ');

    // 验证输入
    if (!fullName || !email || !phone || !password) {
      throw new Error('All fields are required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // 检查邮箱是否已存在
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      throw new Error(`Email ${email} is already registered`);
    }

    // 哈希密码
    console.log('\n🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // 获取 Head 职位 ID
    const position = db.prepare('SELECT id FROM positions WHERE name = ?').get('Head');
    if (!position) {
      throw new Error('Head position not found in database. Please run db:init first.');
    }

    // 创建管理员账号
    console.log('📝 Creating admin account...');
    const result = db.prepare(`
      INSERT INTO users (
        full_name, 
        email, 
        phone, 
        position_id, 
        password_hash, 
        must_change_password, 
        is_active
      )
      VALUES (?, ?, ?, ?, ?, 0, 1)
    `).run(fullName, email, phone, position.id, passwordHash);

    // 记录审计日志
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
      VALUES (?, 'admin_created', 'user', ?, ?)
    `).run(
      result.lastInsertRowid,
      result.lastInsertRowid,
      JSON.stringify({ email, created_by: 'system' })
    );

    console.log('\n✅ Admin account created successfully!');
    console.log('==========================================');
    console.log('User ID:', result.lastInsertRowid);
    console.log('Email:', email);
    console.log('Position: Head (Admin)');
    console.log('==========================================\n');

    console.log('You can now login with:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log('\n⚠️  Please change your password after first login!\n');

  } catch (error) {
    console.error('\n❌ Error creating admin account:');
    console.error(error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();