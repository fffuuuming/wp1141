import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import { useQuickSearch } from '../../hooks';
import { SearchControls, SearchFooter, FilterSection, TimeSlotFilter } from '../common';

export function QuickSearchForm() {
  const {
    searchState,
    handleSearchMethodChange,
    handleKeywordChange,
    handleFilterChange,
    performSearch
  } = useQuickSearch();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', mb: 2 }}>
          課程快速查詢
        </Typography>
        
        {/* 查詢方式選擇和關鍵字輸入 */}
        <SearchControls
          searchMethod={searchState.searchMethod}
          keyword={searchState.keyword}
          onSearchMethodChange={handleSearchMethodChange}
          onKeywordChange={handleKeywordChange}
        />

        {/* 過濾器區域 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {/* 上課時間過濾器 */}
          <FilterSection
            label="上課時間"
            filterType={searchState.filters.timeFilter}
            onFilterChange={(value: any) => handleFilterChange('timeFilter', value)}
            showOptions={true}
            optionType="weekdays"
          />

          {/* 節次過濾器 */}
          <TimeSlotFilter
            filterType={searchState.filters.periodFilter}
            onFilterChange={(value: any) => handleFilterChange('periodFilter', value)}
          />

          {/* 加選方式過濾器 */}
          <FilterSection
            label="加選方式"
            filterType={searchState.filters.addMethodFilter}
            onFilterChange={(value: any) => handleFilterChange('addMethodFilter', value)}
            showOptions={true}
            optionType="addMethods"
          />
        </Box>

        {/* 查詢控制 */}
        <SearchFooter
          pageSize={searchState.filters.pageSize}
          onPageSizeChange={(size: number) => handleFilterChange('pageSize', size)}
          onSearch={performSearch}
        />
      </CardContent>
    </Card>
  );
}
