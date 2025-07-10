// export interface Student {
//     id: number;
//     name: string;
//     group: string;
//     absenceCount: number;
//     status?: string;
//     notes?: string;
//     initials?: string;
//   }

import { Group } from "../groups/group.models";
import { Student } from "../students/student.model";

  
//   export interface Group {
//     id: string
//       name: string
//       description: string
//       teacher: string
//       schedule: string
//       location: string // R
//       currentStudents: number
//       maxStudents: number
//       active: boolean
//   }
  
  // export interface Teacher {
  //   id: number;
  //   name: string;
  //   email?: string;
  // }
  
  export interface Attendance {

    id?: number;
    date: Date;
    status: string;
    notes: string;
    studentID: number;
    groupId: number;
    student?: Student;
    group?: Group;
    isPresent?: boolean;
    
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