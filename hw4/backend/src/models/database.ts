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
  } else {
    console.log('✅ SQLite 資料庫連接成功');
  }
});

// 啟用外鍵約束
db.run('PRAGMA foreign_keys = ON');

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

// 關閉資料庫連接
export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
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
}

// 匯出資料庫實例
export default db;
