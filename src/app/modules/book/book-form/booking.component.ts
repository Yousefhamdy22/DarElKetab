// booking.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin, finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { 
  BookingService, 
  // Subject as BookingSubject, 
  // Teacher, 
  BookingRequest, 
  // Booking 
} from '../book.service';
import { Teacher, TeacherStatus
 } from '../../teacher/teacher.model';
 import { Booking } from '../book.models';
import { StudentService } from '../../students/student.service';
import { TeacherService } from '../../teacher/teacher.service';
import { Group } from '../../groups/group.models';

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
 
})
export class BookingComponent implements OnInit, OnDestroy {
  bookingForm: FormGroup;
  minDate = new Date();
  isLoading = false;
  isSubmitting = false;
  groups: any[] = [];
  // Destroy subject for unsubscribing
  private destroy$ = new Subject<void>();
  

  teachers: Teacher[] = [];
  availableTeachers: Teacher[] = [];
  availableTimeSlots: string[] = [];
  availableGroups: Group[] = []; // Populate this with your groups data
  selectedGroup!: Group;
  // Static options
  genderOptions = [
    { label: 'ذكر', value: 'male' },
    { label: 'أنثى', value: 'female' }
  ];

  educationStages = [
    { label: 'الابتدائية', value: 'primary' },
    { label: 'المتوسطة', value: 'middle' },
   
  ];

  grades = [
    { label: 'الأول', value: '1' },
    { label: 'الثاني', value: '2' },
    { label: 'الثالث', value: '3' },
    { label: 'الرابع', value: '4' },
    { label: 'الخامس', value: '5' },
    { label: 'السادس', value: '6' }
  ];

  defaultTimeSlots = [
    { label: '08:00 - 09:00', value: '08:00-09:00' },
    { label: '09:00 - 10:00', value: '09:00-10:00' },
    { label: '10:00 - 11:00', value: '10:00-11:00' },
    { label: '11:00 - 12:00', value: '11:00-12:00' },
    { label: '14:00 - 15:00', value: '14:00-15:00' },
    { label: '15:00 - 16:00', value: '15:00-16:00' },
    { label: '16:00 - 17:00', value: '16:00-17:00' },
    { label: '17:00 - 18:00', value: '17:00-18:00' }
  ];

  selectedTeacher: Teacher | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingService,
 
