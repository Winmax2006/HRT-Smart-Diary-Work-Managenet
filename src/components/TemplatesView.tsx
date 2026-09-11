/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Users, 
  Calendar, 
  Coffee, 
  BookOpen, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface Template {
  id: string;
  title: string;
  desc: string;
  icon: any;
  filename: string;
  color: string;
  columns: string[];
  sampleData: string[][];
  note: string;
}

export default function TemplatesView() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const templates: Template[] = [
    {
      id: 'students',
      title: 'เทมเพลตนำเข้าข้อมูลนักเรียน',
      desc: 'ใช้สำหรับกรอกรายชื่อนักเรียนทั้งหมดเพื่อนำเข้า (Import) เข้าสู่ระบบพร้อมกันในคราวเดียว',
      icon: Users,
      filename: 'student_import_template.csv',
      color: 'blue',
      columns: ['เลขประจำตัวนักเรียน', 'ชื่อ-นามสกุล', 'ชั้นเรียน', 'ห้อง'],
      sampleData: [
        ['1001', 'เด็กชายสมชาย รักเรียน', 'ป.1', '1/1'],
        ['1002', 'เด็กหญิงสมหญิง มานะ', 'ป.1', '1/1'],
        ['1003', 'เด็กชายมานะ อดทน', 'ป.1', '1/2']
      ],
      note: 'รองรับชั้นเรียน เช่น ป.1, ป.2 และห้องเรียน เช่น 1/1, 1/2'
    },
    {
      id: 'attendance',
      title: 'เทมเพลตบันทึกการมาเรียนประจำวัน',
      desc: 'ใช้บันทึกเวลาเรียนแบบออฟไลน์รายวัน สำหรับอัปโหลดข้อมูลเช็คชื่อแบบกลุ่ม',
      icon: Calendar,
      filename: 'attendance_record_template.csv',
      color: 'emerald',
      columns: ['วันที่ (ปี-เดือน-วัน)', 'เลขประจำตัวนักเรียน', 'ชื่อ-นามสกุล', 'สถานะ'],
      sampleData: [
        ['2026-05-15', '1001', 'เด็กชายสมชาย รักเรียน', 'present'],
        ['2026-05-15', '1002', 'เด็กหญิงสมหญิง มานะ', 'sick'],
        ['2026-05-15', '1003', 'เด็กชายมานะ อดทน', 'late']
      ],
      note: 'สถานะที่รองรับ: present (มา), sick (ลาป่วย), personal (ลากิจ), late (สาย), absent (ขาด)'
    },
    {
      id: 'lunch',
      title: 'เทมเพลตบันทึกการรับอาหารกลางวัน',
      desc: 'เทมเพลตมาตรฐานในการตรวจนับและรายงานการรับประทานอาหารกลางวันโครงการรัฐบาล',
      icon: Coffee,
      filename: 'lunch_record_template.csv',
      color: 'amber',
      columns: ['วันที่ (ปี-เดือน-วัน)', 'เลขประจำตัวนักเรียน', 'ชื่อ-นามสกุล', 'รับประทานอาหาร (ทาน/ไม่ทาน)'],
      sampleData: [
        ['2026-05-15', '1001', 'เด็กชายสมชาย รักเรียน', 'ทาน'],
        ['2026-05-15', '1002', 'เด็กหญิงสมหญิง มานะ', 'ทาน'],
        ['2026-05-15', '1003', 'เด็กชายมานะ อดทน', 'ไม่ทาน']
      ],
      note: 'ใช้เพื่อยืนยันการรับงบประมาณค่าอาหารกลางวันรายบุคคล'
    },
    {
      id: 'grades',
      title: 'เทมเพลตบันทึกคะแนนและเกรดเฉลี่ย',
      desc: 'ใช้ในการบันทึกคะแนนสอบสะสมและผลการเรียนรายวิชาเพื่อเตรียมส่งออกรายงานทางการ',
      icon: BookOpen,
      filename: 'academic_grades_template.csv',
      color: 'violet',
      columns: ['เลขประจำตัวนักเรียน', 'ชื่อ-นามสกุล', 'คะแนนเก็บ', 'คะแนนสอบกลางภาค', 'คะแนนสอบปลายภาค', 'เกรดเฉลี่ย'],
      sampleData: [
        ['1001', 'เด็กชายสมชาย รักเรียน', '50', '20', '25', '4.0'],
        ['1002', 'เด็กหญิงสมหญิง มานะ', '48', '18', '22', '3.5']
      ],
      note: 'ช่วงคะแนนเก็บ 0-50, สอบกลางภาค 0-20, ปลายภาค 0-30 และเกรด 0-4'
    }
  ];

  const handleDownload = (template: Template) => {
    setDownloading(template.id);
    
    // Create CSV content with BOM so Excel reads Thai characters perfectly
    const headerRow = template.columns.join(',');
    const dataRows = template.sampleData.map(row => row.join(',')).join('\n');
    const csvContent = '\uFEFF' + headerRow + '\n' + dataRows;

    // Create blob & trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', template.filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(null);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
            <FileSpreadsheet size={36} className="text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3">
            ดาวน์โหลดเทมเพลต Excel
          </h2>
          <p className="text-blue-50 text-lg font-medium leading-relaxed">
            เลือกดาวน์โหลดแบบฟอร์มเอกสาร Excel (.csv/xlsx) เพื่อใช้นำเข้าข้อมูลนักเรียน บันทึกเวลาเรียน และรายงานผลออฟไลน์อย่างเป็นระบบ
          </p>
        </div>
        <FileSpreadsheet size={300} className="absolute -right-20 -bottom-20 text-white/5 pointer-events-none" />
      </div>

      {/* Guide message */}
      <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-blue-900 text-sm">ข้อแนะนำในการใช้งานไฟล์นำเข้าข้อมูล</h4>
          <p className="text-blue-800/80 text-xs leading-relaxed">
            เพื่อความถูกต้องของข้อมูล กรุณาอย่าแก้ไขหัวตาราง (Header) ของเทมเพลต และแนะนำให้ตรวจสอบรูปแบบตัวสะกด ชื่อชั้นเรียน (เช่น ป.1) และชื่อห้องเรียน (เช่น 1/1) ให้ตรงกับฐานข้อมูลก่อนนำเข้าสู่ระบบเสมอ
          </p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <motion.div 
            key={tpl.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  tpl.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  tpl.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  tpl.color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                  'bg-violet-50 text-violet-600 border border-violet-100'
                }`}>
                  <tpl.icon size={26} />
                </div>
                
                <span className="bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200/50">
                  Excel compatible
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                {tpl.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {tpl.desc}
              </p>

              {/* Columns list */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">โครงสร้างคอลัมน์ในไฟล์:</div>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.columns.map((col, index) => (
                    <span key={index} className="text-xs bg-white text-slate-700 font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Note */}
              <div className="text-xs text-slate-400 font-bold flex items-center gap-2 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                {tpl.note}
              </div>
            </div>

            <div>
              <button 
                onClick={() => handleDownload(tpl)}
                disabled={downloading === tpl.id}
                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                  downloading === tpl.id 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-98 shadow-lg shadow-slate-200'
                }`}
              >
                {downloading === tpl.id ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-500 animate-bounce" />
                    กำลังดาวน์โหลดไฟล์...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    ดาวน์โหลดเทมเพลต (.csv / xls)
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
