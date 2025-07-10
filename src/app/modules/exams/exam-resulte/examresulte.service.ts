import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environment/environment';
import { ExamResultDto, ExamResultStatsDto } from './examresult.model';
@Injectable({ providedIn: 'root' })


export class ExamResulteService {
  
     private readonly apiBaseurl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}
 


  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // Client-side or network error
      console.error('Client-side error:', error.error);
      return throwError(() => new Error('حدث خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.'));
    } else {
    
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
      
    
      switch (error.status) {
        case 400:
          return throwError(() => new Error('طلب غير صالح: ' + (error.error?.detail || 'بيانات غير صالحة')));
        case 401:
          return throwError(() => new Error('غير مصرح: يرجى تسجيل الدخول أولاً'));
        case 404:
          return throwError(() => new Error('لم يتم العثور على النتائج'));
        case 409:
          return throwError(() => new Error('تعارض: ' + (error.error?.detail || 'النتيجة موجودة مسبقاً')));
        case 500:
          return throwError(() => new Error('خطأ في الخادم: ' + (error.error?.detail || 'حدث خطأ غير متوقع')));
        default:
          return throwError(() => new Error('حدث خطأ غير متوقع'));
      }
    }
  }

  // Get all exam results
  getAllExamResults(): Observable<ExamResultDto[]> {
    return this.http.get<ExamResultDto[]>(this.apiBaseurl).pipe(
      catchError(this.handleError)
    );
  }

  // Get exam result by ID
  getExamResultById(id: number): Observable<ExamResultDto> {
    return this.http.get<ExamResultDto>(`${this.apiBaseurl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new exam result
  createExamResult(dto: ExamResultDto): Observable<ExamResultDto> {
    return this.http.post<ExamResultDto>(this.apiBaseurl, dto).pipe(
      catchError(this.handleError)
    );
  }

  // Update an existing exam result
  updateExamResult(id: number, dto: ExamResultDto): Observable<void> {
    return this.http.put<void>(`${this.apiBaseurl}/${id}`, dto).pipe(
      catchError(this.handleError)
    );
  }

  // Delete an exam result
  deleteExamResult(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseurl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get results by exam ID
  getResultsByExam(examId: number): Observable<ExamResultDto[]> {
    return this.http.get<ExamResultDto[]>(`${this.apiBaseurl}/exam/${examId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get exam statistics
  getExamStatistics(examId: number): Observable<ExamResultStatsDto> {
    return this.http.get<ExamResultStatsDto>(`${this.apiBaseurl}/exam/${examId}/statistics`).pipe(
      catchError(this.handleError)
    );
  }
}
