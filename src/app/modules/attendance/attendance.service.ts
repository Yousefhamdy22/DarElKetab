// services/attendance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient ,HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable , catchError, throwError} from 'rxjs';
import { 
  
  StudentAttendanceSummary,
  GroupAttendanceSummary,
  Attendance ,
  GroupAttendanceResponse
} from  '../attendance/models';

import { Group } from '../groups/group.models';
import { Teacher } from '../teacher/teacher.model';
import { Student } from '../students/student.model';

import { environment } from '../../../../environment/environment';
import { AuthService } from '../../auth/services/AuthService.service';
import { Route, Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly apiBaseurl = '${environment.apiUrl}';


  constructor(private http: HttpClient,
    private authService: AuthService,
    private router: Router
             

  ) { }

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
 

  saveGroupAttendance(command: any): Observable<GroupAttendanceResponse> {
    const url = `${environment.apiUrl}/Attendance/record-group`;
    
    // Let the interceptor handle the auth header
    return this.http.post<GroupAttendanceResponse>(url, command).pipe(
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          // Trigger token refresh or logout
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  // saveGroupAttendance(command: any): Observable<GroupAttendanceResponse> {
  //   const url = `${environment.apiUrl}/Attendance/record-group`;
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${this.getAuthToken()}`
  //   });
    
  //   return this.http.post<GroupAttendanceResponse>(url, command, { headers });
  // }

  private getAuthToken(): string {
    // Get token from where you store it (localStorage, cookie, etc.)
    return localStorage.getItem('authToken') || '';
  }

// saveGroupAttendance(
//   command: any
// ): Observable<GroupAttendanceResponse> {
//   const url = `${environment.apiUrl}/Attendance/record-group`;
  
//   return this.http.post<GroupAttendanceResponse>(url, command);
// }


// saveGroupAttendance(data: any[], date: Date, sessionId: number): Observable<any> {
//   const url = `${environment.apiUrl}/Attendance/record-group`;
//   const payload = {
//     groupId: data[0]?.groupId,
//     sessionId: sessionId,
//     date: date.toISOString(),
//     markedBy: this.authService.getUserId(), // Get from auth service
//     records: data.map(record => ({
//       studentId: record.studentId,
//       studentName: record.studentName || 'Unknown', // Ensure this exists
//       studentCode: record.studentCode || '',
//       attendanceStatus: record.attendanceStatus,
//       notes: record.notes || '',
//       recentAttendance: record.recentAttendance || []
//     }))
//   };
  
//   return this.http.post(url, payload);
// }

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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // You can add more specific messages based on status codes
      if (error.status === 400) {
        errorMessage = 'Bad request. Please check your data.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}