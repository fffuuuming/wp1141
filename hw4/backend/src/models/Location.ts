import db from './database';

export interface Location {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  category?: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationData {
  user_id: number;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  category?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateLocationData {
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  rating?: number;
  notes?: string;
}

export interface LocationFilters {
  category?: string;
  minRating?: number;
  maxRating?: number;
  search?: string;
}

export class LocationModel {
  // 建立新地點
  static async create(locationData: CreateLocationData): Promise<Location> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO locations (user_id, name, description, address, latitude, longitude, category, rating, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        locationData.user_id,
        locationData.name,
        locationData.description || null,
        locationData.address || null,
        locationData.latitude,
        locationData.longitude,
        locationData.category || null,
        locationData.rating || null,
        locationData.notes || null
      ];
      
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          // 回傳新建立的地點
          LocationModel.findById(this.lastID)
            .then(location => resolve(location!))
            .catch(reject);
        }
      });
    });
  }

  // 根據 ID 查找地點
  static async findById(id: number): Promise<Location | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM locations WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as Location || null);
        }
      });
    });
  }

  // 根據使用者 ID 查找所有地點
  static async findByUserId(userId: number, filters?: LocationFilters): Promise<Location[]> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM locations WHERE user_id = ?';
      const values: any[] = [userId];
      
      // 添加篩選條件
      if (filters) {
        if (filters.category) {
          sql += ' AND category = ?';
          values.push(filters.category);
        }
        
        if (filters.minRating !== undefined) {
          sql += ' AND rating >= ?';
          values.push(filters.minRating);
        }
        
        if (filters.maxRating !== undefined) {
          sql += ' AND rating <= ?';
          values.push(filters.maxRating);
        }
        
        if (filters.search) {
          sql += ' AND (name LIKE ? OR description LIKE ? OR address LIKE ?)';
          const searchTerm = `%${filters.search}%`;
          values.push(searchTerm, searchTerm, searchTerm);
        }
      }
      
      sql += ' ORDER BY created_at DESC';
      
      db.all(sql, values, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Location[]);
        }
      });
    });
  }

  // 更新地點資料
  static async update(id: number, locationData: UpdateLocationData): Promise<Location | null> {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      if (locationData.name !== undefined) {
        fields.push('name = ?');
        values.push(locationData.name);
      }
      if (locationData.description !== undefined) {
        fields.push('description = ?');
        values.push(locationData.description);
      }
      if (locationData.address !== undefined) {
        fields.push('address = ?');
        values.push(locationData.address);
      }
      if (locationData.latitude !== undefined) {
        fields.push('latitude = ?');
        values.push(locationData.latitude);
      }
      if (locationData.longitude !== undefined) {
        fields.push('longitude = ?');
        values.push(locationData.longitude);
      }
      if (locationData.category !== undefined) {
        fields.push('category = ?');
        values.push(locationData.category);
      }
      if (locationData.rating !== undefined) {
        fields.push('rating = ?');
        values.push(locationData.rating);
      }
      if (locationData.notes !== undefined) {
        fields.push('notes = ?');
        values.push(locationData.notes);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const sql = `UPDATE locations SET ${fields.join(', ')} WHERE id = ?`;
      
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null); // 沒有找到要更新的地點
        } else {
          // 回傳更新後的地點
          LocationModel.findById(id)
            .then(location => resolve(location))
            .catch(reject);
        }
      });
    });
  }

  // 刪除地點
  static async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM locations WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // 檢查地點是否屬於特定使用者
  static async belongsToUser(id: number, userId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT 1 FROM locations WHERE id = ? AND user_id = ? LIMIT 1';
      
      db.get(sql, [id, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  // 取得所有分類
  static async getCategories(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT DISTINCT category FROM locations WHERE category IS NOT NULL ORDER BY category';
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map((row: any) => row.category));
        }
      });
    });
  }

  // 統計資料
  static async getStats(userId: number): Promise<{
    total: number;
    byCategory: { [key: string]: number };
    averageRating: number;
  }> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total,
          category,
          AVG(rating) as averageRating
        FROM locations 
        WHERE user_id = ? AND rating IS NOT NULL
        GROUP BY category
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const stats = {
            total: 0,
            byCategory: {} as { [key: string]: number },
            averageRating: 0
          };
          
          let totalRating = 0;
          let ratingCount = 0;
          
          rows.forEach((row: any) => {
            stats.total += row.total;
            if (row.category) {
              stats.byCategory[row.category] = row.total;
            }
            if (row.averageRating) {
              totalRating += row.averageRating * row.total;
              ratingCount += row.total;
            }
          });
          
          stats.averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
          
          resolve(stats);
        }
      });
    });
  }
}
