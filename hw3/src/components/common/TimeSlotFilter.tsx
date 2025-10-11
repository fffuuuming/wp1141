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
import { TIME_SLOTS } from '../../constants';

interface TimeSlotFilterProps {
  filterType: FilterType;
  onFilterChange: (value: FilterType) => void;
}

export function TimeSlotFilter({ filterType, onFilterChange }: TimeSlotFilterProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 'fit-content', fontSize: '0.875rem', mt: 0.5 }}>
        節次:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControl component="fieldset" size="small">
          <RadioGroup 
            row 
            value={filterType} 
            onChange={(e) => onFilterChange(e.target.value as FilterType)}
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
          >
            <FormControlLabel value="unlimited" control={<Radio size="small" />} label="不限" />
            <FormControlLabel value="limited" control={<Radio size="small" />} label="限定" />
          </RadioGroup>
        </FormControl>
        
        {filterType === 'limited' && (
          <FormGroup row sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {TIME_SLOTS.map(slot => (
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
  );
}
