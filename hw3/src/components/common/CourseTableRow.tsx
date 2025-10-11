import {
  TableCell,
  TableRow,
  Link,
  Box
} from '@mui/material';
import { formatTimeClassroom } from '../../utils/timeClassroomFormatter';
import type { CourseData } from '../../types';

interface CourseTableRowProps {
  course: CourseData;
  index: number;
  onTeacherClick?: (teacherName: string, courseName: string) => void;
  onAddToPlanned?: (course: CourseData) => void;
  showAddButton?: boolean;
}

export function CourseTableRow({ 
  course, 
  index, 
  onTeacherClick,
  onAddToPlanned,
  showAddButton = false 
}: CourseTableRowProps) {
  const courseNumber = `${course.dpt_abbr || ''}${course.cou_teacno || ''}`;
  
  const handleTeacherClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTeacherClick && course.tea_cname) {
      onTeacherClick(course.tea_cname, course.cou_cname || '未知課程');
    }
  };

  const handleAddToPlanned = () => {
    if (onAddToPlanned) {
      onAddToPlanned(course);
    }
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
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: 'blue',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'blue.dark'
              }
            }}
            onClick={handleAddToPlanned}
          >
            +
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
}
