import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  InputAdornment,
  FormGroup,
  Checkbox,
  Button,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon
} from '@mui/icons-material';

// 時間區間資料
const timeSlots = [
  { value: '0', time: '7:10~8:00' },
  { value: '1', time: '8:10~9:00' },
  { value: '2', time: '9:10~10:00' },
  { value: '3', time: '10:20~11:10' },
  { value: '4', time: '11:20~12:10' },
  { value: '5', time: '12:20~13:10' },
  { value: '6', time: '13:20~14:10' },
  { value: '7', time: '14:20~15:10' },
  { value: '8', time: '15:30~16:20' },
  { value: '9', time: '16:30~17:20' },
  { value: '10', time: '17:30~18:20' },
  { value: 'A', time: '18:25~19:15' },
  { value: 'B', time: '19:20~20:10' },
  { value: 'C', time: '20:15~21:05' },
  { value: 'D', time: '21:10~22:00' }
];

function QuickSearch() {
  // 狀態管理
  const [searchMethod, setSearchMethod] = useState('courseName');
  const [keyword, setKeyword] = useState('');
  const [timeFilter, setTimeFilter] = useState('unlimited');
  const [periodFilter, setPeriodFilter] = useState('unlimited');
  const [addMethodFilter, setAddMethodFilter] = useState('unlimited');
  const [pageSize, setPageSize] = useState(15);

  // 事件處理函數
  const handleSearchMethodChange = (event: any) => {
    setSearchMethod(event.target.value);
  };

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const handleTimeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTimeFilter(event.target.value);
  };

  const handlePeriodFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodFilter(event.target.value);
  };

  const handleAddMethodFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddMethodFilter(event.target.value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value));
  };

  const handleSearch = () => {
    console.log('快速搜尋:', { searchMethod, keyword, timeFilter, periodFilter, addMethodFilter });
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', mb: 2 }}>
          課程快速查詢
        </Typography>
        
        {/* 查詢方式選擇和關鍵字輸入 - 橫向排列 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>
            請選擇查詢方式:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={searchMethod}
              onChange={handleSearchMethodChange}
              displayEmpty
            >
              <MenuItem value="courseName">課程名稱</MenuItem>
              <MenuItem value="teacherName">教師姓名</MenuItem>
              <MenuItem value="courseCode">課號</MenuItem>
              <MenuItem value="serialNumber">流水號</MenuItem>
              <MenuItem value="courseId">課程識別碼</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>
            輸入關鍵字:
          </Typography>
          <TextField
            size="small"
            value={keyword}
            onChange={handleKeywordChange}
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

        {/* 過濾器區域 - 直向排列 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          
          {/* 上課時間過濾器 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>上課時間:</Typography>
            <FormControl component="fieldset" size="small">
              <RadioGroup 
                row 
                value={timeFilter} 
                onChange={handleTimeFilterChange}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
              >
                <FormControlLabel value="unlimited" control={<Radio size="small" />} label="不限" />
                <FormControlLabel value="limited" control={<Radio size="small" />} label="限定" />
              </RadioGroup>
            </FormControl>
            
            {timeFilter === 'limited' && (
              <FormGroup row sx={{ ml: 2 }}>
                {['週一', '週二', '週三', '週四', '週五', '週六'].map(day => (
                  <FormControlLabel
                    key={day}
                    control={<Checkbox size="small" />}
                    label={day}
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                  />
                ))}
              </FormGroup>
            )}
          </Box>

          {/* 節次過濾器 */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem', mt: 0.5 }}>節次:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControl component="fieldset" size="small">
                <RadioGroup 
                  row 
                  value={periodFilter} 
                  onChange={handlePeriodFilterChange}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                >
                  <FormControlLabel value="unlimited" control={<Radio size="small" />} label="不限" />
                  <FormControlLabel value="limited" control={<Radio size="small" />} label="限定" />
                </RadioGroup>
              </FormControl>
              
              {periodFilter === 'limited' && (
                <FormGroup row sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {timeSlots.map(slot => (
                    <FormControlLabel
                      key={slot.value}
                      control={<Checkbox size="small" />}
                      label={`${slot.value} ${slot.time}`}
                      sx={{ 
                        '& .MuiFormControlLabel-label': { fontSize: '0.7rem' },
                        margin: 0,
                        marginRight: 1
                      }}
                    />
                  ))}
                </FormGroup>
              )}
            </Box>
          </Box>

          {/* 加選方式過濾器 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>加選方式:</Typography>
            <FormControl component="fieldset" size="small">
              <RadioGroup 
                row 
                value={addMethodFilter} 
                onChange={handleAddMethodFilterChange}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
              >
                <FormControlLabel value="unlimited" control={<Radio size="small" />} label="不限" />
                <FormControlLabel value="limited" control={<Radio size="small" />} label="限定" />
              </RadioGroup>
            </FormControl>
            
            {addMethodFilter === 'limited' && (
              <FormGroup row sx={{ ml: 2 }}>
                <FormControlLabel 
                  control={<Checkbox size="small" />} 
                  label="第1類" 
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                />
                <FormControlLabel 
                  control={<Checkbox size="small" />} 
                  label="第2類" 
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                />
                <FormControlLabel 
                  control={<Checkbox size="small" />} 
                  label="第3類" 
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                />
              </FormGroup>
            )}
          </Box>
        </Box>

        {/* 查詢控制 - 右下角 */}
        <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end">
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>每頁顯示筆數:</Typography>
          <TextField
            type="number"
            value={pageSize}
            onChange={handlePageSizeChange}
            size="small"
            sx={{ width: 60 }}
            inputProps={{ style: { fontSize: '0.8rem' } }}
          />
          <Button variant="contained" onClick={handleSearch} size="small">
            查詢
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default QuickSearch;
