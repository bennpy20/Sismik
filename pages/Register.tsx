
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validasi password
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password tidak memenuhi syarat keamanan.');
      return;
    }

    setIsPending(true);
    const success = await register(name, email, password);
    if (success) {
      navigate('/login');
    } else {
      setError('Email sudah terdaftar atau terjadi kesalahan.');
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary-600 dark:text-primary-400 tracking-tighter">Sismik</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sistem Manajemen Perkuliahan Pribadi</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl text-center font-bold dark:text-white mb-6">Buat Akun</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nama Lengkap</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-primary-500 dark:text-white text-sm" 
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-primary-500 dark:text-white text-sm" 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password</label>
              <input 
                type="password" 
                required 
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border ${password.length > 0 ? (isPasswordValid ? 'border-emerald-500' : 'border-amber-500') : 'dark:border-slate-700'} rounded-xl outline-primary-500 dark:text-white text-sm transition-all`} 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  <span className={`text-[10px] font-bold ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>MINIMAL 8 KARAKTER</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  <span className={`text-[10px] font-bold ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>MENGANDUNG ANGKA (0-9)</span>
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isPending || (password.length > 0 && !isPasswordValid)}
              className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              {isPending ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-500">
            Sudah punya akun? <Link to="/login" className="text-primary-600 font-bold hover:underline cursor-pointer">Login di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
