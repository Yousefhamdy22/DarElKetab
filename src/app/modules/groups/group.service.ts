import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";


import { environment } from "../../../../environment/environment";
import { Group , ApiResponse } from "./group.models";
import { Observable, throwError as rxjsThrowError } from "rxjs";
import { catchError } from "rxjs/operators";


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

}
function throwError(errorFactory: () => Error): Observable<never> {
    return rxjsThrowError(errorFactory);
}


