/**
 * 清除所有資料庫資料
 * 保留資料庫結構，只刪除所有記錄
 */

import { Database } from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database/locations.db');

async function clearAllData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = new Database(dbPath, (err) => {
      if (err) {
        console.error('❌ 無法連接資料庫:', err.message);
        reject(err);
        return;
      }

      console.log('🔗 已連接到資料庫');

      // 開始事務
      db.serialize(() => {
        console.log('\n🗑️  開始清除所有資料...\n');

        // 清除 locations 表
        db.run('DELETE FROM locations', function(err) {
          if (err) {
            console.error('❌ 清除 locations 表失敗:', err.message);
          } else {
            console.log(`✅ 已清除 ${this.changes} 筆地點資料`);
          }
        });

        // 清除 users 表
        db.run('DELETE FROM users', function(err) {
          if (err) {
            console.error('❌ 清除 users 表失敗:', err.message);
          } else {
            console.log(`✅ 已清除 ${this.changes} 筆使用者資料`);
          }
        });

        // 重置自動遞增計數器
        db.run('DELETE FROM sqlite_sequence', function(err) {
          if (err) {
            console.error('❌ 重置自動遞增計數器失敗:', err.message);
          } else {
            console.log('✅ 已重置自動遞增計數器');
          }
        });

        // 關閉資料庫連接
        db.close((err) => {
          if (err) {
            console.error('❌ 關閉資料庫時發生錯誤:', err.message);
            reject(err);
          } else {
            console.log('\n✨ 資料清除完成！');
            console.log('📊 資料庫結構保持不變，所有資料已清空\n');
            resolve();
          }
        });
      });
    });
  });
}

// 執行清除
clearAllData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 發生錯誤:', error);
    process.exit(1);
  });

