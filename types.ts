
export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E';
export type CourseType = 'Wajib' | 'Pilihan';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'local' | 'google';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  type: CourseType;
}

export interface GradeComponent {
  score: number;
  weight: number;
}

export interface GradeRecord {
  id: string;
  courseId: string;
  semester: number;
  uts: GradeComponent;
  uas: GradeComponent;
  kat: GradeComponent;
}

export interface Schedule {
  id: string;
  courseId: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  startTime: string;
  endTime: string;
  room: string;
  lecturer: string;
  semester: number;
  className: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: number;
  isRead: boolean;
}

export interface AppData {
  courses: Course[];
  grades: GradeRecord[];
  schedules: Schedule[];
  semesters: number[];
  notifications: Notification[];
}

export interface SemesterSummary {
  semester: number;
  gpa: number;
  totalCredits: number;
}
