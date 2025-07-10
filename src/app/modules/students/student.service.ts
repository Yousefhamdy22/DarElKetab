import { Injectable } from '@angular/core';

import { Observable,  map,throwError as rxjsThrowError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Student, StudentPayload } from './student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {


   private readonly apiBaseurl = `${environment.apiUrl}`;
  
      constructor(private http: HttpClient) {}
  
      // Get all groups
      // student.service.ts
      // getStudents(): Observable<Student[]> {
      //   return this.http.get<any>(`${this.apiBaseurl}/Students`).pipe(
      //     tap(response => {
      //       console.log('Complete API response:', response);
      //       console.log('First student object:', response.data[0]);
      //       console.log('Object keys:', Object.keys(response.data[0]));
      //     }),
      //     map(response => response.data)
      //   );
      // }
      getStudents(): Observable<Student[]> {
          return this.http.get<Student[]>(`${this.apiBaseurl}/Students`).pipe(

            
            catchError(error => {
              
              console.error('Error fetching groups:', error);
              return throwError(error);
            })
          );
        }
  
      // Get a specific group by ID
      getStudentById(studentID: number): Observable<Student> {
        return this.http.get<{success: boolean, message: string, data: Student}>(`${this.apiBaseurl}/Students/${studentID}`)
          .pipe(
            map(response => response.data), // Extract the data property
            catchError(err => {
              console.error('API Error:', err);
              return throwError(() => new Error('Failed to load student'));
            })
          );
      }
      
  
      // Create a new group
      createStudent(payload: StudentPayload): Observable<Student> {
       
        return this.http.post<Student>(this.apiBaseurl + '/Students', payload)
          .pipe(
            catchError(error => {
              console.error('Error creating student:', error);
              return throwError(() => error);
            })
          );
      }
    

      addStudent(formDataStu: FormData): Observable<Student> {
        return this.http.post<Student>(`${this.apiBaseurl}/Students`, formDataStu).pipe(
          tap((response: any) => {
            console.log('Student added successfully:', response);
          }),
          catchError(error => {
            console.error('Error adding student:', error);
            return throwError(() => error);
          })
        );
      }
      private formatDate(date: any): string {
        if (!date) return '';
        // If it's already a Date object
        if (date instanceof Date) {
          return date.toISOString();
        }
        // If it's a string that can be converted to Date
        if (typeof date === 'string') {
          return new Date(date).toISOString();
        }
        return '';
      }
  
      // Update an existing group
      updateStudent(id:number, formData : FormData ): Observable<Student> {
          return this.http.put<Student>(`${this.apiBaseurl}/Students/${id}`, formData).pipe(
         
            catchError(error => {
              console.error('Error updating student:', error);
              return throwError(() => error);
            }
          )
       
        );
      }
      
      // Delete a group
      deleteStudent(id: number): Observable<any> {
          return this.http.delete(`${this.apiBaseurl}/Students/${id}`);
      }
  
      // getGroupWithStudents(groupId: number): Observable<Student> {
      //     return this.http.get<Student>(`${this.apiBaseurl}/Students/${groupId}/with-students`).pipe(
      //       catchError(error => {
      //         console.error('Error fetching group students:', error);
      //         return throwError(error);
      //       })
      //     );
  
      // }

      getGroupWithStudents(groupId: number): Observable<any> {
        return this.http.get(`${this.apiBaseurl}/Groups/${groupId}/with-students`);
      }
      
 
}

function throwError(error: any): Observable<never> {
  console.error('An error occurred:', error.message || error);
  return rxjsThrowError(() => new Error(error.message || 'An unknown error occurred'));
}

