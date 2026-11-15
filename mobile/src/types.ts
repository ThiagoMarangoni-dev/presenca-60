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
