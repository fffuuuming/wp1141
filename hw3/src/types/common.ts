// 過濾器類型
export type FilterType = 'unlimited' | 'limited';

// 時間槽介面
export interface TimeSlot {
  value: string;
  time: string;
}

// 分頁資訊介面
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// 工具類型
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 深度部分類型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 非空類型
export type NonNullable<T> = T extends null | undefined ? never : T;

// 函數類型
export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;
export type EventHandler<T = Event> = (event: T) => void;
