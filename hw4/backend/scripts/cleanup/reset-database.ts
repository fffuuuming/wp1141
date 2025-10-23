import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

async function resetDatabase() {
  console.log('🔄 開始重置資料庫...\n');

  try {
    // 刪除資料庫檔案
    const dbPath = path.join(__dirname, 'database', 'locations.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ 刪除現有資料庫檔案');
    } else {
      console.log('ℹ️ 資料庫檔案不存在，跳過刪除');
    }

    // 重新建立資料庫
    console.log('🏗️ 重新建立資料庫...');
    
    // 確保資料庫目錄存在
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 建立新的資料庫連接
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 資料庫連接失敗:', err.message);
        process.exit(1);
      }
      console.log('✅ 資料庫連接成功');
    });

    // 啟用外鍵約束
    db.run('PRAGMA foreign_keys = ON;');

    // 建立資料表
    const createTablesSQL = `
-- 使用者表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 地點表
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category VARCHAR(50),
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations(category);
CREATE INDEX IF NOT EXISTS idx_locations_rating ON locations(rating);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`;

    db.exec(createTablesSQL, (err) => {
      if (err) {
        console.error('❌ 建立資料表失敗:', err.message);
        process.exit(1);
      } else {
        console.log('✅ 資料表建立成功');
      }
    });

    // 關閉資料庫連接
    db.close((err) => {
      if (err) {
        console.error('❌ 關閉資料庫失敗:', err.message);
      } else {
        console.log('✅ 資料庫連接已關閉');
      }
    });

    console.log('\n🎉 資料庫重置完成！');
    console.log('📊 重置結果:');
    console.log('   - 舊資料庫檔案: 已刪除');
    console.log('   - 新資料庫: 已建立');
    console.log('   - 資料表結構: 已初始化');
    console.log('   - 索引: 已建立');

  } catch (error) {
    console.error('❌ 資料庫重置失敗:', error);
    process.exit(1);
  }
}

// 執行重置
resetDatabase().catch(console.error);
