// booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environment/environment';
import { Booking } from './book.models';
import { Teacher } from '../teacher/teacher.model';
export interface BookingRequest {
  studentName: string;
  studentPhone: string;
  studentGender: 'male' | 'female';
  educationStage: string;
  grade: string;
  subjectId: number;
  teacherId: string;
  date: string;
  timeSlot: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiBadeUrl =  `${environment.apiUrl}`;

  
  // State management
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  public bookings$ = this.bookingsSubject.asObservable();
  
  private selectedBookingSubject = new BehaviorSubject<Booking | null>(null);
  public selectedBooking$ = this.selectedBookingSubject.asObservable();

  constructor(private http: HttpClient) {}


  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiBadeUrl}/Booking`)  // Direct array, no ApiResponse wrapper
      .pipe(
        map(response => {
          this.bookingsSubject.next(response);
          return response;
        }),
        catchError(this.handleError)
      );
  }
 
  // getBookings(): Observable<Booking[]> {
  //   return this.http.get<ApiResponse<Booking[]>>(`${this.apiBadeUrl}/Booking`)
  //     .pipe(
  //       map(response => {
  //         if (response.success) {
  //           this.bookingsSubject.next(response.data);
  //           return response.data;
  //         }
  //         throw new Error(response.message || 'Failed to fetch bookings');
  //       }),
  //       catchError(this.handleError)
  //     );
  // }

  /**
   * Get booking by ID
   */
  getBookingById(id: string): Observable<Booking> {
    return this.http.get<ApiResponse<Booking>>(`${this.apiBadeUrl}/Booking/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch booking');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Create new booking
   */
  createBooking(bookingData: BookingRequest): Observable<Booking> {
    return this.http.post<ApiResponse<Booking>>(`${this.apiBadeUrl}/Booking`, bookingData)
      .pipe(
        map(response => {
          if (response.success) {
            // Update local state
            const currentBookings = this.bookingsSubject.value;
            this.bookingsSubject.next([...currentBookings, response.data]);
            return response.data;
          }
          throw new Error(response.message || 'Failed to create booking');
        }),
        catchError(this.handleError)
      );
  }

 
  updateBooking(id: Number, bookingData: Partial<BookingRequest>): Observable<Booking> {
    return this.http.put<ApiResponse<Booking>>(`${this.apiBadeUrl}/Booking/${id}`, bookingData)
      .pipe(
        map(response => {
          if (response.success) {
            // Update local state
            const currentBookings = this.bookingsSubject.value;
            const updatedBookings = currentBookings.map(booking => 
              booking.id === id ? response.data : booking
            );
            this.bookingsSubject.next(updatedBookings);
            return response.data;
          }
          throw new Error(response.message || 'Failed to update booking');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete booking
   */
  deleteBooking(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiBadeUrl}/Booking/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            // Update local state
            const currentBookings = this.bookingsSubject.value;
            const filteredBookings = currentBookings.filter(booking => booking.id !== id);
            this.bookingsSubject.next(filteredBookings);
            return true;
          }
          throw new Error(response.message || 'Failed to delete booking');
        }),
        catchError(this.handleError)
      );
  }


  getTeachers(): Observable<Teacher[]> {
    return this.http.get<ApiResponse<Teacher[]>>(`${this.apiBadeUrl}/teachers`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch teachers');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get teachers by subject
   */
  getTeachersBySubject(subjectId: number): Observable<Teacher[]> {
    return this.http.get<ApiResponse<Teacher[]>>(`${this.apiBadeUrl}/teachers/by-subject/${subjectId}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch teachers');
        }),
        catchError(this.handleError)
      );
  }

  
   
  setSelectedBooking(booking: Booking | null): void {
    this.selectedBookingSubject.next(booking);
  }

  /**
   * Get current selected booking
   */
  getSelectedBooking(): Booking | null {
    return this.selectedBookingSubject.value;
  }

  /**
   * Generate booking card data for printing
   */
  generateBookingCard(bookingId: string): Observable<Booking> {
    return this.getBookingById(bookingId).pipe(
      map(booking => {
        this.setSelectedBooking(booking);
        return booking;
      })
    );
  }

  // Utility methods
  
  /**
   * Format date for Arabic locale
   */
  formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Generate booking reference ID
   */
  generateBookingReference(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BK${year}${month}${day}${random}`;
  }


  validateBookingData(data: BookingRequest): string[] {
    const errors: string[] = [];
    
    if (!data.studentName || data.studentName.trim().length < 2) {
      errors.push('اسم الطالب مطلوب ويجب أن يكون حرفين على الأقل');
    }
    
    if (!data.studentPhone || !/^05[0-9]{8}$/.test(data.studentPhone)) {
      errors.push('رقم الهاتف غير صحيح');
    }
    
    if (!data.studentGender) {
      errors.push('الجنس مطلوب');
    }
    
    if (!data.educationStage) {
      errors.push('المرحلة الدراسية مطلوبة');
    }
    
    if (!data.grade) {
      errors.push('الصف مطلوب');
    }
    
    if (!data.subjectId) {
      errors.push('المادة مطلوبة');
    }
    
    if (!data.teacherId) {
      errors.push('المعلم مطلوب');
    }
    
    if (!data.date) {
      errors.push('التاريخ مطلوب');
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('لا يمكن اختيار تاريخ في الماضي');
      }
    }
    
    if (!data.timeSlot) {
      errors.push('الوقت مطلوب');
    }
    
    return errors;
  }

  private handleError = (error: any): Observable<never> => {
    console.error('API Error:', error);
    throw error;
  };
}