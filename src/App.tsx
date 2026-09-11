/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Settings, 
  LayoutDashboard, 
  ShieldAlert, 
  BrainCircuit,
  GraduationCap,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardView from './components/DashboardView';
import AttendanceView from './components/AttendanceView';
import StudentView from './components/StudentView';
import ReportsView from './components/ReportsView';
import DeepAnalysisView from './components/DeepAnalysisView';
import SyncView from './components/SyncView';
import TemplatesView from './components/TemplatesView';
import { Student, AttendanceRecord, LunchRecord, User } from './types';
import LoginView from './components/LoginView';

import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Initial dummy data for first load
const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'สมชาย รักเรียน', grade: 'ป.1', room: '1/1' },
  { id: '2', name: 'สมหญิง มานะ', grade: 'ป.1', room: '1/1' },
  { id: '3', name: 'ใจดี มีสุข', grade: 'ป.1', room: '1/2' },
  { id: '4', name: 'เก่งกาจ ฉลาดล้ำ', grade: 'ป.2', room: '2/1' },
  { id: '5', name: 'นารี มีชัย', grade: 'ป.2', room: '2/1' },
  { id: '6', name: 'รุ่งเรือง ก้าวหน้า', grade: 'ป.1', room: '1/1' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('school_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If we have a firebase user but no local app user, or they differ
        // For simplicity, we trust the local storage if it exists, 
        // but if we just logged in via Firebase, we might need to map it.
        // Actually, LoginView sets the user state which triggers the storage effect.
      } else if (!localStorage.getItem('school_user')) {
        // Only clear if not demo mode (demo users don't have firebase sessions)
        // This is a bit tricky since we mix demo and real auth.
        // Let's assume if there's no firebase user AND it's not a mock user, we log out.
        const currentUser = JSON.parse(localStorage.getItem('school_user') || 'null');
        if (currentUser && currentUser.id.startsWith('google_')) { // specific prefix for google users if I used one
           // setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('school_user');
  };

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('school_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  
  // Storage effects...
  useEffect(() => {
    if (user) localStorage.setItem('school_user', JSON.stringify(user));
    else localStorage.removeItem('school_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('school_students', JSON.stringify(students));
  }, [students]);

  // filtered students based on user role (broadened to grade level for teachers)
  const teacherStudents = user?.role === 'teacher' && user.assignedClass
    ? students.filter(s => s.grade === user.assignedClass?.grade)
    : students;

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('school_attendance');
    return saved ? JSON.parse(saved) : [];
  });
  const [lunch, setLunch] = useState<LunchRecord[]>(() => {
    const saved = localStorage.getItem('school_lunch');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('school_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('school_lunch', JSON.stringify(lunch));
  }, [lunch]);

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  const getPageTitle = () => {
    if (activeTab === 'dashboard') return 'หน้าแรก (Insights & Stats)';
    if (activeTab === 'attendance') return 'เช็คชื่อ';
    if (activeTab === 'reports') return 'เอกสารรายงาน';
    if (activeTab === 'templates') return 'ดาวน์โหลดเทมเพลต Excel';
    if (activeTab === 'deep-analysis') return 'การวิเคราะห์เชิงลึก';
    if (activeTab === 'students') return 'รายชื่อนักเรียน';
    if (activeTab === 'sync') return 'เชื่อมโยงข้อมูล';
    return '';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView students={teacherStudents} attendance={attendance} lunch={lunch} />;
      case 'attendance':
        return <AttendanceView students={teacherStudents} attendance={attendance} setAttendance={setAttendance} isTeacher={user.role === 'teacher'} />;
      case 'reports':
        return <ReportsView students={teacherStudents} attendance={attendance} lunch={lunch} initialReportType={null as any} onNavigate={setActiveTab} />;
      case 'templates':
        return <TemplatesView />;
      case 'deep-analysis':
        return <DeepAnalysisView students={students} attendance={attendance} />;
      case 'students':
        return <StudentView students={students} setStudents={setStudents} />;
      case 'sync':
        return <SyncView />;
      default:
        return <DashboardView students={teacherStudents} attendance={attendance} lunch={lunch} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-blue-900 text-nowrap">HRT SmartDailyAi</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">{user.role === 'admin' ? 'Admin Portal' : 'Teacher View'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {/* Main items */}
          <NavItem 
            id="dashboard" 
            label="หน้าแรก" 
            icon={LayoutDashboard} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          
          <NavItem 
            id="attendance" 
            label="เช็คชื่อ" 
            icon={Calendar} 
            active={activeTab === 'attendance'} 
            onClick={() => setActiveTab('attendance')} 
          />

          {/* Reports Menu */}
          <NavItem 
            id="reports" 
            label="เอกสารรายงาน" 
            icon={FileText} 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />

          <NavItem 
            id="templates" 
            label="เทมเพลต Excel" 
            icon={FileSpreadsheet} 
            active={activeTab === 'templates'} 
            onClick={() => setActiveTab('templates')} 
          />

          {user.role === 'admin' && (
            <>
              <NavItem 
                id="deep-analysis" 
                label="วิเคราะห์เชิงลึก" 
                icon={ShieldAlert} 
                active={activeTab === 'deep-analysis'} 
                onClick={() => setActiveTab('deep-analysis')} 
              />
              <NavItem 
                id="students" 
                label="รายชื่อนักเรียน" 
                icon={Users} 
                active={activeTab === 'students'} 
                onClick={() => setActiveTab('students')} 
              />
              <NavItem 
                id="sync" 
                label="เชื่อมโยงข้อมูล" 
                icon={RefreshCw} 
                active={activeTab === 'sync'} 
                onClick={() => setActiveTab('sync')} 
              />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <X size={16} />
              </button>
            </div>
            {user.assignedClass && (
              <div className="text-[10px] bg-white border border-slate-200 p-1.5 rounded-lg font-bold text-blue-600 text-center">
                ครูประจำชั้น {user.assignedClass.grade} ห้อง {user.assignedClass.room}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Calendar size={12} />
              {new Date().toLocaleDateString('th-TH', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              ความช่วยเหลือ
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
              รายงานประจำวัน
            </button>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ id, label, icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active
          ? 'bg-blue-50 text-blue-700 shadow-sm'
          : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
      }`}
    >
      <Icon 
        size={20} 
        className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'} 
      />
      <span className="font-medium">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeNav" 
          className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
        />
      )}
    </button>
  );
}
