import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// 資料庫檔案路徑
const DB_PATH = path.join(__dirname, '../../database/locations.db');

// 確保 database 目錄存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 建立資料庫連接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 資料庫連接失敗:', err.message);
    process.exit(1); // 資料庫連接失敗時退出程序
  } else {
    console.log('✅ SQLite 資料庫連接成功');
  }
});

// 啟用外鍵約束和優化設定
db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA journal_mode = WAL'); // 啟用 WAL 模式提升併發性能
db.run('PRAGMA synchronous = NORMAL'); // 平衡性能和安全性
db.run('PRAGMA cache_size = 10000'); // 增加快取大小
db.run('PRAGMA temp_store = MEMORY'); // 使用記憶體儲存臨時表

// 建立資料表的 SQL 語句
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

// 初始化資料庫
export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(createTablesSQL, (err) => {
      if (err) {
        console.error('❌ 建立資料表失敗:', err.message);
        reject(err);
      } else {
        console.log('✅ 資料表建立成功');
        resolve();
      }
    });
  });
}

// 資料庫健康檢查
export function checkDatabaseHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    db.get('SELECT 1 as health', (err) => {
      if (err) {
        console.error('❌ 資料庫健康檢查失敗:', err.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// 優雅關閉資料庫連接
export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 等待所有查詢完成
    db.serialize(() => {
      db.close((err) => {
        if (err) {
          console.error('❌ 關閉資料庫失敗:', err.message);
          reject(err);
        } else {
          console.log('✅ 資料庫連接已關閉');
          resolve();
        }
      });
    });
  });
}

// 處理程序退出時的清理
process.on('SIGINT', async () => {
  console.log('🔄 收到 SIGINT 信號，正在關閉資料庫連接...');
  try {
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ 關閉資料庫時發生錯誤:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🔄 收到 SIGTERM 信號，正在關閉資料庫連接...');
  try {
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ 關閉資料庫時發生錯誤:', error);
    process.exit(1);
  }
});

// 匯出資料庫實例
export default db;
