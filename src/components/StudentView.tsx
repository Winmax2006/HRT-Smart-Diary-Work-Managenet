/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Trash2, Edit3, Save, X, Search, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export default function StudentView({ students, setStudents }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({ name: '', grade: '', room: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = () => {
    if (!formData.name || !formData.grade || !formData.room) return;

    if (editingId) {
      setStudents(prev => prev.map(s => s.id === editingId ? { ...s, ...formData as Student } : s));
      setEditingId(null);
    } else {
      setStudents(prev => [...prev, { id: crypto.randomUUID(), ...formData as Student }]);
      setIsAdding(false);
    }
    setFormData({ name: '', grade: '', room: '' });
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setConfirmDeleteId(null);
  };

  const grades = Array.from(new Set(students.map(s => s.grade))).sort();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'ALL' || s.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ ชั้นเรียน..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-w-[140px]"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="ALL">ทุกชั้นเรียน</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus size={18} />
          เพิ่มนักเรียนใหม่
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              {editingId ? <Edit3 size={18} /> : <UserPlus size={18} />}
              {editingId ? 'แก้ไขข้อมูลนักเรียน' : 'ข้อมูลนักเรียนใหม่'}
            </h4>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">ชื่อ-นามสกุล</label>
              <input 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น สมชาย รักชาติ"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">ชั้นเรียน</label>
              <input 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.grade}
                onChange={e => setFormData({ ...formData, grade: e.target.value })}
                placeholder="เช่น ป.1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">ห้อง</label>
              <input 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                placeholder="เช่น 1/1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={18} />
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStudents.map(student => (
          <div 
            key={student.id} 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-bold text-slate-800">{student.name}</h5>
                  <p className="text-xs text-slate-500 font-medium">ชั้น {student.grade} | ห้อง {student.room}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { setEditingId(student.id); setFormData(student); }}
                  className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(student.id)}
                  className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span>Student ID: {student.id.slice(0, 8)}</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                  <AlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">ยืนยันการลบข้อมูล?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    คุณกำลังจะลบข้อมูลของ <span className="font-bold text-slate-800">
                      {students.find(s => s.id === confirmDeleteId)?.name}
                    </span> อย่างถาวร การดำเนินการนี้ไม่สามารถย้อนกลับได้
                  </p>
                </div>
                <div className="flex gap-3 w-full pt-4">
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    onClick={() => deleteStudent(confirmDeleteId)}
                    className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 transition-all"
                  >
                    ยืนยันการลบ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
