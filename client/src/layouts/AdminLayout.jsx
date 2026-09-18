import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Home,
  CalendarCheck,
  Award,
  Trophy,
  BarChart3,
  KeyRound,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/houses', icon: Home, label: 'Houses' },
    { to: '/admin/activities', icon: CalendarCheck, label: 'Activities' },
    { to: '/admin/weekly-marks', icon: Award, label: 'Weekly Marks' },
    { to: '/admin/rankings', icon: Trophy, label: 'Rankings' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/admin/password-requests', icon: KeyRound, label: 'Password Requests' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-800">
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-eco-600 flex items-center justify-center text-white text-base shadow-xs">
            🌱
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-none">EcoClub</h1>
            <span className="text-[10px] text-eco-700 font-semibold uppercase tracking-wider">Admin Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">EcoClub Admin</h2>
                  <p className="text-[11px] text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-eco-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-5 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-2 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-eco-600 to-emerald-400 flex items-center justify-center text-white text-xl shadow-md">
            🌱
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">EcoClub</h2>
            <p className="text-xs text-eco-700 font-semibold mt-1">Admin Portal</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 pt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-eco-600 text-white shadow-xs shadow-eco-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl mb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-100 text-eco-800 font-bold flex items-center justify-center text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
