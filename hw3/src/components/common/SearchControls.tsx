import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { SearchMethod } from '../../types';
import { SEARCH_METHOD_OPTIONS } from '../../constants';

interface SearchControlsProps {
  searchMethod: SearchMethod;
  keyword: string;
  pageSize: number;
  onSearchMethodChange: (method: SearchMethod) => void;
  onKeywordChange: (keyword: string) => void;
  onPageSizeChange: (size: number) => void;
  onSearch: () => void;
}

export function SearchControls({
  searchMethod,
  keyword,
  onSearchMethodChange,
  onKeywordChange,
  onSearch
}: Omit<SearchControlsProps, 'pageSize' | 'onPageSizeChange'>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>
        請選擇查詢方式:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={searchMethod}
          onChange={(e) => onSearchMethodChange(e.target.value as SearchMethod)}
          displayEmpty
        >
          {SEARCH_METHOD_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>
        輸入關鍵字:
      </Typography>
      <TextField
        size="small"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch();
          }
        }}
        sx={{ flex: 1, maxWidth: 300 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

interface SearchFooterProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onSearch: () => void;
}

export function SearchFooter({ pageSize, onPageSizeChange, onSearch }: SearchFooterProps) {
  return (
    <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end">
      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>每頁顯示筆數:</Typography>
      <TextField
        type="number"
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        size="small"
        sx={{ width: 60 }}
        inputProps={{ style: { fontSize: '0.8rem' } }}
      />
      <Button variant="contained" onClick={onSearch} size="small">
        查詢
      </Button>
    </Box>
  );
}
