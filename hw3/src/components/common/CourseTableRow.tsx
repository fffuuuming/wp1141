import React, { memo, useCallback } from 'react';
import {
  TableCell,
  TableRow,
  Link,
  Box,
  Button
} from '@mui/material';
import { formatTimeClassroom } from '../../utils/timeClassroomFormatter';
import { DEPARTMENT_OPTIONS } from '../../constants/course';
import type { CourseData } from '../../types';

interface CourseTableRowProps {
  course: CourseData;
  index: number;
  onTeacherClick?: (teacherName: string, courseName: string) => void;
  onAddToPlanned?: (course: CourseData) => void;
  showAddButton?: boolean;
}

const CourseTableRow = memo<CourseTableRowProps>(({ 
  course, 
  index, 
  onTeacherClick,
  onAddToPlanned,
  showAddButton = false
}) => {
  const courseNumber = `${course.dpt_abbr || ''}${course.cou_teacno || ''}`;
  
  const handleTeacherClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onTeacherClick && course.tea_cname) {
      onTeacherClick(course.tea_cname, course.cou_cname || '未知課程');
    }
  }, [onTeacherClick, course.tea_cname, course.cou_cname]);

  const handleAddToPlanned = useCallback(() => {
    if (onAddToPlanned) {
      onAddToPlanned(course);
    }
  }, [onAddToPlanned, course]);
  
  return (
    <TableRow key={`${course.cou_code}-${index}`}>
      <TableCell>{course.ser_no || ''}</TableCell>
      <TableCell>{DEPARTMENT_OPTIONS[course.dpt_code || ''] || course.dpt_code || ''}</TableCell>
      <TableCell>{courseNumber}</TableCell>
      <TableCell>{course.class || ''}</TableCell>
      <TableCell sx={{ color: 'primary.main', cursor: 'pointer' }}>
        {course.cou_cname || ''}
      </TableCell>
      <TableCell>{course.credit || ''}</TableCell>
      <TableCell>{course.cou_code || ''}</TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell>
        {course.tea_cname && course.tea_cname.trim() !== '' ? (
          <Link
            href="#"
            onClick={handleTeacherClick}
            sx={{ 
              color: 'primary.main', 
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.dark'
              }
            }}
          >
            {course.tea_cname}
          </Link>
        ) : (
          ''
        )}
      </TableCell>
      <TableCell>{course.co_select || ''}</TableCell>
      <TableCell>{formatTimeClassroom(course)}</TableCell>
      <TableCell>{course.tno || ''}</TableCell>
      <TableCell></TableCell>
      <TableCell>{course.mark || ''}</TableCell>
      <TableCell>
        <Box 
          sx={{ 
            width: 20, 
            height: 20, 
            backgroundColor: 'green', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}
        >
          C
        </Box>
      </TableCell>
      <TableCell>
        {showAddButton && (
          <Button
            variant="contained"
            size="small"
            onClick={handleAddToPlanned}
            sx={{
              fontSize: '0.75rem',
              textTransform: 'none',
              px: 1,
              py: 0.5,
              minWidth: 'auto'
            }}
          >
            加入
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
});

CourseTableRow.displayName = 'CourseTableRow';

export { CourseTableRow };
