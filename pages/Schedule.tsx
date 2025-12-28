
import React, { useState } from 'react';
import { loadData, addSchedule, deleteSchedule, updateSchedule } from '../services/storage';
import { AppData, Schedule } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { IconEdit, IconTrash, IconPlus, IconLecturer, IconClose } from '../components/Icons';

const SchedulePage: React.FC = () => {
  const [data, setData] = useState<AppData>(loadData());
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [activeSemester, setActiveSemester] = useState(data.semesters[0] || 1);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Schedule, 'id'>>({
    courseId: '',
    day: 'Senin',
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    lecturer: '',
    semester: 1,
    className: 'A'
  });

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const semesterCourses = data.courses.filter(c => c.semester === activeSemester);

  const canAddSchedule = semesterCourses.length > 0;

  const handleOpenModal = (sched?: Schedule) => {
    if (sched) {
      setEditingSchedule(sched);
      setForm({ ...sched });
    } else {
      setEditingSchedule(null);
      setForm({
        courseId: semesterCourses[0]?.id || '',
        day: 'Senin',
        startTime: '08:00',
        endTime: '10:00',
        room: '',
        lecturer: '',
        semester: activeSemester,
        className: 'A'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = timeToMinutes(form.startTime);
    const end = timeToMinutes(form.endTime);

    if (start >= end) {
      setValidationError("Kesalahan jam kuliah. Pastikan waktu mulai lebih awal daripada waktu selesai.");
      return;
    }

    const hasConflict = data.schedules.some(s => {
      if (editingSchedule && s.id === editingSchedule.id) return false;
      if (s.day !== form.day || s.semester !== activeSemester) return false;
      const existingStart = timeToMinutes(s.startTime);
      const existingEnd = timeToMinutes(s.endTime);
      return start < existingEnd && existingStart < end;
    });

    if (hasConflict) {
      const conflictingCourse = data.schedules.find(s => {
        if (editingSchedule && s.id === editingSchedule.id) return false;
        if (s.day !== form.day || s.semester !== activeSemester) return false;
        const existingStart = timeToMinutes(s.startTime);
        const existingEnd = timeToMinutes(s.endTime);
        return start < existingEnd && existingStart < end;
      });
      const courseInfo = data.courses.find(c => c.id === conflictingCourse?.courseId);
      setValidationError(`Jadwal Bentrok! Rentang waktu tersebut sudah digunakan untuk mata kuliah: ${courseInfo?.name || 'Mata Kuliah Lain'}.`);
      return;
    }

    if (editingSchedule) {
      updateSchedule({ ...editingSchedule, ...form });
    } else {
      addSchedule({ id: crypto.randomUUID(), ...form });
    }
    setData(loadData());
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (scheduleToDelete) {
      deleteSchedule(scheduleToDelete);
      setData(loadData());
      setScheduleToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Jadwal Perkuliahan</h2>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            disabled={!canAddSchedule}
            className={`bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-bold shadow-sm text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            title={!canAddSchedule ? "Tambahkan mata kuliah terlebih dahulu" : "Tambah Jadwal"}
          >
            <IconPlus className="w-4 h-4" /> Tambah Jadwal
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Semester:</label>
          <div className="flex flex-col gap-1">
            <select 
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white min-w-[160px] cursor-pointer"
              value={activeSemester}
              onChange={(e) => setActiveSemester(parseInt(e.target.value))}
            >
              {data.semesters.map(s => 
              <option key={s} value={s}>
                {s >= 100 ? `Semester Antara ${s - 100}` : `Semester ${s}`}
              </option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS_OF_WEEK.map(day => {
            const sessions = data.schedules.filter(s => s.day === day && s.semester === activeSemester).sort((a,b) => a.startTime.localeCompare(b.startTime));
            return (
              <div key={day} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
                <h3 className="font-black text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3 mb-4 uppercase text-[10px] tracking-widest">{day}</h3>
                <div className="space-y-3">
                  {sessions.length > 0 ? sessions.map(s => {
                    const course = data.courses.find(c => c.id === s.courseId);
                    return (
                      <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 group relative transition-all">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase">{s.startTime} - {s.endTime}</p>
                            <h4 className="font-bold text-sm leading-tight mt-1 dark:text-white truncate">{course?.name}</h4>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="text-[9px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-sm font-black uppercase tracking-tighter">Kelas {s.className}</span>
                              <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-sm font-black tracking-tighter">Lab {s.room}</span>
                            </div>
                            <p className="text-[9px] mt-2 text-slate-400 font-bold truncate flex items-center gap-1">
                              <IconLecturer className="w-3 h-3" />
                              <span>{s.lecturer}</span>
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(s)} 
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded-md transition-all cursor-pointer"
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setScheduleToDelete(s.id)} 
                              className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }) : <p className="text-slate-300 dark:text-slate-700 text-[9px] font-bold uppercase italic py-4 text-center tracking-widest">Tidak ada jadwal kuliah hari ini</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Error Modal - High Z-Index & Full Coverage */}
      {validationError && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
            <h3 className="text-xl font-bold text-center dark:text-white mb-2 tracking-tight">Perhatian Jadwal</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {validationError}
            </p>
            <button 
              onClick={() => setValidationError(null)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - High Z-Index & Full Coverage */}
      {scheduleToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
            <h3 className="text-xl font-bold text-center dark:text-white mb-2 tracking-tight">Hapus Jadwal?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Jadwal untuk mata kuliah ini akan dihapus secara permanen. Apakah Anda yakin?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setScheduleToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Modal - High Z-Index & Full Coverage */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold dark:text-white">{editingSchedule ? 'Edit' : 'Tambah'} Jadwal Perkuliahan</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <IconClose className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mata Kuliah</label>
                <select 
                  required 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 dark:text-white text-sm cursor-pointer" 
                  value={form.courseId} 
                  onChange={e => setForm({...form, courseId: e.target.value})}
                  disabled={!!editingSchedule}
                >
                  {editingSchedule ? (
                    <option value={form.courseId}>{data.courses.find(c => c.id === form.courseId)?.name}</option>
                  ) : (
                    semesterCourses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hari</label>
                    <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm cursor-pointer" value={form.day} onChange={e => setForm({...form, day: e.target.value as any})}>
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kelas</label>
                    <input placeholder="A, B, ..." className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.className} onChange={e => setForm({...form, className: e.target.value})} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mulai</label>
                    <input type="time" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Selesai</label>
                    <input type="time" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
                  </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ruangan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px] tracking-wider">Lab</span>
                  <input required className="w-full pl-16 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 dark:text-white text-sm" value={form.room} onChange={e => setForm({...form, room: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dosen</label>
                <input required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 dark:text-white text-sm" value={form.lecturer} onChange={e => setForm({...form, lecturer: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-md border border-slate-200 dark:border-slate-700 font-bold dark:text-slate-300 text-sm cursor-pointer">Batal</button>
                  <button type="submit" className="flex-1 py-2 rounded-md bg-primary-600 text-white font-bold transition-all text-sm cursor-pointer">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SchedulePage;
