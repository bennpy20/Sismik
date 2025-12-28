
import React, { useState } from 'react';
import { loadData, addGrade, updateGrade, deleteGrade } from '../services/storage';
import { AppData, GradeRecord } from '../types';
import { getGradeFromScore } from '../constants';
import { IconEdit, IconTrash, IconPlus, IconClose } from '../components/Icons';

const Grades: React.FC = () => {
  const [data, setData] = useState<AppData>(loadData());
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [activeSemester, setActiveSemester] = useState(data.semesters[0] || 1);
  const [gradeToDelete, setGradeToDelete] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<GradeRecord, 'id'>>({
    courseId: '',
    semester: 1,
    uts: { score: 0, weight: 20 },
    uas: { score: 0, weight: 20 },
    kat: { score: 0, weight: 60 }
  });

  const semesterCourses = data.courses.filter(c => c.semester === activeSemester);
  const coursesWithoutGrades = semesterCourses.filter(c => 
    !data.grades.some(g => g.courseId === c.id)
  );

  const canAddGrade = coursesWithoutGrades.length > 0;

  const handleOpenModal = (grade?: GradeRecord) => {
    if (grade) {
      setEditingGrade(grade);
      setForm({ ...grade });
      setShowModal(true);
    } else {
      if (coursesWithoutGrades.length > 0) {
        setEditingGrade(null);
        setForm({ 
          courseId: coursesWithoutGrades[0].id, 
          semester: activeSemester,
          uts: { score: 0, weight: 20 },
          uas: { score: 0, weight: 20 },
          kat: { score: 0, weight: 60 }
        });
        setShowModal(true);
      }
    }
  };

  const calculateFinal = (f: any) => {
    return (f.uts.score * (f.uts.weight / 100)) + 
           (f.uas.score * (f.uas.weight / 100)) + 
           (f.kat.score * (f.kat.weight / 100));
  };

  const formatScore = (num: number) => {
    return Number(num.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightSum = form.uts.weight + form.uas.weight + form.kat.weight;
    if (weightSum !== 100) {
      setValidationError("Total bobot UTS, UAS, dan KAT harus tepat 100% agar perhitungan valid.");
      return;
    }

    if (editingGrade) {
      updateGrade({ ...editingGrade, ...form });
    } else {
      addGrade({ id: crypto.randomUUID(), ...form });
    }
    setData(loadData());
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (gradeToDelete) {
      deleteGrade(gradeToDelete);
      setData(loadData());
      setGradeToDelete(null);
    }
  };

  const handleWeightChange = (field: 'uts' | 'uas' | 'kat', val: number) => {
    setForm(prev => ({
      ...prev,
      [field]: { ...prev[field], weight: Math.max(0, Math.min(100, val)) }
    }));
  };

  const handleScoreChange = (field: 'uts' | 'uas' | 'kat', value: string) => {
    let scoreVal = parseFloat(value) || 0;
    if (scoreVal < 0) scoreVal = 0;
    if (scoreVal > 100) scoreVal = 100;
    setForm(prev => ({
      ...prev,
      [field]: { ...prev[field], score: scoreVal }
    }));
  };

  const currentGrades = data.grades.filter(g => g.semester === activeSemester);
  const totalWeight = form.uts.weight + form.uas.weight + form.kat.weight;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Nilai Perkuliahan</h2>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            disabled={!canAddGrade}
            className={`bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-bold shadow-sm text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            title={!canAddGrade ? (semesterCourses.length === 0 ? "Tambahkan mata kuliah terlebih dahulu" : "Semua mata kuliah sudah dinilai") : "Input Nilai"}
          >
            <IconPlus className="w-4 h-4" /> Input Nilai
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

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center">Kode</th>
                  <th className="px-6 py-4 text-center">Nama Mata Kuliah</th>
                  <th className="px-6 py-4 text-center">SKS</th>
                  <th className="px-4 py-4 text-center">UTS</th>
                  <th className="px-4 py-4 text-center">UAS</th>
                  <th className="px-4 py-4 text-center">KAT</th>
                  <th className="px-4 py-4 text-center">Nilai Akhir</th>
                  <th className="px-4 py-4 text-center">Nilai Huruf</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {currentGrades.length > 0 ? currentGrades.map(g => {
                  const course = data.courses.find(c => c.id === g.courseId);
                  const final = calculateFinal(g);
                  const eval_ = getGradeFromScore(final);
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-300 uppercase">{course?.code}</td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-300">{course?.name}</td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-300">{course?.credits}</td>
                      <td className="px-4 py-4 text-center">
                        <p className="font-semibold text-slate-800 dark:text-slate-300">{formatScore(g.uts.score)}</p>
                        <p className="text-[9px] font-semibold text-slate-400">{g.uts.weight}%</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <p className="font-semibold text-slate-800 dark:text-slate-300">{formatScore(g.uas.score)}</p>
                        <p className="text-[9px] font-semibold text-slate-400">{g.uas.weight}%</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <p className="font-semibold text-slate-800 dark:text-slate-300">{formatScore(g.kat.score)}</p>
                        <p className="text-[9px] font-semibold text-slate-400">{g.kat.weight}%</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-semibold text-primary-600 dark:text-primary-400">{formatScore(final)}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${eval_.letter === 'A' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'}`}>{eval_.letter}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleOpenModal(g)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-all cursor-pointer" title="Edit">
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setGradeToDelete(g.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all cursor-pointer" title="Hapus">
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm italic">Belum ada data nilai yang diinput</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Validation Error Modal - High Z-Index & Full Coverage */}
      {validationError && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
            <h3 className="text-xl font-bold text-center dark:text-white mb-2 tracking-tight">Periksa Kembali</h3>
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
      {gradeToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
            <h3 className="text-xl font-bold text-center dark:text-white mb-2 tracking-tight">Hapus Nilai?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Data nilai yang dihapus tidak dapat dikembalikan. Setelah dihapus, nilai IPK akan diatur ulang secara otomatis.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setGradeToDelete(null)}
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
              <h3 className="text-lg font-bold dark:text-white">{editingGrade ? 'Edit' : 'Input'} Nilai Perkuliahan</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <IconClose className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mata Kuliah</label>
                  <select 
                    disabled={!!editingGrade} 
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md outline-primary-500 disabled:opacity-50 dark:text-white text-sm cursor-pointer" 
                    value={form.courseId} 
                    onChange={e => setForm({...form, courseId: e.target.value})}
                  >
                    {editingGrade ? (
                      <option value={form.courseId}>{data.courses.find(c => c.id === form.courseId)?.name}</option>
                    ) : (
                      coursesWithoutGrades.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)
                    )}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">UTS Skor</label>
                        <input type="number" step="0.01" max="100" min="0" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.uts.score} onChange={e => handleScoreChange('uts', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Bobot %</label>
                        <input type="number" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.uts.weight} onChange={e => handleWeightChange('uts', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="pb-2 text-right text-xs opacity-50 font-mono dark:text-slate-400">{formatScore(form.uts.score * (form.uts.weight / 100))}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">UAS Skor</label>
                        <input type="number" step="0.01" max="100" min="0" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.uas.score} onChange={e => handleScoreChange('uas', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Bobot %</label>
                        <input type="number" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.uas.weight} onChange={e => handleWeightChange('uas', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="pb-2 text-right text-xs opacity-50 font-mono dark:text-slate-400">{formatScore(form.uas.score * (form.uas.weight / 100))}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">KAT Skor</label>
                        <input type="number" step="0.01" max="100" min="0" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.kat.score} onChange={e => handleScoreChange('kat', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Bobot %</label>
                        <input type="number" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-md dark:text-white text-sm" value={form.kat.weight} onChange={e => handleWeightChange('kat', parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="pb-2 text-right text-xs opacity-50 font-mono dark:text-slate-400">{formatScore(form.kat.score * (form.kat.weight / 100))}</div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl flex justify-between items-center border transition-all ${totalWeight === 100 ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800'}`}>
                  <div>
                    <p className={`text-[10px] uppercase font-black tracking-widest ${totalWeight === 100 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}`}>
                      Total Bobot: {totalWeight}% {totalWeight !== 100 && ' — Harus 100%'}
                    </p>
                    <p className="text-2xl font-black dark:text-white mt-0.5">{formatScore(calculateFinal(form))}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-md bg-white dark:bg-slate-800 shadow-sm border dark:border-slate-700 flex items-center justify-center text-lg font-black text-primary-600 dark:text-primary-400`}>
                    {getGradeFromScore(calculateFinal(form)).letter}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-md border border-slate-200 dark:border-slate-700 font-bold dark:text-slate-300 transition-colors text-sm cursor-pointer">Batal</button>
                  <button type="submit" disabled={totalWeight !== 100} className="flex-1 py-2 rounded-md bg-primary-600 text-white font-bold shadow-sm disabled:opacity-50 transition-all text-sm cursor-pointer">Simpan</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Grades;
