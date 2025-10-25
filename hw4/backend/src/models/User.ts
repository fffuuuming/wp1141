import db from './database';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;  // 對應資料庫的 password_hash 欄位
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;  // 輸入的密碼，會被雜湊後存入 password_hash
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;  // 輸入的密碼，會被雜湊後存入 password_hash
}

export class UserModel {
  // 建立新使用者
  static async create(userData: CreateUserData): Promise<User> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `;
      
      db.run(sql, [userData.username, userData.email, userData.password], function(err) {
        if (err) {
          reject(err);
        } else {
          // 回傳新建立的使用者
          UserModel.findById(this.lastID)
            .then(user => resolve(user!))
            .catch(reject);
        }
      });
    });
  }

  // 根據 ID 查找使用者
  static async findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as User || null);
        }
      });
    });
  }

  // 根據 email 查找使用者
  static async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as User || null);
        }
      });
    });
  }

  // 根據 username 查找使用者
  static async findByUsername(username: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE username = ?';
      
      db.get(sql, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as User || null);
        }
      });
    });
  }

  // 根據 email 或 username 查找使用者（用於登入）
  static async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ? OR username = ?';
      
      db.get(sql, [emailOrUsername, emailOrUsername], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as User || null);
        }
      });
    });
  }

  // 更新使用者資料
  static async update(id: number, userData: UpdateUserData): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      if (userData.username !== undefined) {
        fields.push('username = ?');
        values.push(userData.username);
      }
      if (userData.email !== undefined) {
        fields.push('email = ?');
        values.push(userData.email);
      }
      if (userData.password !== undefined) {
        fields.push('password_hash = ?');
        values.push(userData.password);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null); // 沒有找到要更新的使用者
        } else {
          // 回傳更新後的使用者
          UserModel.findById(id)
            .then(user => resolve(user))
            .catch(reject);
        }
      });
    });
  }

  // 刪除使用者
  static async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM users WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // 檢查 email 是否已存在
  static async emailExists(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT 1 FROM users WHERE email = ? LIMIT 1';
      
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  // 檢查 username 是否已存在
  static async usernameExists(username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT 1 FROM users WHERE username = ? LIMIT 1';
      
      db.get(sql, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }
}
