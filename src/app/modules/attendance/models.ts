
import { Group } from "../groups/group.models";
import { Student } from "../students/student.model";

  export interface Attendance {

    id?: number;
    date: Date;
    status: string;
    notes: string;
    studentID: number;
    studentName: string;
    groupId: number;
    student?: Student;
    group?: Group;
    isPresent?: boolean;
    AttendanceStatus :[];
    
    
  }
  
  export interface StudentAttendance {
    studentId: number;
    status: string;
    notes?: string;

  }
  
  export interface AttendanceSummary {
    presentCount: number;
    absentCount: number;
    excusedCount: number;
    lateCount: number;
    totalCount: number;
  }
  
  export interface StudentAttendanceSummary {
    studentId: number;
    studentName: string;
    attendanceRecords: {
      date: Date;
      status: string;
      notes?: string;
    }[];
    summary: AttendanceSummary;
  }
  
  export interface GroupAttendanceSummary {
    groupId: number;
    groupName: string;
    dateRecords: {
      date: Date;
      presentCount: number;
      absentCount: number;
      excusedCount: number;
      lateCount: number;
      totalCount: number;
    }[];
    summary: AttendanceSummary;
  }

  export enum AttendanceStatus {
    Present = 0,
    Absent = 1,
    Late = 2,
    Excused = 3
  }
  
  export interface AttendanceHistoryDto {
    date: string;
    status: AttendanceStatus;
    sessionName: string;
  }
  
  export interface AttendanceRecordDto {
    studentId: number;
    studentName: string;
    studentCode?: string;
    attendanceStatus: AttendanceStatus;
    notes: string;
    recentAttendance: AttendanceHistoryDto[];
  }
  
  export interface GroupAttendanceRequest {
    groupId: number;
    date: string; // ISO string format
    sessionId: number; // Added based on your Attendance model
    markedBy: string;
    records: AttendanceRecordDto[];
  }
  
  export interface GroupAttendanceResponse {
    success: boolean;
    message?: string;
    attendanceIds?: number[]; // Return IDs of created records
  }