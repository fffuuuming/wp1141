import { PlannedCoursesTable } from './PlannedCoursesTable';
import type { PlannedCourse } from '../../types';

interface PlannedCoursesPageProps {
  plannedCourses: PlannedCourse[];
  isLoading: boolean;
  onRemoveCourse: (courseId: string) => void;
  onTeacherClick?: (teacherName: string, courseName: string) => void;
}

export function PlannedCoursesPage({
  plannedCourses,
  isLoading,
  onRemoveCourse,
  onTeacherClick
}: PlannedCoursesPageProps) {
  return (
    <PlannedCoursesTable
      plannedCourses={plannedCourses}
      isLoading={isLoading}
      onRemoveCourse={onRemoveCourse}
      onTeacherClick={onTeacherClick}
    />
  );
}
