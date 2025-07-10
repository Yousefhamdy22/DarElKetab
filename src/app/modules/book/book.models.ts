import { Group } from "../groups/group.models"
import { Student } from "../students/student.model";
import { Teacher } from "../teacher/teacher.model";



export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled'
}

export interface Booking {
  id: number; 
  studentId: number;
  student?: Student;
  teacherId: number;
  teacher?: Teacher;
  groupId: number;
  group?: Group;  
  date: Date | string;
  groupTime: string;
  timeSlot: string; 
  status: BookingStatus; 
  bookingDate: Date | string; 
  notes?: string;
  fees: number;  
  paidAmount: number;  
  updatedAt: Date | string;
  
  // Calculated properties
  remainingAmount?: number;  
  isFullyPaid?: boolean;   
}

export interface BookingApiResponse {
  id: number;
  studentName: string;
  teacherName: string;
  groupName: string;
  date: string;
  groupTime: string;
  timeSlot: string;
  status: BookingStatus;
  bookingDate: string;
  notes?: string;
  fees: number;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBookingRequest {
  teacherId: number;
  groupId: number;
  date: string | Date;
  groupTime: string;
  timeSlot: string;
  status: string;
  notes?: string;
  fees: number;
  paidAmount: number;
}











// export interface Student {
//   id: string
//   name: string
//   email: string
//   phone: string
//   studentId: string
//   avatar?: string
// }

// export interface Teacher {
//   id: string
//   name: string
//   email: string
//   subject: string
//   avatar?: string
// }

// export interface Subject {
//   id: string
//   name: string
//   code: string
//   description: string
//   duration: number
// }