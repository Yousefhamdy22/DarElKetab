import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environment/environment';
import { ReadingSession } from './group.models';

@Injectable({
  providedIn: 'root'
})
export class ReadSessionService {

  private readonly apiBaseUrl = `${environment.apiUrl}/ReadingSessions`;

  constructor(private http: HttpClient) {}

  
  getAllReadSessions(): Observable<ReadingSession[]> {
    return this.http.get<ReadingSession[]>(this.apiBaseUrl).pipe(
      catchError(this.handleError)
    );
  }

 
  getSessionById(id: number): Observable<ReadingSession> {
    return this.http.get<ReadingSession>(`${this.apiBaseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
 
  addSessionAttendance(sessionId: number, attendanceRecords: any[]): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/${sessionId}/attendance`, attendanceRecords);
  }
  
  addSession(session: ReadingSession): Observable<ReadingSession> {
    return this.http.post<ReadingSession>(this.apiBaseUrl, session).pipe(
      catchError(this.handleError)
    );
  }

  
  updateSession(id: number, session: ReadingSession): Observable<ReadingSession> {
    return this.http.put<ReadingSession>(`${this.apiBaseUrl}/${id}`, session).pipe(
      catchError(this.handleError)
    );
  }

 
  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() =>
      new Error(error.error?.message || 'Server error occurred. Please try again later.')
    );
  }
}
