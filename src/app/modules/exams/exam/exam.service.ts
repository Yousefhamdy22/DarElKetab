// exam.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { exam , ExamPayload } from './exam.model';
import { Group } from '../../groups/group.models';
@Injectable({ providedIn: 'root' })
export class ExamService {
  
     private readonly apiBaseurl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  createExam(payload: ExamPayload): Observable<exam> {
    return this.http.post<exam>(`${this.apiBaseurl}/Exams`, payload);
  }

  getExamById(examID: number): Observable<any> {
    return this.http.get(`${this.apiBaseurl}/Exams/${examID}`);
  }

  getallExams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseurl}/Exams`);
    }

    updateExam(payload: ExamPayload): Observable<any> {
    return this.http.put(`${this.apiBaseurl}/Exams/${payload.examID}`, payload);
    }

    deeleteExam(examID: number): Observable<any> {
    return this.http.delete(`${this.apiBaseurl}/Exams/${examID}`);
    }

  saveExamResults(results: any[]): Observable<any> {
    return this.http.post(`${this.apiBaseurl}/results`, { results });
  }

  getExamByGroupId(groupId: number): Observable<exam[]> {
    return this.http.get<any[]>(`${this.apiBaseurl}/Exams/by-group/${groupId}`);
  }

}

// student.service.ts
