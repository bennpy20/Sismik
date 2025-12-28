
import { AppData, Course, GradeRecord, Schedule, Notification } from '../types';

const STORAGE_KEY = 'edutrack_pro_data_v4';

const initialData: AppData = {
  courses: [],
  grades: [],
  schedules: [],
  semesters: [1, 2, 3, 4, 5, 6, 7, 8, 101, 102, 103],
  notifications: []
};

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  const data: AppData = JSON.parse(stored);

  // 🔥 AUTO-MIGRATION SEMESTER ANTARA
  const requiredSemesters = [101, 102, 103];
  let changed = false;

  requiredSemesters.forEach(s => {
    if (!data.semesters.includes(s)) {
      data.semesters.push(s);
      changed = true;
    }
  });

  if (changed) {
    data.semesters.sort((a, b) => a - b);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return data;
};


export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const notify = (message: string, type: Notification['type'] = 'info') => {
  const data = loadData();
  data.notifications.unshift({
    id: crypto.randomUUID(),
    message,
    type,
    timestamp: Date.now(),
    isRead: false
  });
  if (data.notifications.length > 30) data.notifications.pop();
  saveData(data);
};

export const markAllNotificationsRead = () => {
  const data = loadData();
  data.notifications = data.notifications.map(n => ({ ...n, isRead: true }));
  saveData(data);
};

export const markNotificationRead = (id: string) => {
  const data = loadData();
  data.notifications = data.notifications.map(n => 
    n.id === id ? { ...n, isRead: true } : n
  );
  saveData(data);
};

export const addSemester = (num: number) => {
  const data = loadData();
  if (!data.semesters.includes(num)) {
    data.semesters.push(num);
    data.semesters.sort((a, b) => a - b);
    saveData(data);
    notify(`Semester ${num} berhasil ditambahkan.`, 'success');
    return true;
  }
  return false;
};

export const addSemesterAntara = () => {
  const data = loadData();
  const antaraCount = data.semesters.filter(s => s >= 100).length;
  const nextAntara = 100 + antaraCount + 1;

  if (!data.semesters.includes(nextAntara)) {
    data.semesters.push(nextAntara);
    data.semesters.sort((a, b) => a - b);
    saveData(data);
    notify(`Semester Antara ${nextAntara - 100} berhasil ditambahkan.`, 'success');
  }
};


export const addCourse = (course: Course) => {
  const data = loadData();
  data.courses.push(course);
  saveData(data);
  notify(`Mata kuliah ${course.name} berhasil ditambahkan.`, 'success');
};

export const updateCourse = (updated: Course) => {
  const data = loadData();
  data.courses = data.courses.map(c => c.id === updated.id ? updated : c);
  saveData(data);
  notify(`Mata kuliah ${updated.name} berhasil diperbarui.`, 'info');
};

export const deleteCourse = (id: string) => {
  const data = loadData();
  const course = data.courses.find(c => c.id === id);
  if (!course) return;
  data.courses = data.courses.filter(c => c.id !== id);
  data.grades = data.grades.filter(g => g.courseId !== id);
  data.schedules = data.schedules.filter(s => s.courseId !== id);
  saveData(data);
  notify(`Mata kuliah ${course.name} telah dihapus.`, 'warning');
};

export const addGrade = (grade: GradeRecord) => {
  const data = loadData();
  data.grades.push(grade);
  saveData(data);
  notify(`Nilai mata kuliah berhasil disimpan.`, 'success');
};

export const updateGrade = (updated: GradeRecord) => {
  const data = loadData();
  data.grades = data.grades.map(g => g.id === updated.id ? updated : g);
  saveData(data);
  notify(`Nilai mata kuliah berhasil diperbarui.`, 'info');
};

export const deleteGrade = (id: string) => {
  const data = loadData();
  data.grades = data.grades.filter(g => g.id !== id);
  saveData(data);
  notify(`Nilai mata kuliah telah dihapus.`, 'warning');
};

export const addSchedule = (schedule: Schedule) => {
  const data = loadData();
  data.schedules.push(schedule);
  saveData(data);
  notify(`Jadwal kuliah baru berhasil ditambahkan.`, 'success');
};

export const updateSchedule = (updated: Schedule) => {
  const data = loadData();
  data.schedules = data.schedules.map(s => s.id === updated.id ? updated : s);
  saveData(data);
  notify(`Jadwal kuliah berhasil diperbarui.`, 'info');
};

export const deleteSchedule = (id: string) => {
  const data = loadData();
  data.schedules = data.schedules.filter(s => s.id !== id);
  saveData(data);
  notify(`Jadwal kuliah telah dihapus.`, 'warning');
};
