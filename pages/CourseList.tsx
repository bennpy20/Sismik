
import React, { useEffect, useState } from 'react';
import { loadData, addCourse, deleteCourse, updateCourse } from '../services/storage';
import { AppData, Course, CourseType } from '../types';
import { IconEdit, IconTrash, IconPlus, IconClose } from '../components/Icons';

const CourseList: React.FC = () => {
  const [data, setData] = useState<AppData>(loadData());
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSemester, data.courses.length]);

  const [form, setForm] = useState<{
    code: string;
    name: string;
    credits: number;
    semester: number;
    type: CourseType;
  }>({
    code: '',
    name: '',
    credits: 2,
    semester: 1,
    type: 'Wajib'
  });

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setForm({ 
        code: course.code,
        name: course.name,
        credits: course.credits,
        semester: course.semester,
        type: course.type || 'Wajib'
      });
    } else {
      setEditingCourse(null);
      setForm({ 
        code: '', 
        name: '', 
        credits: 2, 
        semester: typeof filterSemester === 'number' ? filterSemester : (data.semesters[0] || 1),
        type: 'Wajib'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse({ ...editingCourse, ...form });
    } else {
      addCourse({ id: crypto.randomUUID(), ...form });
    }
    setData(loadData());
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteCourse(courseToDelete);
      setData(loadData());
      setCourseToDelete(null);
    }
  };

  const filteredCourses = filterSemester === 'all' 
    ? data.courses 
    : data.courses.filter(c => c.semester === filterSemester);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Daftar Mata Kuliah</h2>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-bold shadow-sm transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <IconPlus className="w-4 h-4" /> Tambah Mata Kuliah
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Semester:</label>
          <select 
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white min-w-[160px] cursor-pointer"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          >
            <option value="all">Semua Semester</option>
            {data.semesters.map(s => 
              <option key={s} value={s}>
                {s >= 100 ? `Semester Antara ${s - 100}` : `Semester ${s}`}
              </option>)}
          </select>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center">Kode</th>
                  <th className="px-6 py-4 text-center">Nama Mata Kuliah</th>
                  <th className="px-6 py-4 text-center">SKS</th>
                  <th className="px-6 py-4 text-center">Tipe</th>
                  <th className="px-6 py-4 text-center">Semester</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {paginatedCourses.length > 0 ? paginatedCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-300 uppercase">{course.code}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-300">{course.name}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-300">{course.credits}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold uppercase tracking-tighter ${course.type === 'Pilihan' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {course.type || 'Wajib'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-300">{course.semester >= 100 ? `Antara ${course.semester - 100}` : course.semester}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => handleOpenModal(course)} 
                          className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-all cursor-pointer"
                          title="Edit"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCourseToDelete(course.id)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm italic">Belum ada data mata kuliah</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              {' - '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredCourses.length)}
              {' '}dari {filteredCourses.length} data
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 rounded-md text-xs font-bold border border-slate-200 dark:border-slate-700 
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all
                      ${
                        currentPage === page
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 rounded-md text-xs font-bold border border-slate-200 dark:border-slate-700 
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal - High Z-Index & Full Coverage */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
            <h3 className="text-xl font-bold text-center dark:text-white mb-2 tracking-tight">Hapus Mata Kuliah?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Data mata kuliah beserta seluruh data nilai dan jadwal terkait akan ikut terhapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCourseToDelete(null)}
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

      {/* Course Modal - High Z-Index & Full Coverage */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold dark:text-white">{editingCourse ? 'Edit' : 'Tambah'} Mata Kuliah</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <IconClose className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kode</label>
                    <input required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 dark:text-white text-sm" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">SKS</label>
                    <input type="number" min="1" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 dark:text-white text-sm" value={form.credits} onChange={e => setForm({...form, credits: parseInt(e.target.value) || 2})} />
                  </div>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nama Mata Kuliah</label>
                  <input required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 dark:text-white text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Semester</label>
                    <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 dark:text-white text-sm cursor-pointer" value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})}>
                      {data.semesters.map(s => 
                      <option key={s} value={s}>
                        {s >= 100 ? `Semester Antara ${s - 100}` : `Semester ${s}`}
                      </option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tipe Mata Kuliah</label>
                    <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 dark:text-white text-sm cursor-pointer" value={form.type} onChange={e => setForm({...form, type: e.target.value as CourseType})}>
                      <option value="Wajib">Wajib</option>
                      <option value="Pilihan">Pilihan</option>
                    </select>
                  </div>
              </div>
              <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-md border dark:border-slate-700 dark:text-slate-300 text-sm font-bold cursor-pointer">Batal</button>
                  <button type="submit" className="flex-1 py-2 rounded-md bg-primary-600 text-white font-bold text-sm shadow-sm hover:bg-primary-700 transition-all cursor-pointer">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseList;
