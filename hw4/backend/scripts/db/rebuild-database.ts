/**
 * 重建資料庫
 * 刪除現有資料庫並根據最新的結構重新建立
 */

import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../database/locations.db');

async function rebuildDatabase(): Promise<void> {
  console.log('🔄 開始重建資料庫...\n');

  // 1. 刪除現有資料庫檔案
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      console.log('✅ 已刪除舊的資料庫檔案');
    } catch (err: any) {
      console.error('❌ 刪除資料庫檔案失敗:', err.message);
      throw err;
    }
  } else {
    console.log('ℹ️  資料庫檔案不存在，將建立新的資料庫');
  }

  // 2. 建立新的資料庫並創建表
  return new Promise((resolve, reject) => {
    const db = new Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 無法建立新資料庫:', err.message);
        reject(err);
        return;
      }

      console.log('✅ 已建立新的資料庫檔案');
      console.log('\n📋 開始建立資料表...\n');

      db.serialize(() => {
        // 建立 users 表
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('❌ 建立 users 表失敗:', err.message);
          } else {
            console.log('✅ users 表建立成功');
          }
        });

        // 建立 locations 表
        db.run(`
          CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            address TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            category TEXT,
            rating REAL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('❌ 建立 locations 表失敗:', err.message);
          } else {
            console.log('✅ locations 表建立成功');
          }
        });

        // 建立索引以提升查詢效能
        db.run(`
          CREATE INDEX IF NOT EXISTS idx_locations_user_id 
          ON locations(user_id)
        `, (err) => {
          if (err) {
            console.error('❌ 建立索引失敗:', err.message);
          } else {
            console.log('✅ 索引建立成功');
          }
        });

        // 關閉資料庫連接
        db.close((err) => {
          if (err) {
            console.error('❌ 關閉資料庫時發生錯誤:', err.message);
            reject(err);
          } else {
            console.log('\n✨ 資料庫重建完成！');
            console.log('📊 資料庫結構已更新，可以開始使用\n');
            resolve();
          }
        });
      });
    });
  });
}

// 執行重建
rebuildDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 發生錯誤:', error);
    process.exit(1);
  });

