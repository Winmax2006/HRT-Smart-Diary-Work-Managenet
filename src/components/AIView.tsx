/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  FileText,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { Student, AttendanceRecord, LunchRecord, DailyStats } from '../types';
import { generateDailyInsights } from '../services/geminiService';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
  lunch: LunchRecord[];
}

export default function AIView({ students, attendance, lunch }: Props) {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    const todayLunch = lunch.filter(l => l.date === today && l.hadLunch);

    const stats: DailyStats = {
      date: today,
      totalStudents: students.length,
      present: todayAttendance.filter(a => a.status === 'present').length,
      absent: todayAttendance.filter(a => a.status === 'absent').length,
      late: todayAttendance.filter(a => a.status === 'late').length,
      sick: todayAttendance.filter(a => a.status === 'sick').length,
      personalLeave: todayAttendance.filter(a => a.status === 'personal').length,
      none: students.length - todayAttendance.length + todayAttendance.filter(a => a.status === 'none').length,
      lunchCount: todayLunch.length
    };

    try {
      // Provide exactly the past 30 days of context for better predictions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const historicalAttendance = attendance.filter(a => a.date >= startDate);
      const historicalLunch = lunch.filter(l => l.date >= startDate);

      const result = await generateDailyInsights(stats, students, historicalAttendance, historicalLunch);
      setInsight(result);
    } catch (err: any) {
      setError(err.message === "Missing Gemini API Key" 
        ? "กรุณากำหนด GEMINI_API_KEY ในส่วนการตั้งค่า (Secrets)" 
        : "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <BrainCircuit size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black">Daily Admin AI Insights</h2>
          <p className="text-blue-100 max-w-lg">
            ระบบปัญญาประดิษฐ์วิเคราะห์สถิติรายวัน เพื่อช่วยในการตัดสินใจและบริหารจัดการโรงเรียนอย่างมีประสิทธิภาพ
          </p>
          <button 
            onClick={analyze}
            disabled={loading}
            className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
            {insight ? 'วิเคราะห์ใหม่อีกครั้ง' : 'เริ่มการวิเคราะห์ด้วย AI'}
          </button>
        </div>
        <Sparkles size={180} className="absolute -left-12 -bottom-12 text-white/5 opacity-50" />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 font-medium">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {loading && !insight && (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">Gemini กำลังอ่านสถิติและประมวลผล...</p>
        </div>
      )}

      {insight && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-500" />
              สรุปภาพรวมวันนี้
            </h3>
            <p className="text-slate-600 leading-relaxed italic border-l-4 border-blue-200 pl-4 bg-slate-50 py-3 rounded-r-xl">
              "{insight.summary}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trend */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <RefreshCw className="text-emerald-500" size={18} />
                แนวโน้มการมาเรียน
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {insight.attendanceTrend}
              </p>
            </div>

            {/* Lunch */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="text-violet-500" size={18} />
                ประสิทธิภาพอาหารกลางวัน
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {insight.lunchAnalysis}
              </p>
            </div>
          </div>

          {/* Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
              <h4 className="font-black text-indigo-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                <TrendingUp className="text-indigo-500" size={18} />
                คาดการณ์การมาเรียน (7 วันหน้า)
              </h4>
              <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                {insight.predictions.attendance}
              </p>
            </div>

            <div className="bg-violet-50/50 p-6 rounded-3xl border border-violet-100 shadow-sm space-y-4">
              <h4 className="font-black text-violet-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                <TrendingUp className="text-violet-500" size={18} />
                คาดการณ์ความต้องการอาหาร (7 วันหน้า)
              </h4>
              <p className="text-sm text-violet-900 leading-relaxed font-medium">
                {insight.predictions.lunch}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Lightbulb className="text-amber-500" />
              คำแนะนำสำหรับผู้บริหาร
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {insight.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 group hover:bg-amber-50 hover:shadow-sm transition-all">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center text-amber-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm text-amber-900 font-medium leading-loose">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
