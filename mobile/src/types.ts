// Formato dos dados que vêm da API

export type AttendanceType = 'OFFICE' | 'REMOTE' | 'ABSENCE';

export interface User {
  id: number;
  name: string;
  email: string;
  targetPercent: number;
}

export interface Attendance {
  id: number;
  date: string; // "2026-11-15"
  type: AttendanceType;
  note: string;
}

export interface MonthlySummary {
  month: string;
  referenceDate: string;
  eligibleDays: number;
  officeDays: number;
  requiredDays: number;
  remainingDays: number;
  attendancePercent: number | null;
  targetPercent: number;
  targetReached: boolean;
}
