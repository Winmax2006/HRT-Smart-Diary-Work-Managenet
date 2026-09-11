/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  RefreshCw, 
  Database, 
  ExternalLink, 
  Link2, 
  CheckCircle2, 
  AlertTriangle,
  FileJson,
  Globe,
  Settings,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SyncView() {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>({
    'moe': 'idle',
    'obec': 'idle',
    'dpa': 'idle'
  });

  const handleSync = async (system: string) => {
    setSyncing(system);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncing(null);
    setStatus(prev => ({ ...prev, [system]: 'success' }));
    
    setTimeout(() => {
      setStatus(prev => ({ ...prev, [system]: 'idle' }));
    }, 3000);
  };

  const systems = [
    {
      id: 'moe',
      name: 'ระบบฐานข้อมูลกลางกระทรวงศึกษาธิการ (MOE)',
      icon: Globe,
      color: 'blue',
      description: 'เชื่อมโยงข้อมูลนักเรียนและครูรายบุคคลเพื่อการตรวจสอบตัวตน'
    },
    {
      id: 'obec',
      name: 'ระบบจัดเก็บข้อมูลนักเรียนรายบุคคล (DMC)',
      icon: Database,
      color: 'emerald',
      description: 'ส่งออกรายงานการมาเรียนเพื่อบันทึกในระบบ DMC รายภาคเรียน'
    },
    {
      id: 'dpa',
      name: 'ระบบประเมินวิทยฐานะดิจิทัล (DPA)',
      icon: CheckCircle2,
      color: 'violet',
      description: 'ส่งข้อมูลภาระงานสอนและการปฏิบัติงานจริงรายวัน'
    },
    {
      id: 'local',
      name: 'ระบบสารสนเทศภายในโรงเรียน (SIS Local)',
      icon: Link2,
      color: 'slate',
      description: 'ซิงค์ข้อมูลกับระบบบริหารจัดการโรงเรียนที่ใช้งานอยู่เดิม'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3">
            <RefreshCw className={syncing ? 'animate-spin' : ''} />
            เชื่อมโยงข้อมูล
          </h2>
          <p className="text-blue-100 text-lg font-medium leading-relaxed">
            บูรณาการข้อมูลร่วมกับหน่วยงานต้นสังกัดและระบบภายนอก เพื่อลดความซ้ำซ้อนในการบันทึกข้อมูลและเพิ่มความแม่นยำของรายงาน
          </p>
        </div>
        <Database size={280} className="absolute -right-20 -bottom-20 text-white/10 pointer-events-none" />
      </div>

      {/* Sync Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systems.map((system) => (
          <motion.div 
            key={system.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                system.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                system.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                system.color === 'violet' ? 'bg-violet-50 text-violet-600' : 'bg-slate-50 text-slate-600'
              }`}>
                <system.icon size={28} />
              </div>
              
              {status[system.id] === 'success' && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={12} />
                  Connected
                </div>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">
              {system.name}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              {system.description}
            </p>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleSync(system.id)}
                disabled={!!syncing}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                  syncing === system.id 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200'
                }`}
              >
                {syncing === system.id ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Sync Now
                  </>
                )}
              </button>
              
              <button className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
                <Settings size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Integration Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <AlertTriangle size={32} />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-black text-amber-900 text-lg uppercase tracking-tight">API และการรักษาความปลอดภัย</h4>
          <p className="text-amber-800/70 text-sm leading-relaxed">
            การเชื่อมโยงข้อมูลทั้งหมดกระทำผ่านโปรโตคอล TLS 1.3 และมีการตรวจสอบสิทธิ์ด้วยระบบ Token-based (JWT) ตามมาตรฐานความปลอดภัยของรัฐบาลอิเล็กทรอนิกส์
          </p>
        </div>
        <button className="bg-amber-100 text-amber-700 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-200 transition-all whitespace-nowrap">
          ดูข้อกำหนดการเชื่อมต่อ
        </button>
      </div>

      {/* File Export Alternative */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
            <FileJson size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Export to Other Formats</h3>
            <p className="text-[10px] text-slate-400 font-bold">ดาวน์โหลดข้อมูลเพื่อนำไปใช้แบบ Offline</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ExportButton label="Excel (.xlsx)" icon={ArrowRight} />
          <ExportButton label="CSV Files" icon={ArrowRight} />
          <ExportButton label="JSON Backup" icon={ArrowRight} />
        </div>
      </div>
    </div>
  );
}

function ExportButton({ label, icon: Icon }: any) {
  return (
    <button className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-blue-600 hover:border-blue-600 transition-all text-left">
      <span className="font-bold text-slate-600 text-sm group-hover:text-white transition-colors">{label}</span>
      <Icon size={16} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </button>
  );
}
