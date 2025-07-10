import { Observable } from "rxjs";
import { SessionRequest, SessionSchedule } from "./sessionschedul.component";
import { ApiResponse } from "../groups/group.models";
import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';



@Injectable({
    providedIn: 'root'
  })
  export class SessionScheduleService {
  
  private apiBadeUrl =  `${environment.apiUrl}/SessionSchedule`;

  
    constructor(private http: HttpClient) {}
  
    getAllSessions(): Observable<SessionSchedule[]> {
      return this.http.get<SessionSchedule[]>(`${this.apiBadeUrl}`)
        .pipe(
          map(response => response),
          catchError(this.handleError)
        );
    }
    createSession(sessionData: SessionRequest): Observable<SessionSchedule> {
        return this.http.post<SessionSchedule>(`${this.apiBadeUrl}`, sessionData)
          .pipe(
            catchError(this.handleError)
          );
      }
    // createSession(sessionData: SessionRequest): Observable<SessionSchedule> {
    //   return this.http.post<ApiResponse<SessionSchedule>>(`${this.apiBadeUrl}/sessions`, sessionData)
    //     .pipe(
    //       map(response => response.data),
    //       catchError(this.handleError)
    //     );
    // }
  
    updateSession(id: number, sessionData: SessionRequest): Observable<SessionSchedule> {
      return this.http.put<ApiResponse<SessionSchedule>>(`${this.apiBadeUrl}/sessions/${id}`, sessionData)
        .pipe(
          map(response => response.data),
          catchError(this.handleError)
        );
    }
  
    deleteSession(id: number): Observable<void> {
      return this.http.delete<ApiResponse<void>>(`${this.apiBadeUrl}/sessions/${id}`)
        .pipe(
          map(() => undefined),
          catchError(this.handleError)
        );
    }
  
    private handleError(error: any): Observable<never> {
      console.error('Session service error:', error);
      throw error;
    }
}