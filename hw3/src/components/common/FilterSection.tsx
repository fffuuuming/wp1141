import React, { memo, useCallback, useMemo } from 'react';
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Typography,
  Box
} from '@mui/material';
import type { FilterType } from '../../types';
import { WEEKDAYS, ADD_METHODS } from '../../constants';

interface FilterSectionProps {
  label: string;
  filterType: FilterType;
  onFilterChange: (value: FilterType) => void;
  showOptions?: boolean;
  options?: string[];
  optionType?: 'weekdays' | 'addMethods' | 'custom';
  selectedOptions?: string[];
  onOptionChange?: (option: string, checked: boolean) => void;
}

const FilterSection = memo<FilterSectionProps>(({
  label,
  filterType,
  onFilterChange,
  showOptions = false,
  options = [],
  optionType = 'custom',
  selectedOptions = [],
  onOptionChange
}) => {
  const getOptions = useCallback(() => {
    switch (optionType) {
      case 'weekdays':
        return WEEKDAYS;
      case 'addMethods':
        return ADD_METHODS;
      default:
        return options;
    }
  }, [optionType, options]);

  const availableOptions = useMemo(() => getOptions(), [getOptions]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e.target.value as FilterType);
  }, [onFilterChange]);

  const handleOptionChange = useCallback((option: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionChange?.(option, e.target.checked);
  }, [onOptionChange]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem' }}>{label}:</Typography>
      <FormControl component="fieldset" size="small">
        <RadioGroup
          row
          value={filterType}
          onChange={handleFilterChange}
          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
        >
          <FormControlLabel value="unlimited" control={<Radio size="small" />} label="不限" />
          <FormControlLabel value="limited" control={<Radio size="small" />} label="限定" />
        </RadioGroup>
      </FormControl>

      {showOptions && filterType === 'limited' && (
        <FormGroup row sx={{ ml: 2 }}>
          {availableOptions.map(option => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  size="small"
                  checked={selectedOptions.includes(option)}
                  onChange={handleOptionChange(option)}
                />
              }
              label={option}
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />
          ))}
        </FormGroup>
      )}
    </Box>
  );
});

FilterSection.displayName = 'FilterSection';

export { FilterSection };