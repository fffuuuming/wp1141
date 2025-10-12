import { PlannedCoursesTable } from './PlannedCoursesTable';
import type { PlannedCourse } from '../../types';

interface PlannedCoursesPageProps {
  plannedCourses: PlannedCourse[];
  isLoading: boolean;
  onRemoveCourse: (courseId: string) => void;
  onRemoveAllCourses: () => void;
  onTeacherClick?: (teacherName: string, courseName: string) => void;
}

export function PlannedCoursesPage({
  plannedCourses,
  isLoading,
  onRemoveCourse,
  onRemoveAllCourses,
  onTeacherClick
}: PlannedCoursesPageProps) {
  return (
    <PlannedCoursesTable
      plannedCourses={plannedCourses}
      isLoading={isLoading}
      onRemoveCourse={onRemoveCourse}
      onRemoveAllCourses={onRemoveAllCourses}
      onTeacherClick={onTeacherClick}
    />
  );
}
