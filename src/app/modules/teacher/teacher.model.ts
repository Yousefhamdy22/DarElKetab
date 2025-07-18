import { Group } from "../groups/group.models";

export interface Teacher {
  teacherId: number;
  userId: string;
  name: string;
  groupName: string;
  phoneNumber: string;
  joinDate: Date;
  status: TeacherStatus;
  groupId:number;
  //user?: User; 
  groups?: Group[]; 
 // bookings?: Booking[]; 
}

export enum TeacherStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  OnLeave = 'OnLeave'
}
