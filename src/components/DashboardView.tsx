/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Thermometer,
  Utensils,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ShieldCheck,
  Activity,
  GraduationCap,
  Sparkles,
  BrainCircuit,
  Loader2,
  Lightbulb,
  FileText,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { Student, AttendanceRecord, LunchRecord, DailyStats } from '../types';
import { generateDailyInsights } from '../services/geminiService';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
  lunch: LunchRecord[];
}

export default function DashboardView({ students, attendance, lunch }: Props) {
  const [insight, setInsight] = React.useState<any>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);

  const today = new Date().toISOString().split('T')[0];
  
  const todayAttendance = attendance.filter(a => a.date === today);

  const stats = {
    total: students.length,
    present: todayAttendance.filter(a => a.status === 'present').length,
    absent: todayAttendance.filter(a => a.status === 'absent').length,
    sick: todayAttendance.filter(a => a.status === 'sick').length,
    late: todayAttendance.filter(a => a.status === 'late').length,
    personal: todayAttendance.filter(a => a.status === 'personal').length,
    none: students.length - todayAttendance.length + todayAttendance.filter(a => a.status === 'none').length,
  };

  const runAIAnalysis = async () => {
    setLoadingAI(true);
    const dailyStats: DailyStats = {
      date: today,
      totalStudents: students.length,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      sick: stats.sick,
      personalLeave: stats.personal,
      none: stats.none,
      lunchCount: lunch.filter(l => l.date === today && l.hadLunch).length
    };

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const historicalAttendance = attendance.filter(a => a.date >= startDate);
      const historicalLunch = lunch.filter(l => l.date >= startDate);

      const result = await generateDailyInsights(dailyStats, students, historicalAttendance, historicalLunch);
      setInsight(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  const attendanceRate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;

  const chartData = [
    { name: 'มาเรียน', value: stats.present, color: '#10B981' },
    { name: 'สาย', value: stats.late, color: '#F59E0B' },
    { name: 'ป่วย', value: stats.sick, color: '#3B82F6' },
    { name: 'ลากิจ', value: stats.personal, color: '#6366f1' },
    { name: 'ขาด', value: stats.absent, color: '#EF4444' },
    { name: 'ไม่ระบุ', value: stats.none, color: '#94a3b8' },
  ];

  // Helper to generate last 7 days for trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  }).map(date => {
    const dailyAtt = attendance.filter(a => a.date === date);
    const present = dailyAtt.filter(a => a.status === 'present').length;
    return {
      date: new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      present: present
    };
  });

  // Grade Breakdown
  const grades = Array.from(new Set(students.map(s => s.grade)));
  const gradeData = grades.map(g => {
    const gradeStudents = students.filter(s => s.grade === g);
    const gradeAtt = attendance.filter(a => a.date === today && gradeStudents.some(s => s.id === a.studentId));
    const present = gradeAtt.filter(a => a.status === 'present').length;
    return {
      name: g,
      total: gradeStudents.length,
      present: present,
      rate: gradeStudents.length > 0 ? (present / gradeStudents.length) * 100 : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="นักเรียนทั้งหมด" 
          value={stats.total} 
          icon={Users} 
          trend="+2 จากสัปดาห์ก่อน" 
          trendUp={true}
          color="blue"
        />
        <StatCard 
          title="อัตราการมาเรียน" 
          value={`${attendanceRate.toFixed(1)}%`} 
          icon={Target} 
          trend={`${stats.present} จาก ${stats.total}`} 
          trendUp={attendanceRate > 90}
          color="emerald"
        />
        <StatCard 
          title="สุขภาพและความเป็นอยู่" 
          value={stats.sick + stats.personal} 
          icon={ShieldCheck} 
          trend="แจ้งลาวันนี้" 
          trendUp={false}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                แนวโน้มการมาเรียน (7 วันล่าสุด)
              </h3>
              <p className="text-xs text-slate-400 mt-1">เปรียบเทียบจำนวนนักเรียนที่มาเรียนปกติ</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Progress */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <GraduationCap size={18} className="text-emerald-500" />
            การมาเรียนแยกตามชั้น
          </h3>
          <div className="space-y-5">
            {gradeData.map((g) => (
              <div key={g.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 uppercase tracking-tighter">{g.name}</span>
                  <span className="text-slate-400">{g.present} / {g.total} คน</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${g.rate}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${g.rate > 90 ? 'bg-emerald-500' : g.rate > 70 ? 'bg-blue-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
            {gradeData.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 italic">ไม่มีข้อมูลชั้นเรียน</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-orange-500" />
              สรุปสถานะรายวัน
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} width={60} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="pt-4">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <BrainCircuit size={24} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Daily <span className="text-blue-400">AI</span> Insights</h2>
              </div>
              <p className="text-slate-400 font-medium max-w-xl leading-relaxed text-sm">
                วิเคราะห์สถิติมาเรียนประจำวันด้วย Gemini AI เพื่อสรุปภาพรวมและคาดการณ์พฤติกรรมนักเรียนล่วงหน้า
              </p>
            </div>
            <button 
              onClick={runAIAnalysis}
              disabled={loadingAI}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                loadingAI ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-900 hover:bg-blue-50 active:scale-95'
              }`}
            >
              {loadingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loadingAI ? 'กำลังประมวลผล...' : insight ? 'วิเคราะห์ใหม่อีกครั้ง' : 'เริ่มการวิเคราะห์'}
            </button>
          </div>
          <Sparkles size={200} className="absolute -right-16 -bottom-16 text-white/5 pointer-events-none" />
        </div>

        {insight && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Summary & Predictions */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-600" size={20} />
                    สรุปภาพรวมวันนี้
                  </h3>
                  <p className="text-slate-600 leading-relaxed italic border-l-4 border-blue-100 pl-4 bg-slate-50/50 py-4 rounded-r-2xl font-medium">
                    "{insight.summary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm space-y-4">
                    <h4 className="font-black text-indigo-800 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                      <TrendingUp className="text-indigo-500" size={16} />
                      คาดการณ์การมาเรียน (7 วันหน้า)
                    </h4>
                    <p className="text-xs text-indigo-900 leading-relaxed font-bold">
                      {insight.predictions.attendance}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                      <TrendingUp className="text-slate-400" size={16} />
                      แนวโน้มการมาเรียน
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {insight.attendanceTrend}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Recommendations */}
              <div className="lg:col-span-4">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
                    <Lightbulb className="text-amber-500" size={20} />
                    AI Advice
                  </h3>
                  <div className="space-y-4">
                    {insight.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                          {index + 1}
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-2xl ring-4 ${colors[color]}`}>
          <Icon size={28} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div className="mt-5">
        <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
      </div>
    </div>
  );
}
