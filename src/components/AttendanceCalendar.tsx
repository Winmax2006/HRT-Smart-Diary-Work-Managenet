/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Clock, 
  Activity,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { th } from 'date-fns/locale';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
}

export default function AttendanceCalendar({ students, attendance }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const attendanceByDate = useMemo(() => {
    const map: Record<string, { present: number; absent: number; late: number; leave: number; total: number }> = {};
    
    // Filter attendance for the current month interval
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    attendance.forEach(record => {
      if (record.date >= startStr && record.date <= endStr) {
        if (!map[record.date]) {
          map[record.date] = { present: 0, absent: 0, late: 0, leave: 0, total: 0 };
        }
        map[record.date].total++;
        if (record.status === 'present') map[record.date].present++;
        else if (record.status === 'absent') map[record.date].absent++;
        else if (record.status === 'late') map[record.date].late++;
        else if (['sick', 'personal'].includes(record.status)) map[record.date].leave++;
      }
    });
    return map;
  }, [attendance, startDate, endDate]);

  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
      {/* Calendar Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: th })}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Monthly Attendance Overview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md transition-all text-slate-500 hover:text-blue-600"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md transition-all text-slate-500 hover:text-blue-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="py-4 text-center">
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'
            }`}>
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, idx) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayStats = attendanceByDate[dateStr];
          const isSelectedMonth = isSameMonth(date, monthStart);
          const isTodayDate = isToday(date);

          // Calculate attendance percentage for heat mapping
          const attendanceRate = dayStats && dayStats.total > 0 
            ? (dayStats.present / dayStats.total) * 100 
            : null;

          return (
            <div 
              key={idx} 
              className={`min-h-[120px] p-2 border-r border-b border-slate-50 transition-colors relative group ${
                !isSelectedMonth ? 'bg-slate-50/30' : 'bg-white'
              } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isTodayDate ? 'bg-blue-600 text-white' : 
                  !isSelectedMonth ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {format(date, 'd')}
                </span>
                
                {attendanceRate !== null && isSelectedMonth && (
                  <div className={`w-2 h-2 rounded-full shadow-sm ${
                    attendanceRate >= 90 ? 'bg-emerald-500' : 
                    attendanceRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                )}
              </div>

              {dayStats && isSelectedMonth && (
                <div className="space-y-1.5 mt-2">
                  <DayStatItem icon={Check} count={dayStats.present} color="emerald" />
                  <DayStatItem icon={Activity} count={dayStats.leave} color="blue" />
                  <DayStatItem icon={X} count={dayStats.absent} color="rose" />
                  <DayStatItem icon={Clock} count={dayStats.late} color="amber" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-6 items-center justify-center">
        <LegendItem icon={Check} color="emerald" label="มาเรียน" />
        <LegendItem icon={Activity} color="blue" label="ลากิจ/ป่วย" />
        <LegendItem icon={X} color="rose" label="ขาดเรียน" />
        <LegendItem icon={Clock} color="amber" label="มาสาย" />
        <div className="h-4 w-px bg-slate-200 mx-2" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ความหนาแน่น:</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-rose-500" title="< 70%" />
            <div className="w-3 h-3 rounded-full bg-amber-500" title="70-90%" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" title="> 90%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DayStatItem({ icon: Icon, count, color }: any) {
  if (count === 0) return null;
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className={`flex items-center justify-between px-2 py-0.5 rounded-lg text-[10px] font-black ${colors[color]}`}>
      <div className="flex items-center gap-1">
        <Icon size={10} />
      </div>
      <span>{count}</span>
    </div>
  );
}

function LegendItem({ icon: Icon, color, label }: any) {
  const colors: any = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tight ${colors[color]}`}>
      <Icon size={12} />
      {label}
    </div>
  );
}
