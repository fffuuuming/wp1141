// 分頁資訊介面
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// 分頁配置介面
export interface PaginationConfig {
  defaultPageSize: number;
  pageSizeOptions: number[];
  maxVisiblePages: number;
}

// 分頁狀態介面
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isLoading: boolean;
}
