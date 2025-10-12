import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem
} from '@mui/material';
import { useDepartmentSearch } from '../../hooks';
import { SearchFooter, FilterSection, TimeSlotFilter } from '../common';
import { COLLEGE_OPTIONS, DEPARTMENT_OPTIONS, COURSE_TYPE_OPTIONS } from '../../constants';

export function DepartmentSearchForm() {
  const {
    searchState,
    handleCollegeChange,
    handleDepartmentChange,
    handleRequirementTypeChange,
    handleFilterChange,
    performSearch
  } = useDepartmentSearch();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', mb: 2 }}>
          系所課程查詢
        </Typography>
        
        {/* 開課學院和系所選擇 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>
            開課學院:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={searchState.college}
              onChange={(e: any) => handleCollegeChange(e.target.value)}
              displayEmpty
            >
              {COLLEGE_OPTIONS.map(college => (
                <MenuItem key={college.code} value={college.code}>
                  {college.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>
            開課系所:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={searchState.department}
              onChange={(e: any) => handleDepartmentChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">全部</MenuItem>
              {Object.entries(DEPARTMENT_OPTIONS).map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {code} {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 必修/選修選擇 */}
          <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>
            課程類型:
          </Typography>
          <FormControl component="fieldset" size="small">
            <RadioGroup 
              row 
              value={searchState.requirementType} 
              onChange={(e: any) => handleRequirementTypeChange(e.target.value)}
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
            >
              {COURSE_TYPE_OPTIONS.map(option => (
                <FormControlLabel 
                  key={option.value}
                  value={option.value} 
                  control={<Radio size="small" />} 
                  label={option.label} 
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

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
