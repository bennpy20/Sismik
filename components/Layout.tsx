
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loadData, markAllNotificationsRead, markNotificationRead } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { IconDashboard, IconCourses, IconGrades, IconSchedule, IconBell, IconSun, IconMoon, IconMenu, IconClose } from './Icons';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <IconDashboard /> },
  { path: '/courses', label: 'Daftar Mata Kuliah', icon: <IconCourses /> },
  { path: '/grades', label: 'Nilai Perkuliahan', icon: <IconGrades /> },
  { path: '/schedule', label: 'Jadwal Perkuliahan', icon: <IconSchedule /> },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(loadData());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setData(loadData()), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = data.notifications.filter(n => !n.isRead).length;

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all cursor-pointer ${
            location.pathname === item.path
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span className={location.pathname === item.path ? 'text-primary-600' : 'text-slate-400'}>
            {item.icon}
          </span>
          <span className="text-sm">{item.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex transition-colors relative z-40">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
            Sismik
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {isDarkMode ? <IconMoon className="w-4 h-4" /> : <IconSun className="w-4 h-4" />}
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-9 h-5 rounded-full p-1 transition-colors flex items-center cursor-pointer ${isDarkMode ? 'bg-primary-600' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[140] md:hidden animate-in fade-in duration-300 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-[150] md:hidden transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex justify-between items-center border-b dark:border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
            Sismik
          </h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 cursor-pointer">
            <IconClose />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-sm font-semibold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-3">
              {isDarkMode ? <IconMoon className="w-5 h-5" /> : <IconSun className="w-5 h-5" />}
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${isDarkMode ? 'bg-primary-600' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 transition-colors relative z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md md:hidden transition-colors cursor-pointer"
            >
              <IconMenu />
            </button>
            <div className="md:hidden font-bold text-primary-600 text-lg">Sismik</div>
          </div>
          
          <div className="flex-1"></div>
          <div className="flex items-center gap-3 relative">
             <div className="relative" ref={notificationRef}>
               <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 relative transition-colors text-slate-500 dark:text-slate-300 cursor-pointer"
               >
                  <IconBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[8px] font-black rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                      {unreadCount}
                    </span>
                  )}
               </button>

               {showNotifications && (
                 <div className="absolute right-0 top-12 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b dark:border-slate-700 flex justify-between items-center">
                      <h4 className="font-bold text-xs">Notifikasi</h4>
                      {unreadCount > 0 && (
                        <button onClick={() => {markAllNotificationsRead(); setData(loadData())}} className="text-[9px] text-primary-600 dark:text-primary-400 font-bold hover:underline uppercase cursor-pointer">Tandai Dibaca</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                      {data.notifications.length > 0 ? data.notifications.map(n => (
                        <button 
                          key={n.id} 
                          onClick={() => {markNotificationRead(n.id); setData(loadData())}}
                          className={`w-full text-left p-2.5 rounded-lg text-[11px] border transition-all cursor-pointer ${n.isRead ? 'opacity-40 border-transparent' : 'opacity-100 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30'} hover:bg-slate-100 dark:hover:bg-slate-700`}
                        >
                          <div className="flex items-start gap-2">
                             <div className={`w-1.5 h-1.5 mt-1 rounded-full shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                             <div className="flex-1">
                                <p className="font-medium text-slate-700 dark:text-slate-200 leading-tight">{n.message}</p>
                                <p className="text-[8px] mt-1 text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                          </div>
                        </button>
                      )) : (
                        <div className="p-8 text-center text-slate-400 text-[10px] italic">Tidak ada notifikasi</div>
                      )}
                    </div>
                 </div>
               )}
             </div>

             <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-black uppercase">
                    {user?.avatar ? <img src={user.avatar} referrerPolicy="no-referrer" alt="avatar" className="w-full h-full rounded-full" /> : user?.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-xs font-bold dark:text-white truncate max-w-[100px]">{user?.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="p-4 border-b dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akun Aktif</p>
                      <p className="text-xs font-bold dark:text-white mt-1 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
