/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, LogIn, LayoutDashboard, UserCheck, Chrome } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface Props {
  onLogin: (user: User) => void;
}

const MOCK_USERS: User[] = [
  { 
    id: 'admin1', 
    name: 'ฝ่ายบริหารจัดการ', 
    email: 'admin@school.ac.th', 
    role: 'admin' 
  },
  { 
    id: 'teacher1', 
    name: 'ครูสมศรี มีสุข', 
    email: 'somsri@school.ac.th', 
    role: 'teacher', 
    assignedClass: { grade: 'ป.1', room: '1/1' } 
  },
  { 
    id: 'teacher2', 
    name: 'ครูวิชัย ใจดี', 
    email: 'wichai@school.ac.th', 
    role: 'teacher', 
    assignedClass: { grade: 'ป.1', room: '1/2' } 
  },
];

export default function LoginView({ onLogin }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading('google');
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Map Firebase user to App User
      // For demo: if email matches winmax2006@gmail.com, make admin
      const isAdmin = user.email === 'winmax2006@gmail.com';
      
      onLogin({
        id: user.uid,
        name: user.displayName || user.email || 'Google User',
        email: user.email || '',
        role: isAdmin ? 'admin' : 'teacher',
        assignedClass: isAdmin ? undefined : { grade: 'ป.1', room: '1/1' }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    } finally {
      setLoading(null);
    }
  };

  const handleLogin = (user: User) => {
    setLoading(user.id);
    setTimeout(() => {
      onLogin(user);
      setLoading(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 mb-6 rotate-3">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">HRT SmartDailyAi</h1>
          <p className="text-slate-500 mt-2 font-medium">เข้าสู่ระบบเพื่อจัดการข้อมูลสถานะนักเรียนรายวัน</p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={!!loading}
            className="w-full bg-white p-5 rounded-3xl border-2 border-blue-600 shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-4 text-blue-700 font-black group disabled:opacity-50"
          >
            {loading === 'google' ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Chrome size={24} />
                </div>
                <span>เข้าสู่ระบบด้วย Google Account</span>
              </>
            )}
          </motion.button>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-slate-200" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              หรือ เลือกพรีวิวด้วย Demo Account
            </div>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-3">
            {MOCK_USERS.map((user) => (
              <motion.button
                key={user.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleLogin(user)}
                disabled={!!loading}
                className={`w-full bg-white/60 p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-left group disabled:opacity-50`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  {user.role === 'admin' ? <LayoutDashboard size={20} /> : <UserCheck size={20} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm">{user.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                    {user.role === 'admin' ? 'Administrator' : `Teacher ${user.assignedClass?.grade}/${user.assignedClass?.room}`}
                  </p>
                </div>
                {loading === user.id ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            ระบบจะจดจำการเข้าสู่ระบบของคุณในเบราว์เซอร์นี้<br/>
            ข้อมูลการเข้าร่วมกิจกรรมจะถูกบันทึกไว้ในฐานข้อมูลคลาวด์
          </p>
        </div>
      </div>
    </div>
  );
}
