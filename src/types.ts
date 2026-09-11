/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AttendanceStatus = 'present' | 'sick' | 'personal' | 'absent' | 'late' | 'none';

export interface Student {
  id: string;
  name: string;
  grade: string;
  room: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  assignedClass?: {
    grade: string;
    room: string;
  };
}

export interface AttendanceRecord {
  id: string;
  date: string; 
  studentId: string;
  status: AttendanceStatus;
}

export interface LunchRecord {
  id: string;
  date: string;
  studentId: string;
  hadLunch: boolean;
}

export interface AIInsight {
  date: string;
  summary: string;
  recommendations: string[];
  attendanceTrend: string;
  lunchAnalysis: string;
}

export interface DailyStats {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  sick: number;
  personalLeave: number;
  none: number;
  lunchCount: number;
}
