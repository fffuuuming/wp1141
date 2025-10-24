/**
 * 顯示資料庫資訊
 * 查看當前資料庫的統計資訊
 */

import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../database/locations.db');

async function showDatabaseInfo(): Promise<void> {
  // 檢查資料庫檔案是否存在
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 資料庫檔案不存在');
    console.log('💡 請先執行 npm run init-db 建立資料庫\n');
    return;
  }

  return new Promise((resolve, reject) => {
    const db = new Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 無法連接資料庫:', err.message);
        reject(err);
        return;
      }

      console.log('📊 資料庫資訊\n');
      console.log('━'.repeat(50));

      db.serialize(() => {
        // 獲取檔案大小
        const stats = fs.statSync(dbPath);
        const fileSizeInBytes = stats.size;
        const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
        console.log(`📁 檔案位置: ${dbPath}`);
        console.log(`💾 檔案大小: ${fileSizeInKB} KB`);
        console.log('━'.repeat(50));

        // 查詢 users 表
        db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
          if (err) {
            console.error('❌ 查詢 users 表失敗:', err.message);
          } else {
            console.log(`\n👤 使用者資料:`);
            console.log(`   總數: ${row.count} 筆`);
          }
        });

        // 查詢 locations 表
        db.get('SELECT COUNT(*) as count FROM locations', (err, row: any) => {
          if (err) {
            console.error('❌ 查詢 locations 表失敗:', err.message);
          } else {
            console.log(`\n📍 地點資料:`);
            console.log(`   總數: ${row.count} 筆`);
          }
        });

        // 查詢最近的資料
        db.get(`
          SELECT 
            u.username,
            COUNT(l.id) as location_count
          FROM users u
          LEFT JOIN locations l ON u.id = l.user_id
          GROUP BY u.id
          ORDER BY u.created_at DESC
          LIMIT 1
        `, (err, row: any) => {
          if (err) {
            console.error('❌ 查詢最近使用者失敗:', err.message);
          } else if (row) {
            console.log(`\n👥 最近的使用者:`);
            console.log(`   使用者名稱: ${row.username}`);
            console.log(`   地點數量: ${row.location_count} 個`);
          }
        });

        // 查詢資料表結構
        db.all(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `, (err, tables: any[]) => {
          if (err) {
            console.error('❌ 查詢資料表失敗:', err.message);
          } else {
            console.log(`\n📋 資料表:`);
            tables.forEach(table => {
              console.log(`   - ${table.name}`);
            });
          }

          console.log('\n' + '━'.repeat(50) + '\n');

          // 關閉資料庫連接
          db.close((err) => {
            if (err) {
              console.error('❌ 關閉資料庫時發生錯誤:', err.message);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });
    });
  });
}

// 執行顯示
showDatabaseInfo()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 發生錯誤:', error);
    process.exit(1);
  });

