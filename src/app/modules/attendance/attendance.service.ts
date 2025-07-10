// services/attendance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  
  StudentAttendanceSummary,
  GroupAttendanceSummary,
  Attendance
} from  '../attendance/models';
import { Group } from '../groups/group.models';
import { Teacher } from '../teacher/teacher.model';
import { Student } from '../students/student.model';



@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly apiBaseurl = '${environment.apiUrl}';


  constructor(private http: HttpClient) { }

  // Get all attendance records
  getAttendanceRecords(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiBaseurl}/Attendance`);
  }

  // Get a specific attendance record by ID
  getAttendanceRecord(id: number): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.apiBaseurl}/Attendance/${id}`);
  }
  createAttendanceRecord(data: Attendance): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiBaseurl}/Attendance`, data);
  }

  createGroupAttendance(data: Attendance[]): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(`${this.apiBaseurl}/Attendance/group`, data);
  }
  
  // Save group attendance (bulk save)
  saveGroupAttendance(data: Attendance[]): Observable<any> {
    return this.http.post(`${this.apiBaseurl}/Attendance/group`, data);
  }

  // Update an attendance record
  updateAttendanceRecord(id: number, data: Attendance): Observable<any> {
    return this.http.put(`${this.apiBaseurl}/Attendance/${id}`, data);
  }

  // Delete an attendance record
  deleteAttendanceRecord(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseurl}/Attendance/${id}`);
  }

  // Get attendance for a specific student
  getStudentAttendance(studentId: number): Observable<StudentAttendanceSummary> {
    return this.http.get<StudentAttendanceSummary>(`${this.apiBaseurl}/Attendance/student/${studentId}`);
  }

  // Get attendance for a specific group on a specific date
  getGroupAttendanceByDate(groupId: number, date: string): Observable<Attendance> {
    return this.http.get<Attendance>(
      `${this.apiBaseurl}/Attendance/group/${groupId}/date?date=${date}`
    );
  }

  // Get student attendance summary with statistics
  getStudentAttendanceSummary(studentId: number): Observable<StudentAttendanceSummary> {
    return this.http.get<StudentAttendanceSummary>(
      `${this.apiBaseurl}/Attendance/summary/student/${studentId}`
    );
  }

  // Get group attendance summary with statistics
  getGroupAttendanceSummary(groupId: number): Observable<GroupAttendanceSummary> {
    return this.http.get<GroupAttendanceSummary>(
      `${this.apiBaseurl}/Attendance/summary/group/${groupId}`
    );
  }

  // Helper methods (these would typically fetch from separate APIs but included here for completeness)
  // Get all student groups
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiBaseurl}/Groups`);
  }

  // Get all teachers
  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.apiBaseurl}/Teachers`);
  }

  // Get students by group
  getStudentsByGroup(groupId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiBaseurl}/Students/group/${groupId}`);
  }
}