    private studentService: StudentService,
    private teacherService: TeacherService,
    private messageService: MessageService
  ) {
    this.bookingForm = this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private createForm(): FormGroup {
    return this.fb.group({
      // Student Information
      studentName: ['', [Validators.required, Validators.minLength(2)]],
      studentPhone: ['', [Validators.required, Validators.pattern(/^05[0-9]{8}$/)]],
      studentGender: ['', Validators.required],
      educationStage: ['', Validators.required],
      grade: ['', Validators.required],
      
      // Booking Information
      teacherId: ['', Validators.required],
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    forkJoin({
      teachers: this.teacherService.getAllTeachers()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data: { teachers: Teacher[] }) => {
        this.availableTeachers = data.teachers;
      },
      error: (error: any) => {
        console.error('Error loading initial data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل البيانات'
        });
      }
    });
  }

  private setupFormSubscriptions(): void {
    // Watch for teacher selection changes
    this.bookingForm.get('teacherId')?.valueChanges.subscribe(teacherId => {
      if (teacherId) {
        this.selectedTeacher = this.availableTeachers.find(t => t.teacherId === +teacherId) || null;
        this.loadAvailableTimeSlots();
      } else {
        this.selectedTeacher = null;
        this.availableTimeSlots = [];
      }
      // Reset time slot when teacher changes
      this.bookingForm.get('timeSlot')?.setValue('');
    });

    // Watch for date changes
    this.bookingForm.get('date')?.valueChanges.subscribe(() => {
      this.loadAvailableTimeSlots();
      this.bookingForm.get('timeSlot')?.setValue('');
    });
  }

  private loadAvailableTimeSlots(): void {
    const teacherId = this.bookingForm.get('teacherId')?.value;
    const date = this.bookingForm.get('date')?.value;
    
    if (teacherId && date) {
      // TODO: Implement API call to get available time slots for a teacher and date
      this.availableTimeSlots = [];
      // Example: this.teacherService.getAvailableTimeSlots(teacherId, date).subscribe({ ... })
    } else {
      this.availableTimeSlots = [];
    }
  }

  // private async getOrCreateStudent(): Promise<number> {
  //   const studentData = {
  //     name: this.bookingForm.get('studentName')?.value,
  //     phone: this.bookingForm.get('studentPhone')?.value,
  //     gender: this.bookingForm.get('studentGender')?.value,
  //     educationStage: this.bookingForm.get('educationStage')?.value,
  //     grade: this.bookingForm.get('grade')?.value
  //   };

  //   // try {
  //   //   // First, try to find existing student by phone
  //   //   // const existingStudent = await this.studentService.getStudentByPhone(studentData.phone).toPromise();
      
  //   //   if (existingStudent) {
  //   //     // Update existing student if needed
  //   //     const updatedStudent = await this.studentService.updateStudent(existingStudent.id, studentData).toPromise();
  //   //     return updatedStudent.id;
  //   //   } else {
  //   //     // Create new student
  //   //     const newStudent = await this.studentService.createStudent(studentData).toPromise();
  //   //     return newStudent.id;
  //   //   }
  //   // } catch (error) {
  //   //   console.error('Error handling student:', error);
  //   //   throw new Error('فشل في معالجة بيانات الطالب');
  //   // }
  // }

  // private loadInitialData() {
  //   this.isLoading = true;
    
  //   // Load subjects
  //   this.bookingService.getSubjects()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (subjects) => {
  //         this.subjects = subjects;
  //       },
  //       error: (error) => {
  //         this.showError('فشل في تحميل المواد');
  //         console.error('Error loading subjects:', error);
  //       }
  //     });

  //   // Load all teachers initially
  //   this.bookingService.getTeachers()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (teachers) => {
  //         this.teachers = teachers;
  //         this.isLoading = false;
  //       },
  //       error: (error) => {
  //         this.showError('فشل في تحميل المعلمين');
  //         console.error('Error loading teachers:', error);
  //         this.isLoading = false;
  //       }
  //     });
  // }


  get amount() {
    return this.bookingForm.get('amount');
  }
  
  get paidAmount() {
    return this.bookingForm.get('paidAmount');
  }
  // private setupFormSubscriptions() {
  //   // Watch for subject changes
  //   this.bookingForm.get('subjectId')?.valueChanges
  //     .pipe(
  //       takeUntil(this.destroy$),
  //       debounceTime(300),
  //       distinctUntilChanged()
  //     )
  //     .subscribe(subjectId => {
  //       // this.onSubjectChange(subjectId);
  //     });

  //   // Watch for teacher changes
  //   this.bookingForm.get('teacherId')?.valueChanges
  //     .pipe(
  //       takeUntil(this.destroy$),
  //       debounceTime(300),
  //       distinctUntilChanged()
  //     )
  //     .subscribe(teacherId => {
  //       this.onTeacherChange(teacherId);
  //     });

  //   // Watch for date changes
  //   this.bookingForm.get('date')?.valueChanges
  //     .pipe(
  //       takeUntil(this.destroy$),
  //       debounceTime(300),
  //       distinctUntilChanged()
  //     )
  //     .subscribe(date => {
  //       this.onDateChange(date);
  //     });
  // }


  private onTeacherChange(teacherId: string) {
    if (!teacherId) {
      this.selectedTeacher = null;
      return;
    }

    this.selectedTeacher = this.availableTeachers.find(t => t.teacherId.toString() === teacherId) || null;
    
    // Load available time slots if date is also selected
    const selectedDate = this.bookingForm.get('date')?.value;
    if (selectedDate) {
      // this.loadAvailableTimeSlots(teacherId, selectedDate);
    }
  }
  get groupId() {
    return this.bookingForm.get('groupId');
  }
  private onDateChange(date: string) {
    if (!date) {
      this.availableTimeSlots = [];
      return;
    }

    const teacherId = this.bookingForm.get('teacherId')?.value;
    if (teacherId) {
      // this.loadAvailableTimeSlots(teacherId, date);
    } else {
      // If no teacher selected, show default time slots
      this.availableTimeSlots = this.defaultTimeSlots.map(slot => slot.value);
    }
  }

  // private loadAvailableTimeSlots(teacherId: string, date: string) {
  //   this.bookingService.getAvailableTimeSlots(teacherId, date)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (slots) => {
  //         this.availableTimeSlots = slots;
  //         // Reset time slot if current selection is not available
  //         const currentTimeSlot = this.bookingForm.get('timeSlot')?.value;
  //         if (currentTimeSlot && !slots.includes(currentTimeSlot)) {
  //           this.bookingForm.get('timeSlot')?.setValue('');
  //         }
  //       },
  //       error: (error) => {
  //         // Fallback to default slots if API fails
  //         this.availableTimeSlots = this.defaultTimeSlots.map(slot => slot.value);
  //         console.error('Error loading available slots:', error);
  //       }
  //     });
  // }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  getTimeSlotLabel(value: string): string {
    const slot = this.defaultTimeSlots.find(s => s.value === value);
    return slot ? slot.label : value;
  }

  onSubmit() {
    if (this.bookingForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData: BookingRequest = this.bookingForm.value;
      
      // Validate data
      const validationErrors = this.bookingService.validateBookingData(formData);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => this.showError(error));
        this.isSubmitting = false;
        return;
      }

      // Create booking
      this.bookingService.createBooking(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (booking) => {
            this.showSuccess('تم إنشاء الحجز بنجاح!');
            
            // Navigate to booking card with the new booking
            setTimeout(() => {
              this.router.navigate(['/booking-card'], { 
                queryParams: { bookingId: booking.id } 
              });
            }, 1500);
          },
          error: (error) => {
            this.showError('فشل في إنشاء الحجز. يرجى المحاولة مرة أخرى.');
            console.error('Error creating booking:', error);
            this.isSubmitting = false;
          }
        });
    } else {
      this.markAllFieldsAsTouched();
      this.showError('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
    }
  }

  resetForm() {
    this.bookingForm.reset();
    // this.selectedSubject = null;
    this.selectedTeacher = null;
    this.availableTeachers = [];
    this.availableTimeSlots = [];
    this.isSubmitting = false;
  }

  navigateToBookingList() {
    this.router.navigate(['/bookings']);
  }

  navigateToBookingCard() {
    this.router.navigate(['/booking-card']);
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.bookingForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'نجح',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message,
      life: 5000
    });
  }

  // private showInfo(message: string) {
  //   this.messageService.add({
  //     severity: 'info',
  //     summary: 'معلومات',
  //     detail: message,
  //     life: 3000
  //   });
  // }

  // Form validation getters
  get studentName() { return this.bookingForm.get('studentName'); }
  get studentPhone() { return this.bookingForm.get('studentPhone'); }
  get studentGender() { return this.bookingForm.get('studentGender'); }
  get educationStage() { return this.bookingForm.get('educationStage'); }
  get grade() { return this.bookingForm.get('grade'); }
  get subjectId() { return this.bookingForm.get('subjectId'); }
  get teacherId() { return this.bookingForm.get('teacherId'); }
  get date() { return this.bookingForm.get('date'); }
  get timeSlot() { return this.bookingForm.get('timeSlot'); }
  get notes() { return this.bookingForm.get('notes'); }
}