/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Check, X, Clock, Thermometer, UserPlus, Heart, MinusCircle, Calendar as CalendarIcon, FilterX, List } from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';
import AttendanceCalendar from './AttendanceCalendar';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  isTeacher?: boolean;
}

export default function AttendanceView({ students, attendance, setAttendance, isTeacher }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [filterRoom, setFilterRoom] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'ALL'>('ALL');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.date === viewDate && a.studentId === studentId);
      if (existingIdx > -1) {
        const newArr = [...prev];
        newArr[existingIdx] = { ...newArr[existingIdx], status };
        return newArr;
      }
      return [...prev, { id: crypto.randomUUID(), date: viewDate, studentId, status }];
    });
  };

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.date === viewDate && a.studentId === studentId)?.status || 'none';
  };

  const filteredStudents = students.filter(s => {
    const status = getStatus(s.id);
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'ALL' || s.grade === filterGrade;
    const matchesRoom = filterRoom === 'ALL' || s.room === filterRoom;
    const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
    
    return matchesSearch && matchesGrade && matchesRoom && matchesStatus;
  });

  const grades = Array.from(new Set(students.map(s => s.grade)));
  const rooms = Array.from(new Set(
    students
      .filter(s => filterGrade === 'ALL' || s.grade === filterGrade)
      .map(s => s.room)
  )).sort();

  const resetFilters = () => {
    setSearchTerm('');
    setFilterGrade('ALL');
    setFilterRoom('ALL');
    setFilterStatus('ALL');
    setViewDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-3">
             {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาชื่อนักเรียน..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Date Picker */}
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <input
                type="date"
                className="pl-10 pr-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={viewDate}
                onChange={(e) => setViewDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isTeacher && (
              <select 
                className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={filterGrade}
                onChange={(e) => {
                  setFilterGrade(e.target.value);
                  setFilterRoom('ALL');
                }}
              >
                <option value="ALL">ทุกระดับชั้น</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}

            <div className="flex gap-2 w-full md:w-auto">
              <select 
                className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer w-full"
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
              >
                <option value="ALL">{isTeacher ? 'ทุกห้องในชั้นเรียน' : 'ทุกห้อง'}</option>
                {rooms.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
              </select>
            </div>

            <select 
              className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="present">มาเรียน</option>
              <option value="sick">ลาป่วย</option>
              <option value="personal">ลากิจ</option>
              <option value="absent">ขาดเรียน</option>
              <option value="late">มาสาย</option>
              <option value="none">ยังไม่ได้ระบุ</option>
            </select>

            <button 
              onClick={resetFilters}
              className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
              title="ล้างตัวกรอง"
            >
              <FilterX size={20} />
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            แสดง {filteredStudents.length} รายการ จากทั้งหมด {students.length} นักเรียน
          </p>
          <div className="flex gap-4">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List size={14} /> LIST
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <CalendarIcon size={14} /> CALENDAR
              </button>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <SummaryBadge count={filteredStudents.filter(s => getStatus(s.id) === 'present').length} color="emerald" label="มา" />
            <SummaryBadge count={filteredStudents.filter(s => ['sick', 'personal'].includes(getStatus(s.id))).length} color="blue" label="ลา" />
            <SummaryBadge count={filteredStudents.filter(s => getStatus(s.id) === 'absent').length} color="rose" label="ขาด" />
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">นักเรียน</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ชั้น/ห้อง</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">บันทึกสถานะวันที่ {new Date(viewDate).toLocaleDateString('th-TH')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const status = getStatus(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs uppercase shadow-sm transition-colors ${
                              status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                              status === 'absent' ? 'bg-rose-50 text-rose-600' :
                              status === 'none' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase">
                            {student.grade}/{student.room}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <StatusButton 
                              active={status === 'present'} 
                              onClick={() => updateAttendance(student.id, 'present')}
                              color="emerald"
                              label="มา"
                              icon={Check}
                            />
                            <StatusButton 
                              active={status === 'sick'} 
                              onClick={() => updateAttendance(student.id, 'sick')}
                              color="blue"
                              label="ลาป่วย"
                              icon={Thermometer}
                            />
                            <StatusButton 
                              active={status === 'personal'} 
                              onClick={() => updateAttendance(student.id, 'personal')}
                              color="indigo"
                              label="ลากิจ"
                              icon={Heart}
                            />
                            <StatusButton 
                              active={status === 'absent'} 
                              onClick={() => updateAttendance(student.id, 'absent')}
                              color="rose"
                              label="ขาด"
                              icon={X}
                            />
                            <StatusButton 
                              active={status === 'late'} 
                              onClick={() => updateAttendance(student.id, 'late')}
                              color="amber"
                              label="มาสาย"
                              icon={Clock}
                            />
                            <StatusButton 
                              active={status === 'none' || !status} 
                              onClick={() => updateAttendance(student.id, 'none')}
                              color="slate"
                              label="ไม่ระบุ"
                              icon={MinusCircle}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                           <Search size={32} />
                         </div>
                         <p className="text-slate-400 font-bold italic text-sm">
                           ไม่พบข้อมูลที่ตรงตามเงื่อนไขการค้นหา
                         </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AttendanceCalendar 
          students={filteredStudents} 
          attendance={attendance.filter(a => filteredStudents.some(s => s.id === a.studentId))} 
        />
      )}
    </div>
  );
}

function StatusButton({ active, onClick, color, label, icon: Icon }: any) {
  const colors: any = {
    emerald: active ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600',
    amber: active ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-white text-slate-400 hover:bg-amber-50 hover:text-amber-600',
    blue: active ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600',
    indigo: active ? 'bg-indigo-500 text-white shadow-indigo-200' : 'bg-white text-slate-400 hover:bg-indigo-50 hover:text-indigo-600',
    rose: active ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600',
    slate: active ? 'bg-slate-500 text-white shadow-slate-200' : 'bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600',
  };

  return (
    <button 
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all duration-200 border ${active ? 'border-transparent shadow-lg scale-110 z-10' : 'border-slate-100 opacity-60 hover:opacity-100'} ${colors[color]}`}
    >
      <Icon size={12} strokeWidth={4} />
      {label}
    </button>
  );
}

function SummaryBadge({ count, label, color }: any) {
  const colors: any = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    rose: 'text-rose-600'
  };
  return (
    <div className={`text-[10px] font-black flex items-center gap-1.5 ${colors[color]}`}>
      <span className="opacity-50">{label}:</span>
      <span className="text-sm tracking-tight">{count}</span>
    </div>
  );
}
