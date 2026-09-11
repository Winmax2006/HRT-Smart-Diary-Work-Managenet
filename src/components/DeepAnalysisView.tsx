/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight,
  User,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AttendanceRecord } from '../types';
import { generateDeepAnalysis } from '../services/geminiService';

interface Props {
  students: Student[];
  attendance: AttendanceRecord[];
}

export default function DeepAnalysisView({ students, attendance }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateDeepAnalysis(students, attendance);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message === "Missing Gemini API Key" 
        ? "กรุณาตั้งค่า GEMINI_API_KEY ใน Environment Variables" 
        : "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!analysis) runAnalysis();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <ShieldAlert size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tight">การวิเคราะห์เชิงลึก <span className="text-blue-400">AI</span></h2>
            </div>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
              วิเคราะห์พฤติกรรมการมาเรียนเพื่อค้นหานักเรียนที่มีความเสี่ยง หรือมีความผิดปกติของการมาเรียนต่อเนื่องด้วยระบบประมวลผลอัจฉริยะ Gemini
            </p>
          </div>
          <button 
            onClick={runAnalysis}
            disabled={loading}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              loading ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-900 hover:bg-blue-50 hover:scale-105 active:scale-95'
            }`}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'กำลังวิเคราะห์...' : 'เริ่มการวิเคราะห์ใหม่'}
          </button>
        </div>
        <Zap size={240} className="absolute -right-20 -bottom-20 text-white/5 pointer-events-none" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">AI กำลังประมวลผลพฤติกรรมรายบุคคล...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center">
           <AlertTriangle className="mx-auto text-rose-500 mb-4" size={48} />
           <p className="text-rose-600 font-bold">{error}</p>
        </div>
      ) : analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Risk List */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 pl-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              รายการนักเรียนที่ควรเฝ้าติดตาม
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {analysis.flaggedStudents.map((item: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-2 h-full ${
                    item.severity === 'HIGH' ? 'bg-rose-500' : 
                    item.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                            item.severity === 'HIGH' ? 'bg-rose-50 text-rose-600' : 
                            item.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            <User size={24} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-lg">{item.studentName}</h4>
                            <div className="flex items-center gap-2">
                               <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                 item.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 
                                 item.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                               }`}>Risk: {item.severity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                        <span className="font-black text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Risk Pattern Found</span>
                        {item.riskPattern}
                      </div>
                    </div>

                    <div className="w-full md:w-80 bg-blue-600/5 rounded-3xl p-5 border border-blue-600/10 space-y-3">
                       <h5 className="flex items-center gap-2 text-blue-800 font-black text-[10px] uppercase tracking-widest">
                         <Lightbulb size={14} /> AI Recommendation
                       </h5>
                       <p className="text-xs text-blue-900 leading-relaxed font-medium">
                         {item.advice}
                       </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {analysis.flaggedStudents.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-12 text-center text-emerald-800">
                  <ShieldAlert size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-black text-xl mb-2">ไม่พบนักเรียนที่มีความเสี่ยง</p>
                  <p className="text-sm opacity-70">พฤติกรรมการมาเรียนของนักเรียนทุกคนอยู่ในเกณฑ์ปกติ</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Info */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-blue-500" />
                    Overall Behavior Trend
                  </h4>
                  <p className="text-sm text-slate-700 font-bold leading-relaxed">
                    {analysis.generalTrend}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" />
                    Strategic Advice
                  </h4>
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-xs text-amber-900 font-medium leading-relaxed">
                    {analysis.systemAdvice}
                  </div>
                </div>
             </div>

             <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                <Info className="mb-4 text-blue-300" size={32} />
                <h4 className="font-black text-lg mb-2 relative z-10">เงื่อนไขการวิเคราะห์</h4>
                <p className="text-blue-100 text-xs leading-relaxed relative z-10">
                  ระบบวิเคราะห์จากสถิติย้อนหลัง 30 วัน โดยพิจารณาจาก:
                  <br/>• การขาดเรียนสะสมครบ 3 ครั้ง
                  <br/>• การลาต่อเนื่องเกิน 3 วัน
                  <br/>• ความผิดปกติของเวลาการเข้าเรียน (สายต่อเนื่อง)
                  <br/>• การเปลี่ยนแปลงพฤติกรรมฉับพลัน
                </p>
                <ShieldAlert size={120} className="absolute -right-8 -bottom-8 text-white/10" />
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Lightbulb({ size, className }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
