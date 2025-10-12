import {
  TableCell,
  TableRow,
  Link,
  Box,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { formatTimeClassroom } from '../../utils/timeClassroomFormatter';
import type { CourseData } from '../../types';
import { useState } from 'react';

interface CourseTableRowProps {
  course: CourseData;
  index: number;
  onTeacherClick?: (teacherName: string, courseName: string) => void;
  onAddToPlanned?: (course: CourseData) => void;
  showAddButton?: boolean;
  isCourseInPlanned?: boolean;
}

export function CourseTableRow({ 
  course, 
  index, 
  onTeacherClick,
  onAddToPlanned,
  showAddButton = false,
  isCourseInPlanned = false
}: CourseTableRowProps) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning'>('success');
  
  const courseNumber = `${course.dpt_abbr || ''}${course.cou_teacno || ''}`;
  
  const handleTeacherClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTeacherClick && course.tea_cname) {
      onTeacherClick(course.tea_cname, course.cou_cname || '未知課程');
    }
  };

  const handleAddToPlanned = () => {
    if (isCourseInPlanned) {
      setSnackbarMessage('此課程已經選擇');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    } else {
      if (onAddToPlanned) {
        onAddToPlanned(course);
        setSnackbarMessage('已加入課程');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <TableRow key={`${course.cou_code}-${index}`}>
      <TableCell>{course.ser_no || ''}</TableCell>
      <TableCell></TableCell>
      <TableCell>{courseNumber}</TableCell>
      <TableCell>{course.class || ''}</TableCell>
      <TableCell sx={{ color: 'primary.main', cursor: 'pointer' }}>
        {course.cou_cname || ''}
      </TableCell>
      <TableCell></TableCell>
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
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </TableRow>
  );
}
