import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * 雜湊密碼
 * @param password 明文密碼
 * @returns 雜湊後的密碼
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 驗證密碼
 * @param password 明文密碼
 * @param hashedPassword 雜湊後的密碼
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
