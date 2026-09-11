/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  ChevronRight, 
  Download, 
  Printer, 
  Filter,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Student, AttendanceRecord, LunchRecord, AttendanceStatus } from '../types';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
  lunch: LunchRecord[];
  initialReportType?: ReportType;
  onNavigate?: (tab: string) => void;
}

type ReportType = 'daily' | 'weekly' | 'monthly' | 'semester';

export default function ReportsView({ students, attendance, lunch, initialReportType = 'daily', onNavigate }: Props) {
  const [reportType, setReportType] = useState<ReportType | null>(initialReportType);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isChanging, setIsChanging] = useState(!initialReportType);

  useEffect(() => {
    if (initialReportType) {
      setReportType(initialReportType);
      setIsChanging(false);
    }
  }, [initialReportType]);

  const reportData = useMemo(() => {
    if (!reportType) return null;
    const today = new Date(selectedDate);
    let startDate: string;
    let endDate: string = selectedDate;
    let daysDiff = 1;

    if (reportType === 'daily') {
      startDate = selectedDate;
      daysDiff = 1;
    } else if (reportType === 'weekly') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      startDate = start.toISOString().split('T')[0];
      daysDiff = 7;
    } else if (reportType === 'monthly') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = start.toISOString().split('T')[0];
      daysDiff = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      // Semester: past 4 months (120 days approximately)
      const start = new Date(today);
      start.setMonth(today.getMonth() - 4);
      startDate = start.toISOString().split('T')[0];
      daysDiff = 120;
    }

    const filteredAttendance = attendance.filter(a => a.date >= startDate && a.date <= endDate);
    const filteredLunch = lunch.filter(l => l.date >= startDate && l.date <= endDate);

    // Aggregate by status
    const summary = {
      present: filteredAttendance.filter(a => a.status === 'present').length,
      sick: filteredAttendance.filter(a => a.status === 'sick').length,
      personal: filteredAttendance.filter(a => a.status === 'personal').length,
      absent: filteredAttendance.filter(a => a.status === 'absent').length,
      late: filteredAttendance.filter(a => a.status === 'late').length,
      none: filteredAttendance.filter(a => a.status === 'none').length,
      lunch: filteredLunch.filter(l => l.hadLunch).length
    };

    // Calculate daily trend
    const trend: any[] = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];
      const dailyAtt = attendance.filter(a => a.date === dateStr);
      trend.push({
        dateStr,
        date: curr.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        present: dailyAtt.filter(a => a.status === 'present').length,
        absent: dailyAtt.filter(a => a.status === 'absent').length,
      });
      curr.setDate(curr.getDate() + 1);
    }

    return { startDate, endDate, summary, trend, daysDiff };
  }, [reportType, selectedDate, attendance, lunch]);

  const totalPossible = students.length * (reportData?.daysDiff || 1);
  const attendancePercentage = totalPossible > 0 && reportData
    ? ((reportData.summary.present + reportData.summary.late) / totalPossible * 100).toFixed(1)
    : '0.0';

  if (!reportType || isChanging) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto py-10">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">เลือกประเภท<span className="text-blue-600">เอกสารรายงาน</span></h2>
          <p className="text-slate-500 font-medium">กรุณาเลือกรูปแบบรายงานที่ต้องการสรุปผลและส่งออกข้อมูล</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportSelectionCard 
            title="รายงานประจำวัน" 
            desc="สรุปสถิตินักเรียนมาเรียนรายชั้นและสรุปการมาเรียนรายบุคคลประจำวัน"
            icon={FileText}
            onClick={() => { setReportType('daily'); setIsChanging(false); }}
            color="emerald"
          />
          <ReportSelectionCard 
            title="รายงานประจำสัปดาห์" 
            desc="วิเคราะห์แนวโน้มการมาเรียนในรอบ 7 วันที่ผ่านมาพร้อมสรุปภาพรวม"
            icon={Calendar}
            onClick={() => { setReportType('weekly'); setIsChanging(false); }}
            color="blue"
          />
          <ReportSelectionCard 
            title="รายงานประจำเดือน" 
            desc="รายงานสรุปยอดการมาเรียนสะสมรายเดือนเพื่อใช้ประกอบการประเมิน"
            icon={Briefcase}
            onClick={() => { setReportType('monthly'); setIsChanging(false); }}
            color="violet"
          />
          <ReportSelectionCard 
            title="รายงานรายภาคเรียน" 
            desc="สรุปสถิติภาพรวมตลอดภาคเรียนเพื่อบันทึกลงในระบบฐานข้อมูลกลาง"
            icon={CheckCircle}
            onClick={() => { setReportType('semester'); setIsChanging(false); }}
            color="indigo"
          />
        </div>

        {onNavigate && (
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <FileSpreadsheet size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 text-base">กำลังค้นหาแบบฟอร์มเทมเพลต Excel?</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">ดาวน์โหลดเทมเพลตสำหรับนำเข้าข้อมูลนักเรียน การเช็คชื่อ และรายงานอื่น ๆ ในรูปแบบ Excel</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('templates')}
              className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-200 flex items-center gap-2 whitespace-nowrap group active:scale-95"
            >
              ดูเทมเพลต Excel ทั้งหมด
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsChanging(true)}
            className="group flex items-center gap-3 bg-white border border-slate-200 pl-3 pr-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <Filter size={16} className="text-blue-600 group-hover:rotate-180 transition-transform duration-500" />
            เปลี่ยนประเภทรายงาน
          </button>
          
          <div className="h-8 w-px bg-slate-200" />
          
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {reportType === 'daily' ? 'รายวัน' : reportType === 'weekly' ? 'รายสัปดาห์' : reportType === 'monthly' ? 'รายเดือน' : 'รายภาคเรียน'}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 md:flex-none bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 translate-y-0 active:translate-y-0.5">
            <Printer size={16} />
            PRINT
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={reportType + selectedDate}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Summary Report */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
               {reportData && (
                <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                        สรุปผล<span className="text-blue-600">
                          {reportType === 'daily' ? 'รายวัน' : reportType === 'weekly' ? 'รายสัปดาห์' : reportType === 'monthly' ? 'รายเดือน' : 'รายภาคเรียน'}
                        </span>
                      </h3>
                      <p className="text-slate-400 text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
                        <Calendar size={14} className="text-blue-500" />
                        {new Date(reportData.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {reportType !== 'daily' && (
                          <> <ArrowRight size={14} /> {new Date(reportData.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} </>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                      <div className="text-center">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance Rate</div>
                          <div className="text-3xl font-black text-blue-600 leading-none">{attendancePercentage}%</div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                          <CheckCircle size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <ReportStat value={reportData.summary.present} label="มา" color="emerald" icon={CheckCircle} />
                    <ReportStat value={reportData.summary.sick} label="ป่วย" color="blue" icon={AlertCircle} />
                    <ReportStat value={reportData.summary.personal} label="กิจ" color="indigo" icon={Briefcase} />
                    <ReportStat value={reportData.summary.late} label="สาย" color="amber" icon={Clock} />
                    <ReportStat value={reportData.summary.absent} label="ขาด" color="rose" icon={XCircle} />
                    <ReportStat value={reportData.summary.lunch} label="อาหาร" color="violet" icon={FileText} />
                  </div>
                </div>
               )}
            </div>

            {/* Performance Chart */}
            {(reportType === 'weekly' || reportType === 'monthly' || reportType === 'semester') && reportData && (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h4 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar size={18} />
                  </div>
                  สถิติการมาเรียนรายวันในช่วงเวลา
                </h4>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportData.trend}>
                        <defs>
                          <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReport)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Detailed Table */}
            {reportData && (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <h4 className="font-black text-slate-800 tracking-tight">แจกแจงตามรายชื่อนักเรียน</h4>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-slate-200">
                    Data Range: {reportData.startDate} - {reportData.endDate}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">นักเรียน</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">มาปกติ</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ป่วย/กิจ</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ขาด/สาย</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.slice(0, 15).map(s => {
                        const sAtt = attendance.filter(a => a.studentId === s.id && a.date >= reportData.startDate && a.date <= reportData.endDate);
                        const p = sAtt.filter(a => a.status === 'present').length;
                        const l = sAtt.filter(a => a.status === 'sick' || a.status === 'personal').length;
                        const a = sAtt.filter(a => a.status === 'absent' || a.status === 'late').length;
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ชั้น {s.grade}/{s.room}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-center">
                                <span className="text-sm font-black text-emerald-600">{p}</span>
                            </td>
                            <td className="px-8 py-4 text-center">
                                <span className="text-sm font-black text-blue-600">{l}</span>
                            </td>
                            <td className="px-8 py-4 text-center">
                                <span className="text-sm font-black text-rose-500">{a}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Side Info */}
          {reportData && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                <h4 className="font-black text-xl mb-6 flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Briefcase size={20} />
                  </div>
                  Business Case
                </h4>
                <div className="space-y-6 relative z-10">
                  <ReportInsight 
                    title="Analysis" 
                    desc={`ในช่วงสัปดาห์นี้มีการลาป่วยเฉลี่ย ${((reportData.summary.sick / reportData.daysDiff) || 0).toFixed(1)} คนต่อวัน`}
                    color="blue"
                  />
                  <ReportInsight 
                    title="Observation" 
                    desc={reportData.summary.absent > 0 ? "สถิติการขาดเรียนควรได้รับการตรวจสอบสาเหตุเป็นรายบุคคล" : "ยอดยอดการเข้าเรียนอยู่ในเกณฑ์ดีเยี่ยม"}
                    color="emerald"
                  />
                </div>
                <Download size={140} className="absolute -left-12 -bottom-12 text-white/5 pointer-events-none" />
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs tracking-widest text-slate-400">Export Report</h4>
                <div className="grid grid-cols-1 gap-3">
                  <ExportButton icon={FileText} label="Export CSV" />
                  <ExportButton icon={Download} label="Download PDF" primary />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ReportSelectionCard({ title, desc, icon: Icon, onClick, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <button 
      onClick={onClick}
      className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left flex flex-col gap-6"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 ${colors[color]}`}>
        <Icon size={32} />
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generate Report</span>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ChevronRight size={20} />
        </div>
      </div>
    </button>
  );
}


function ReportInsight({ title, desc, color }: any) {
  const colors: any = {
    blue: 'border-blue-500',
    emerald: 'border-emerald-500'
  };
  return (
    <div className={`border-l-4 pl-4 space-y-1 ${colors[color]}`}>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</div>
      <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function ExportButton({ icon: Icon, label, primary }: any) {
  return (
    <button className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
      primary 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700' 
        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
    }`}>
      <Icon size={14} />
      {label}
    </button>
  );
}

function ReportStat({ value, label, color, icon: Icon }: any) {
  const colors: any = {
    emerald: 'text-emerald-600 bg-emerald-50/50',
    blue: 'text-blue-600 bg-blue-50/50',
    indigo: 'text-indigo-600 bg-indigo-50/50',
    amber: 'text-amber-600 bg-amber-50/50',
    rose: 'text-rose-600 bg-rose-50/50',
    violet: 'text-violet-600 bg-violet-50/50',
  };

  return (
    <div className={`p-4 rounded-3xl ${colors[color]} flex flex-col items-center justify-center text-center gap-1`}>
      <Icon size={14} strokeWidth={3} />
      <div className="text-lg font-black tracking-tighter leading-none mt-1">{value}</div>
      <div className="text-[8px] font-black uppercase tracking-tighter opacity-60">{label}</div>
    </div>
  );
}

