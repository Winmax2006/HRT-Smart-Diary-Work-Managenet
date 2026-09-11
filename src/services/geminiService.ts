/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { DailyStats, Student, AttendanceRecord, LunchRecord } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function generateDailyInsights(
  stats: DailyStats,
  students: Student[],
  attendance: AttendanceRecord[],
  lunch: LunchRecord[]
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing Gemini API Key");
  }

  const prompt = `
    You are an AI School Administrator. Analyze the following daily school statistics and provide management insights.
    
    Daily Stats (Date: ${stats.date}):
    - Total Students: ${stats.totalStudents}
    - Present: ${stats.present}
    - Absent: ${stats.absent}
    - Late: ${stats.late}
    - Sick: ${stats.sick}
    - Personal Leave: ${stats.personalLeave}
    - Unspecified: ${stats.none}
    - Lunch Consumption: ${stats.lunchCount}
    
    Context (Past 30 Days):
    - Historical Attendance: ${JSON.stringify(attendance)}
    - Historical Lunch: ${JSON.stringify(lunch)}
    
    Please provide:
    1. A concise summary of today's performance compared to the 30-day average.
    2. A deep analysis of attendance trends (e.g., persistent absenteeism, specific days with low attendance).
    3. An evaluation of lunch participation patterns.
    4. 3-5 strategic recommendations for school management based on these long-term patterns.
    5. Future Predictions: Use the 30-day trend to forecast attendance and lunch demand for the next 7 days, considering any cyclical patterns.
    
    Respond in Thai as requested by the user interface language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            attendanceTrend: { type: Type.STRING },
            lunchAnalysis: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            predictions: {
              type: Type.OBJECT,
              properties: {
                attendance: { type: Type.STRING },
                lunch: { type: Type.STRING }
              },
              required: ["attendance", "lunch"]
            }
          },
          required: ["summary", "attendanceTrend", "lunchAnalysis", "recommendations", "predictions"]
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
}

export async function generateDeepAnalysis(
  students: Student[],
  attendance: AttendanceRecord[]
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing Gemini API Key");
  }

  const prompt = `
    You are an AI School Behavioral Analyst. Identify students with concerning attendance patterns based on the provided data.
    
    Data to Analyze:
    - Students: ${JSON.stringify(students.map(s => ({ id: s.id, name: s.name, grade: s.grade, room: s.room })))}
    - Attendance History: ${JSON.stringify(attendance.slice(-300))} (past 30 days approx)
    
    Conditions to flag:
    1. Absences/Leaves reaching or exceeding 3 occurrences in a month.
    2. Consecutive absences (3+ days).
    3. Increasing frequency of 'late' or 'sick' leave.
    4. Sudden changes in attendance behavior.
    
    For each flagged student, provide:
    - Student Name
    - The Specific Risk/Trend found.
    - An AI-generated Advice for the teacher or parent (Thai language).
    
    Respond in Thai.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flaggedStudents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  studentName: { type: Type.STRING },
                  riskPattern: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                  advice: { type: Type.STRING }
                },
                required: ["studentName", "riskPattern", "severity", "advice"]
              }
            },
            generalTrend: { type: Type.STRING },
            systemAdvice: { type: Type.STRING }
          },
          required: ["flaggedStudents", "generalTrend", "systemAdvice"]
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Deep Analysis Error:", error);
    return null;
  }
}
