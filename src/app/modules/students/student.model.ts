import { Attendance } from "../attendance/models";
import { Group } from "../groups/group.models";

export interface Student {
    
    studentID: number;
    name: string;
    birthDate?: Date;
    gender: string;
    phoneNumber: string;
    groupIds:number[],
    stage:number,
    stageLevel:string,
    notes?: string;
    status?: string; 
    registrationDate: Date;
    isActive: boolean;
    groupID?: number;
    studentCode:string;
    group?: Group;
    attendances?: Attendance[];
    examResults?: any[];
    exams?: {
      name: string;
      subject: string;
      date: string;
      grade: number;
      teacher: string;
      type: string;
    }[];









    // totalDays: number; // Add this property
    // attendanceDays: number;
    // excusedAbsences: number;
    // absences?: number;
    // quranProgress?: {
    //   memorizedPercentage: number;
    //   memorizedParts: number;
    //   // other properties
    // };




    //
    selected?: boolean; 
   
  }


  export interface StudentPayload {
    studentID: number;
    name: string;
    birthDate?: Date;
    gender: string;
    address?: string;
    phoneNumber: string;
   
    registrationDate: Date;
    groupID?: number;
    group?: Group;
  
  }


  export interface StudentAttendance {
    studentId: number;
    status: string;
    notes: string;
    readingQuality: number;
  }
    
