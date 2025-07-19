import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";


import { environment } from "../../../../environment/environment";
import { Group , ApiResponse } from "./group.models";
import { Observable, throwError as rxjsThrowError } from "rxjs";
import { catchError, map, of, tap } from 'rxjs';

export interface groupFilterDto
{
  stageId: number | null;
  levelId: number | null;

}
export interface GroupResponseDto {
  groupId: number;
  teacherId: number;
  groupName: string;
  description: string;
  maxCapacity: number;
  startDate: string; // ISO format date string
  scheduleDay: string | null;
  startTime: string | null;
  status: 'Active' | 'Inactive' | 'Archived'; // Adjust based on possible status values
  createdAt: string; // ISO format date string
  educationStage: number; // Assuming this is an enum/numeric value
  gradeLevel: number;
  memberCount: number;
  teacherName: string | null;
  createdByUserName: string | null;
}

interface GroupFormData {
  teacherId: number;
  groupName: string;
  description: string;
  maxCapacity: number;
  startDate: string;
  scheduleDay: string;
  startTime: string;
  educationStage: string;
  gradeLevel: number;
  createdBy: string;
}
@Injectable({
    providedIn: "root",
})
export class GroupService {
    private readonly apiBaseurl = `${environment.apiUrl}/Groups`;
    

    constructor(private http: HttpClient) {}

    // Get all groups
    getGroups(): Observable<Group[]> {
        return this.http.get<Group[]>(`${this.apiBaseurl}`).pipe(
          catchError(error => {
            console.error('Error fetching groups:', error);
            return throwError(error);
          })
        );
      }
     
      // Service Method
getGroupForSesssion(): Observable<Group[]> {
  console.log('API URL:', this.apiBaseurl); // Debug: Check the URL
  
  return this.http.get<Group[]>(`${this.apiBaseurl}`).pipe(
    tap(response => {
      console.log('Raw backend response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));
    }),
    map(response => {
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object') {
        // If response is an object, check if data is nested
        const data = (response as any).data || (response as any).groups || (response as any).result;
        return Array.isArray(data) ? data : [];
      }
      return [];
    }),
    catchError(error => {
      console.error('Error in getGroups:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      return of([]); // Return empty array on error
    })
  );
}
    // Get a specific group by ID
    getGroup(id: number): Observable<Group> {
        return this.http.get<Group>(`${this.apiBaseurl}/${id}`);
    }

    // Create a new group
    createGroup(groupData: GroupFormData): Observable<Group> {
        return this.http.post<Group>(`${this.apiBaseurl}/Groups`, groupData);
    }
  
    updateGroup(id: number,groupData: GroupFormData): Observable<Group> {
        return this.http.put<Group>(`${this.apiBaseurl}/Groups/${id}`, groupData);
    }
    
    // Delete a group
    deleteGroup(id: number): Observable<any> {
        return this.http.delete(`${this.apiBaseurl}/Groups/${id}`);
    }

    getGroupWithStudents(groupId: number): Observable<ApiResponse<Group>> {
        return this.http.get<ApiResponse<Group>>(`${this.apiBaseurl}/${groupId}/with-students`).pipe(
          catchError(error => {
            console.error('Error fetching group students:', error);
            return throwError(() => new Error(this.getErrorMessage(error)));
          })
        );
      }
      
      private getErrorMessage(error: any): string {
        if (error.status === 404) return 'Group not found';
        if (error.status === 403) return 'Access denied';
        return 'Failed to load group data';
      }

    // In your group service


   getGroupByStudentId(studentId: number): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiBaseurl}/Groups/Student/${studentId}`);
   }
    // Get all teachers
    getTeachers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBaseurl}/Teachers`);
    }

    // Get a specific teacher by ID
    getTeacher(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiBaseurl}/Teachers/${id}`);
    }

    // Create a new teacher
    createTeacher(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiBaseurl}/Teachers`, data);
    }

    // Update an existing teacher
    updateTeacher(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiBaseurl}/Teachers/${id}`, data);
    }

    // Delete a teacher
    deleteTeacher(id: number): Observable<any> {
        return this.http.delete(`${this.apiBaseurl}/Teachers/${id}`);
    }

    // getGroupsByStageAndGrade
    //loadTeachersByGroup

 getGroupsByStageAndGrade(stage: string, stageLevel: string): Observable<Group[]> {
        return this.http.get<Group[]>(`${this.apiBaseurl}/by-stage-grade?stage=${stage}&stageLevel=${stageLevel}`);
    }
    // Booking/groups_
    getGropsByStageAndStageLevel(params?: groupFilterDto): Observable<GroupResponseDto[]> {
      const httpParams: any = {};
      if (params) {
        if (params.stageId !== null && params.stageId !== undefined) httpParams.stageId = params.stageId;
        if (params.levelId !== null && params.levelId !== undefined) httpParams.levelId = params.levelId;
      }
      return this.http.get<GroupResponseDto[]>('http://localhost:5079/api/Booking/groups', {
        params: httpParams,
      }).pipe(
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error(err));
        }),
      );
    }

    // getGropsByStageAndStageLevel(params?: groupFilterDto): Observable<GroupResponseDto> {
    //   // Remove nulls or convert to empty string
    //   const httpParams: any = {};
    //   if (params) {
    //     if (params.stageId !== null && params.stageId !== undefined) httpParams.stageId = params.stageId;
    //     if (params.levelId !== null && params.levelId !== undefined) httpParams.levelId = params.levelId;
    //   }
    //   return this.http
    //     .get<GroupResponseDto>(this.apiBaseurl + '/filter', {
    //       params: httpParams,
    //     })
    //     .pipe(
    //       catchError((err) => {
    //         console.log(err);
    //         return throwError(() => new Error(err));
    //       }),
    //     );
    // }

}
function throwError(errorFactory: () => Error): Observable<never> {
    return rxjsThrowError(errorFactory);
}


