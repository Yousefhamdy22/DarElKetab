import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher } from './teacher.model';
import { environment } from '../../../../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class TeacherService {


  private apiBadeUrl =  `${environment.apiUrl}/Teachers`;

  constructor(private http: HttpClient) {}

  getAllTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiBadeUrl);
  }

  getTeacherById(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiBadeUrl}/${id}`);
  }

  createTeacher(teacher: FormData): Observable<Teacher> {
    return this.http.post<Teacher>(this.apiBadeUrl, teacher);
  }

  updateTeacher(id: string, teacher: Partial<Teacher>): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiBadeUrl}/${id}`, teacher);
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBadeUrl}/${id}`);
  }
}