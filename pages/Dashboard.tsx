
import React, { useState, useEffect } from 'react';
import { loadData } from '../services/storage';
import { AppData, SemesterSummary } from '../types';
import { getGradeFromScore } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AppData>(loadData());

  useEffect(() => {
    // Memastikan data terbaru saat halaman dimuat
    setData(loadData());
  }, []);

  const calculateFinalScore = (g: any) => {
    return (g.uts.score * (g.uts.weight / 100)) + 
           (g.uas.score * (g.uas.weight / 100)) + 
           (g.kat.score * (g.kat.weight / 100));
  };

  const calculateStats = () => {
    let totalPoints = 0;
    let wajibCredits = 0;
    let pilihanCredits = 0;
    let totalCredits = 0;
    
    data.courses.forEach(c => {
      totalCredits += c.credits;
      if (c.type === 'Pilihan') {
        pilihanCredits += c.credits;
      } else {
        wajibCredits += c.credits;
      }
    });

    const summaries: SemesterSummary[] = data.semesters.map(s => {
      const semesterGrades = data.grades.filter(g => g.semester === s);
      let semPoints = 0;
      let semCredits = 0;

      semesterGrades.forEach(g => {
        const course = data.courses.find(c => c.id === g.courseId);
        if (course) {
          const finalScore = calculateFinalScore(g);
          const point = getGradeFromScore(finalScore).point;
          semPoints += point * course.credits;
          semCredits += course.credits;
        }
      });

      const gpa = semCredits > 0 ? parseFloat((semPoints / semCredits).toFixed(2)) : 0;
      totalPoints += semPoints;

      return { semester: s, gpa, totalCredits: semCredits };
    }).filter(s => s.totalCredits > 0);

    const gradedCredits = data.grades.reduce((acc, curr) => {
      const c = data.courses.find(course => course.id === curr.courseId);
      return acc + (c ? c.credits : 0);
    }, 0);

    const overallGPA = gradedCredits > 0 ? (totalPoints / gradedCredits).toFixed(2) : '0.00';
    
    return { overallGPA, totalCredits, wajibCredits, pilihanCredits, summaries };
  };

  const stats = calculateStats();
  const targetTotal = 144;
  const targetPilihan = 31;
  const targetWajib = targetTotal - targetPilihan; 

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold dark:text-white">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: IPK */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Indeks Prestasi Kumulatif (IPK)</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-1">{stats.overallGPA}</p>
          <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 transition-all duration-1000" style={{ width: `${(parseFloat(stats.overallGPA) / 4) * 100}%` }}></div>
          </div>
        </div>

        {/* Card 2: Total SKS Terdata */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total SKS</p>
          <div className="flex items-baseline gap-2 mt-1 mb-4">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalCredits}</p>
            <p className="text-sm text-slate-400">/ {targetTotal}</p>
          </div>
          <div className="mt-auto">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-400 font-bold">PROGRES</span>
              <span className="text-slate-400 font-bold">{Math.round((stats.totalCredits / targetTotal) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000"
                style={{width: `${Math.min(100, (stats.totalCredits / targetTotal) * 100)}%`}} />
            </div>
          </div>
        </div>

        {/* Card 3: Sebaran Mata Kuliah */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sebaran Mata Kuliah</p>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-bold dark:text-slate-300">WAJIB ({stats.wajibCredits}/{targetWajib})</span>
                <span className="text-slate-400 font-bold">{Math.round((stats.wajibCredits / targetWajib) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(100, (stats.wajibCredits / targetWajib) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-bold dark:text-slate-300">PILIHAN ({stats.pilihanCredits}/{targetPilihan})</span>
                <span className="text-slate-400 font-bold">{Math.round((stats.pilihanCredits / targetPilihan) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${Math.min(100, (stats.pilihanCredits / targetPilihan) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Tren IP */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-sm font-bold mb-6 dark:text-white uppercase tracking-wider text-slate-400">Grafik Indeks Prestasi Semester (IPS)</h3>
        <div className="h-72 w-full">
          {stats.summaries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.summaries}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="semester" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Smt ${val}`} />
                <YAxis domain={[0, 4]} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderRadius: '12px', border: 'none', color: 'white', fontSize: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#14b8a6', fontWeight: 'bold' }}
                  labelStyle={{ marginBottom: '4px', opacity: 0.7 }}
                  labelFormatter={(val) => `Semester ${val}`}
                />
                <Area type="monotone" dataKey="gpa" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg text-slate-400 text-sm italic">
              Belum ada IPS yang bisa ditampilkan
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
