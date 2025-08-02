import { Attendance } from "../attendance/models";
import { Student } from "../students/student.model"
import { Teacher } from "../teacher/teacher.model";

export interface Group {
  groupID: number; 
  groupName: string;
  description?: string;
  teacherId: number;
  teacher?: Teacher;
  scheduleDay: string,
  maxStudentNumber: number;
  stage:string,
  stageLevel:string,
  // startDate: Date;
  // endDate: Date;
  createdAt: Date;
  students?: Student[];
  exams?: any[]; 
  notes?: string[]; // Array of notes
  Stutass?: string; //
  attendancePercentage?: number; //
  attendances?: {
    studentID: number;
    attendanceDate: Date;
    attendancePercentage: number;
    status: "present" | "absent" | "excused" | "none";
    notes?: string; // Optional notes property
  }[];
  currentStudents?: number; // 
  schedule?: string; //
  active?: boolean; //
  fees: number;//

}


 
export interface GroupApi {
  groupId: number;
  groupName: string;
  teacherId: string;
  teacherName: string;
  maxCapacity: number;
  memberCount: number;
  scheduleDays: any[];
  status: string;
  educationStage: string;
  gradeLevel: number;
  createdAt: string;
}
  export interface ApiResponse<T> {
    success: boolean;
    message: string | null;
    data: T;
    errors: any | null;
  }
  export interface ReadingSession {
    // ====== New API Response Fields ======
    readingSessionId: number;
    date: Date;
    sessionType: string;
    surahName: string;
    sessionResult: string;
    sessionStatus: string;
    startAyah: number;
    endAyah: number;
    notes: string;
    groupId: number;
    groupName: string;
  
    // ====== Legacy Fields from Old Model ======
    readingMaterial?: string;
    attendeesCount?: number;
    totalStudents?: number;
    attendanceRate?: number;
    averageReading?: number;
    attendees?: Student[];
  }
  
  