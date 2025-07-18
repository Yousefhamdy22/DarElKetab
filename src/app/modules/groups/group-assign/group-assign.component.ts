import { Component, OnInit , } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { StudentService } from '../../students/student.service';
import { GroupService } from '../group.service';
import { Group , ReadingSession } from '../group.models';
import { exam  , ExamStats} from '../../exams/exam/exam.model';
import { Student } from '../../students/student.model';
import { ExamService } from '../../exams/exam/exam.service';
import { ReadSessionService } from '../ReadSession.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';



interface FilterOption {
  label: string;
  value: string;
}



interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  notes?: string;
}

interface ExamType {
  label: string;
  value: string;
}



@Component({
  selector: 'app-group-assign',
  templateUrl: './group-assign.component.html',
  styleUrl: './group-assign.component.css',
  providers: []
})
export class GroupAssignComponent implements OnInit {

   groupId: number = 0;
   groupAttendanceRate: number = 85; 
   group: Group | null = null;


   students: Student[] = [];
   absenceStats: Student[] = [];
   topStudents: Student[] = [];
 
   // Form controls
   studentSearchTerm = '';
   loading = false;

 


  selectedFilter: string | null = null; 
  selectedStudents: Student[] = []; 


  selectedTeacher: any = null;
  selectedLocation: any = null;


  //exam Data
  exams: exam[] = [];
  examResults: ExamResult[] = [];
  examStats!: ExamStats;
  selectedExam: exam | null = null;
  examSearchTerm = '';

  filteredStudents: any[] = [];
  studentForm!: FormGroup;
  showForm = false;

  newExam: Partial<exam> = {
    ExamDate: new Date(),
    totaldegree: 100,
    participants: []
  };
  
   // Dropdown options
   filterOptions: FilterOption[] = [
     { label: 'الأعلى حفظاً', value: 'highest-memorization' },
     { label: 'الأعلى تجويداً', value: 'highest-tajweed' },
     { label: 'الأعلى حضوراً', value: 'highest-attendance' },
     { label: 'الأقل حفظاً', value: 'lowest-memorization' },
     { label: 'الأقل تجويداً', value: 'lowest-tajweed' },
     { label: 'الأقل حضوراً', value: 'lowest-attendance' }
   ];
   
  
   
 
   
  
   
   examTypes: ExamType[] = [
     { label: 'اختبار حفظ', value: 'memorization' },
     { label: 'اختبار تجويد', value: 'tajweed' },
     { label: 'اختبار شامل', value: 'comprehensive' },
     { label: 'اختبار دوري', value: 'periodic' }
   ];
 
  
  
 
   // Session form
   sessionForm: FormGroup;


  noStudentsFound = false;
   // UI state
   examResultDialogVisible = false;
   newExamDialogVisible = false;
   selectedHistoryFilter: any = null;
   historyDateRange: Date[] | null = null;

  initForm() {
    this.studentForm = this.fb.group({
      // Personal Information Section
      studentID: [null, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      birthDate: [null],
      gender: ['', Validators.required],
      address: ['', Validators.maxLength(200)],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      // name: ['', Validators.maxLength(20)],
      notes: [''],
      status: ['active'],
      
      // Academic Information Section
      registrationDate: [new Date(), Validators.required],
      isActive: [true],
      groupID: [null],
      
      // Attendance Section
      totalDays: [0, [Validators.required, Validators.min(0)]],
      attendanceDays: [0, [Validators.required, Validators.min(0)]],
      excusedAbsences: [0, [Validators.required, Validators.min(0)]],
      
      // Quran Progress Section
      quranProgress: this.fb.group({
        memorizedPercentage: [0, [Validators.min(0), Validators.max(100)]],
        memorizedParts: [0, [Validators.min(0), Validators.max(30)]]
      }),
      
      // Exams Section
      exams: this.fb.array([])
    });
  
    // Initialize exam array if needed
   
  }
  
   constructor(
     private route: ActivatedRoute,
     private fb: FormBuilder,
     private messageService: MessageService,
     private confirmationService: ConfirmationService,
     private groupService: GroupService,
     private studentService: StudentService,
     private examService: ExamService,
     private readSessionService: ReadSessionService,
     private datePipe: DatePipe
    
   ) {
     this.sessionForm = this.fb.group({
       date: [new Date(), Validators.required],
       sessionType: ['', Validators.required],
       surahName: ['', Validators.required],
       startAyah: [{ value: null, disabled: true }, Validators.required],
       endAyah: [{ value: null, disabled: true }, Validators.required],
       sessionResult: ['', Validators.required],
       sessionStatus: ['', Validators.required],
       notes: [''],
       attendance: this.fb.array([])
     });
   }
 
   ngOnInit(): void {
     this.route.params.subscribe(params => {
       const id = params['id'];
       if (id && !isNaN(+id)) {
         this.groupId = +id;
         this.loadGroupById(this.groupId);
         this.loadExamByGroup(this.groupId);
       
         this.loadGroupStudents(this.groupId);
         this.loadGroupData();
         
       } else {
         this.handleInvalidId();
       }
     });
     this.initForm();
     this.setupFormListeners();
     this.setupCharts();

   
  
    
     this.updateAttendanceStats();
   }
 
   // Initialization methods
   private loadGroupData(): void {
     this.loading = true;
     
     // Load group info
     this.groupService.getGroup(this.groupId).subscribe({
       next: (group) => {
         this.group = group;
        
         this.loadExams();
       
      
       },
       error: (err) => this.handleError('Failed to load group data', err)
     });
   }
   
  loadGroupStudents(groupId: number): void {
    this.loading = true;
    this.noStudentsFound = false;
    
    this.groupService.getGroupWithStudents(groupId).subscribe({
      next: (response) => {
        // Clear previous data
        this.students = [];
        this.filteredStudents = [];
        
        // Check if response contains students
        if (response.data?.students?.length) {
          this.students = this.transformStudents(response.data.students);
          this.filteredStudents = [...this.students];
        } else {
          this.noStudentsFound = true;
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.students = [];
        this.filteredStudents = [];
        this.noStudentsFound = true;
        this.showMessage('error', 'خطأ', this.getErrorMessage(error));
      }
    });
  }


  private transformStudents(students: Student[]): Student[] {
    return students.map(student => ({
      ...student,
      id: student.studentID || student.studentID,
      attendanceRate: this.calculateAttendanceRate(student),
      lastExamScore: this.getLastExamScore(student),
      registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date()
    }));
  }


  private calculateAttendanceRate(student: Student): number {
    if (!student.totalDays || student.totalDays === 0) return 0;
    return Math.round(((student.attendanceDays || 0) / student.totalDays) * 100);
  }

  // filterStudents(): void {
  //   if (!this.studentSearchTerm) {
  //     this.filteredStudents = this.applySelectedFilter([...this.students]);
  //     return;
  //   }
  
  //   const searchTerm = this.studentSearchTerm.toLowerCase();
  //   this.filteredStudents = this.applySelectedFilter(
  //     this.students.filter(student => 
  //       student.name.toLowerCase().includes(searchTerm) ||
  //       (student.studentID && student.studentID.toString().includes(searchTerm))
  //     )
  //   );
  // }

  applyFilter(): void {
    this.filteredStudents = this.applySelectedFilter([...this.students]);
  }

 
  private applySelectedFilter(students: Student[]): Student[] {
    if (!this.selectedFilter || this.selectedFilter === 'all') {
      return students;
    }

    switch (this.selectedFilter) {
      case 'highAttendance':
        return students.filter(s => s.attendanceDays && s.attendanceDays >= 75);
      case 'lowAttendance':
        return students.filter(s => s.attendanceDays && s.attendanceDays < 50);
      case 'recentlyRegistered':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return students.filter(s => s.registrationDate >= oneMonthAgo);
      default:
        return students;
    }
  }

  
  isNewStudent = false;
  createNewStudent(): void {
    this.isNewStudent = true;
    this.studentForm.reset({
      attendanceDays: 0,
      totalDays: 0,
      registrationDate: new Date(),
      quranProgress: {
        memorizedParts: 0,
        memorizedPercentage: 0
      }
    });
    this.showForm = true;
  }


  openEditForm(student: Student): void {
    this.isNewStudent = false;
    this.loadStudentIntoForm(student);
    this.showForm = true;
  }


  loadStudentIntoForm(student: Student): void {
    // Format dates properly
    const formattedStudent = {
      ...student,
      registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date()
    };
  
    this.studentForm.patchValue({
      ...formattedStudent,
      quranProgress: {
        memorizedPercentage: student.quranProgress?.memorizedPercentage || 0,
        memorizedParts: student.quranProgress?.memorizedParts || 0
      }
    });
  }

  
  cancelEdit(): void {
    this.showForm = false;
    this.studentForm.reset();
  }



  private handleSaveSuccess(message: string): void {
    this.loading = false;
    this.showMessage('success', 'تم الحفظ', message);
    this.showForm = false;
    this.loadGroupStudents(this.groupId); // Refresh data
  }

 
  private handleSaveError(error: any): void {
    this.loading = false;
    this.showMessage('error', 'خطأ', 'فشل في حفظ البيانات');
    console.error('Error saving student:', error);
  }

  
 
private getLastExamScore(student: Student): number | null {
  return student.exams?.[0]?.grade || null;
}
  // loadStudentIntoForm(student: any) {
  //   // Format dates properly
  //   const formattedStudent = {
  //     ...student,
  //     birthDate: student.birthDate ? new Date(student.birthDate) : null,
  //     registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date()
  //   };
  
  //   this.studentForm.patchValue({
  //     ...formattedStudent,
  //     quranProgress: {
  //       memorizedPercentage: student.quranProgress?.memorizedPercentage || 0,
  //       memorizedParts: student.quranProgress?.memorizedParts || 0
  //     }
  //   });
  
  //   // If you have exams array, handle separately
  //   if (student.exams && student.exams.length) {
  //     this.setExams(student.exams);
  //   }
  // }
  
  private setExams(exams: any[]) {
    // Clear existing exams
    const examsArray = this.studentForm.get('exams') as FormArray;
    examsArray.clear();
  
    // Add new exams
    exams.forEach(exam => {
      examsArray.push(this.fb.group({
        name: [exam.name],
        subject: [exam.subject],
        date: [exam.date ? new Date(exam.date) : null],
        grade: [exam.grade],
        teacher: [exam.teacher],
        type: [exam.type]
      }));
    });
  }
  
  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 5000 });
  }
 
  
  private prepareSaveData(): any {
    const formValue = this.studentForm.value;
    return {
      ...formValue,
      birthDate: formValue.birthDate?.toISOString(),
      registrationDate: formValue.registrationDate.toISOString(),
      exams: formValue.exams?.map((exam: any) => ({
        ...exam,
        date: exam.date?.toISOString()
      }))
    };
  }
  private getErrorMessage(error: any): string {
    return error.status === 404 
      ? 'المجموعة غير موجودة'
      : error.status === 403 
        ? 'غير مصرح لك بمشاهدة هذه المجموعة'
        : 'فشل في تحميل بيانات الطلاب';
  }
 
   private loadExams(): void {
     this.examService.getExamByGroupId(this.groupId).subscribe({
       next: (exams) => {
         this.exams = exams;
       },
       error: (err) => this.handleError('Failed to load exams', err)
     });
   }
 
  
 

   private setupFormListeners(): void {
     // Enable/disable ayah controls based on surah selection
     this.sessionForm.get('surahName')?.valueChanges.subscribe(surah => {
       if (surah) {
         this.sessionForm.get('startAyah')?.enable();
         this.sessionForm.get('endAyah')?.enable();
        //  this.loadAyahsForSurah(surah);
       } else {
         this.sessionForm.get('startAyah')?.disable();
         this.sessionForm.get('endAyah')?.disable();
         this.sessionForm.get('startAyah')?.reset();
         this.sessionForm.get('endAyah')?.reset();
       }
     });
   }
 
   confirmDeleteStudent(student : any): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الطالب؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Logic for deleting student would go here
        this.showMessage('success', 'تم الحذف', 'تم حذف الطالب بنجاح');
      }
    });}
 
   private initializeAttendanceForm(): void {
     const attendanceArray = this.fb.array(
       this.students.map(student => 
         this.fb.group({
           studentId: [student.studentID],
           attended: [true],
           readingNotes: ['']
         })
       )
     );
     this.sessionForm.setControl('attendance', attendanceArray);
   }
 
   // Form submission
  //  submitSession(): void {
  //    if (this.sessionForm.invalid) {
  //      this.markFormGroupTouched(this.sessionForm);
  //      this.messageService.add({
  //        severity: 'warn',
  //        summary: 'تحذير',
  //        detail: 'يرجى تعبئة جميع الحقول المطلوبة'
  //      });
  //      return;
  //    }
 
  //    if (this.selectedStudents.length === 0) {
  //      this.messageService.add({
  //        severity: 'warn',
  //        summary: 'تحذير',
  //        detail: 'يرجى تحديد طالب واحد على الأقل'
  //      });
  //      return;
  //    }
 
  //    const sessionData = {
  //      ...this.sessionForm.value,
  //      groupId: this.groupId
  //    };
 
  //    this.loading = true;
  //    this.readSessionService.addSession(sessionData).subscribe({
  //      next: (session) => {
  //        this.submitAttendanceRecords(session.readingSessionId);
  //        this.messageService.add({
  //          severity: 'success',
  //          summary: 'نجاح',
  //          detail: 'تم حفظ الجلسة بنجاح'
  //        });
  //        this.resetForm();
  //        this.loadReadingSessions();
  //      },
  //      error: (err) => this.handleError('Failed to save session', err)
  //    });
  //  }
 
   private submitAttendanceRecords(sessionId: number): void {
     const attendanceRecords = this.selectedStudents.map(student => ({
       studentId: student.studentID,
       status: 'PRESENT',
       notes: student.notes || ''
     }));
 
     this.readSessionService.addSessionAttendance(sessionId, attendanceRecords).subscribe({
       next: () => {
         this.loading = false;
       },
       error: (err) => {
         this.loading = false;
         this.messageService.add({
           severity: 'error',
           summary: 'خطأ',
           detail: 'تم حفظ الجلسة ولكن فشل في تسجيل الحضور'
         });
       }
     });
   }
 
   // UI helper methods
   private markFormGroupTouched(formGroup: FormGroup): void {
     Object.values(formGroup.controls).forEach(control => {
       control.markAsTouched();
       if (control instanceof FormGroup) {
         this.markFormGroupTouched(control);
       }
     });
   }
 
   
  
loadExamByGroup(groupId: number): void {
  this.loading = true; // Set loading state before making the request
  this.examService.getExamByGroupId(groupId).subscribe({
    next: (response: any) => {
      console.log('Response received:', response);
      
      // Check if response is an array directly
      if (Array.isArray(response)) {
        this.exams = response;
        console.log('Exams loaded:', this.exams);
      } 
      // Check if it's wrapped in a data property
      else if (response.success && response.data) {
        this.exams = response.data;
        console.log('Exams loaded:', this.exams);
      } 
     
      else {
        this.exams = []; 
        this.messageService.add({
          severity: 'warn',
          summary: 'لا يوجد اختبارات',
          detail: 'لم يتم العثور على اختبارات في هذه المجموعة'
        });
      }
      
      this.loading = false; // End loading state
    },
    error: (err) => {
      this.loading = false; // End loading state
      this.exams = []; // Clear data on error
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'فشل في تحميل بيانات الاختبارات'
      });
    }
  });
}
studentMenuItems = [
  // { label: 'View Details', icon: 'pi pi-eye', command: () => this.viewStudentDetails() },
  // { label: 'Edit', icon: 'pi pi-pencil', command: () => this.editStudent() },
  // { label: 'Delete', icon: 'pi pi-trash', command: () => this.deleteStudent() }
];

 
deleteExam(): void {
  console.log('Delete Exam');
}
 

   // Error handling
   private handleError(message: string, error: any): void {
     this.loading = false;
     console.error(message, error);
     this.messageService.add({
       severity: 'error',
       summary: 'خطأ',
       detail: 'حدث خطأ أثناء جلب البيانات'
     });
   }
 
   private handleInvalidId(): void {
     this.messageService.add({
       severity: 'error',
       summary: 'خطأ',
       detail: 'معرف المجموعة غير صالح'
     });
   }
 
   // Chart setup
   private setupCharts(): void {
     // Implementation remains similar to original
   }
 
   // View helpers
   getProgressColorClass(value: number): string {
     if (value >= 85) return 'bg-green-600';
     if (value >= 70) return 'bg-teal-600';
     if (value >= 50) return 'bg-amber-500';
     return 'bg-red-500';
   }
 
   getScoreClass(score: number): string {
     if (score >= 90) return 'text-green-600 font-medium';
     if (score >= 75) return 'text-teal-600 font-medium';
     if (score >= 60) return 'text-amber-500 font-medium';
     return 'text-red-500 font-medium';
   }
 
  
   viewExamDetails(exam: exam): void {
     this.selectedExam = exam;
     this.examResultDialogVisible = true;
   }
 
   // Session methods
   viewSessionDetails(session: ReadingSession): void {
     // Implementation for viewing session details
   }
 
  //  deleteSession(session: ReadingSession): void {
  //    this.confirmationService.confirm({
  //      message: 'هل أنت متأكد من حذف هذه الجلسة؟',
  //      header: 'تأكيد الحذف',
  //      icon: 'pi pi-exclamation-triangle',
  //      accept: () => {
  //        this.readSessionService.deleteSession(session.readingSessionId).subscribe({
  //          next: () => {
  //            this.messageService.add({
  //              severity: 'success',
  //              summary: 'نجاح',
  //              detail: 'تم حذف الجلسة بنجاح'
  //            });
  //            this.loadReadingSessions();
  //          },
  //          error: (err) => this.handleError('Failed to delete session', err)
  //        });
  //      }
  //    });
  //  }


 
 
//--
   
     initializeForm(): void {
       this.sessionForm = this.fb.group({
         date: [new Date(), Validators.required],
         sessionType: ['', Validators.required],
         surahName: ['', Validators.required],
         startAyah: [{ value: null, disabled: true }, Validators.required],
         endAyah: [{ value: null, disabled: true }, Validators.required],
         sessionQuality: ['', Validators.required],
         sessionStatus: ['', Validators.required],
         groupNotes: [''],
         attendance: this.fb.array([])
       });
   
       // Enable/disable ayah controls based on surah selection
       this.sessionForm.get('surahName')?.valueChanges.subscribe(surah => {
         if (surah) {
           this.sessionForm.get('startAyah')?.enable();
           this.sessionForm.get('endAyah')?.enable();
          
         } else {
           this.sessionForm.get('startAyah')?.disable();
           this.sessionForm.get('endAyah')?.disable();
           this.sessionForm.get('startAyah')?.reset();
           this.sessionForm.get('endAyah')?.reset();
         }
       });
     }
   
    
   
 
   
     loadGroupById(groupId: number): void {
       this.groupService.getGroup(groupId).subscribe({
         next: (response: any) => {
           this.group = response.data;
           console.log('Group loaded:', this.group);
         },
         error: (err) => {
           this.messageService.add({
             severity: 'error',
             summary: 'خطأ',
             detail: 'فشل في تحميل بيانات المجموعة'
           });
         }
       });
     }    
   
   
  //  addSession() {
   
  //    console.log("Form submitted!"); // Check browser console
  //    if (this.sessionForm.invalid) {
  //      console.error("Form is invalid:", this.sessionForm.errors);
  //      return;
  //    }
  //    console.log("Form data:", this.sessionForm.value);
  //    if (this.sessionForm.invalid) {
  //      this.messageService.add({
  //        severity: 'warn',
  //        summary: 'تحذير',
  //        detail: 'يرجى تعبئة جميع الحقول المطلوبة'
  //      });
  //      this.sessionForm.markAllAsTouched();
  //      return;
  //    }
     
  //    // Validate that at least one student is selected
  //    if (this.getSelectedStudents().length === 0) {
  //      this.messageService.add({
  //        severity: 'warn',
  //        summary: 'تحذير',
  //        detail: 'يرجى تحديد طالب واحد على الأقل'
  //      });
  //      return;
  //    }
     
  //    // Create new session object
  //    const newSession: ReadingSession = {
  //      readingSessionId: 0, // Will be assigned by the server
  //      date: this.sessionForm.value.sessionDate,
  //      sessionType: this.sessionForm.value.sessionType,
  //      surahName: this.sessionForm.value.surahName,
  //      sessionResult: this.sessionForm.value.sessionResult,
  //      sessionStatus: this.sessionForm.value.sessionStatus,
  //      startAyah: this.sessionForm.value.startAyah,
  //      endAyah: this.sessionForm.value.endAyah,
  //      notes: this.groupNotes, // Using the group notes field
  //      groupId: this.sessionForm.value.groupId,
  //      groupName: this.group?.groupName || ''
  //    };
     
  //    // First add the session
  //    this.readSessionService.addSession(newSession).subscribe({
  //      next: (response) => {
  //        // Get the session ID from the response
  //        const sessionId = response.readingSessionId;
         
  //        // Now prepare and submit attendance records
  //        this.submitAttendanceRecords(sessionId);
  //      },
  //      error: (error) => {
  //        this.messageService.add({
  //          severity: 'error',
  //          summary: 'خطأ',
  //          detail: 'فشل في إضافة الجلسة'
  //        });
  //      }
  //    });
  //  }
   
   
   onSessionDateChange(event: any) {
     this.sessionForm.patchValue({ sessionDate: event });
   }
   
 

   getAttendanceControl(index: number): FormGroup | null {
     const attendanceArray = this.sessionForm.get('attendance') as FormArray;
     return attendanceArray ? (attendanceArray.at(index) as FormGroup) : null;
   }
  
   
   
  
   
     private generateExams(): void {
      
     }
   
   
   
     getExamIcon(type: string): string {
       switch (type) {
         case 'حفظ': return 'pi pi-book text-blue-600';
         case 'تجويد': return 'pi pi-volume-up text-purple-600';
         case 'شامل': return 'pi pi-check-circle text-teal-600';
         default: return 'pi pi-file-edit text-blue-600';
       }
     }
   
     getExamTypeClass(type: string): string {
       switch (type) {
         case 'حفظ': return 'bg-blue-100 text-blue-800';
         case 'تجويد': return 'bg-purple-100 text-purple-800';
         case 'شامل': return 'bg-teal-100 text-teal-800';
         default: return 'bg-gray-100 text-gray-800';
       }
     }
   
     getExamStatusClass(status: string): string {
       switch (status) {
         case 'مكتمل': return 'px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs';
         case 'مجدول': return 'px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs';
         case 'جاري': return 'px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs';
         case 'ملغي': return 'px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs';
         default: return 'px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs';
       }
     }
   
     // Form methods
     
   
     deselectAllStudents(): void {
       this.students.forEach(student => student.selected = false);
     }
   
     getSelectedStudents(): Student[] {
       return this.students.filter(student => student.selected);
     }
   
    

    
   
     editSession(session: ReadingSession): void {
       console.log('Editing session:', session);
     }
   

     
   
     addDetailedNotes(student: Student): void {
       console.log('Adding detailed notes for:', student.name);
     }
   
     viewAbsenceDetails(student: Student): void {
       console.log('Viewing absence details for:', student.name);
     }
   
     sendAbsenceAlert(student: Student): void {
       this.confirmationService.confirm({
         message: `هل تريد إرسال تنبيه غياب للطالب ${student.name}؟`,
         header: 'تأكيد الإرسال',
         icon: 'pi pi-exclamation-triangle',
         accept: () => {
           this.messageService.add({
             severity: 'success',
             summary: 'نجاح',
             detail: `تم إرسال تنبيه الغياب للطالب ${student.name}`
           });
         }
       });
     }
   
     showDetailedReport(): void {
       console.log('Showing detailed report');
     }
   
     // Exam methods
     createNewExam(): void {
       this.newExam = {
         ExamDate: new Date(),
          totaldegree: 100,
         participants: []
       };
       this.newExamDialogVisible = true;
     }
   
     
   
     saveNewExam(): void {
       const newExamComplete: exam = {
         examID: this.exams.length + 1,
         participants: this.newExam.participants || [],
         Name: this.newExam.Name || 'اسم غير محدد',
         ExamDate: this.newExam.ExamDate || new Date(),
         title: this.getExamTypeDisplay(this.newExam.title || ''),
         averageScore: 0,
         status: 'مجدول',
         Description: this.newExam.Description || '',
         totaldegree: this.newExam.totaldegree || 100,
         //
         GroupId: typeof this.group?.groupID === 'number' 
           ? this.group.groupID 
           : (this.group?.groupID ? parseInt(this.group.groupID, 10) : 0), // Ensure GroupId is a number
         isActive: true, // Default value for isActive
         PassDegree: 50 // Default value for PassDegree
       }; 
       
       this.exams.unshift(newExamComplete);
       this.newExamDialogVisible = false;
       this.messageService.add({
         severity: 'success',
         summary: 'نجاح',
         detail: 'تم إنشاء الاختبار بنجاح'
       });
     }
   
     getExamTypeDisplay(type: string): string {
       switch (type) {
         case 'memorization': return 'حفظ';
         case 'tajweed': return 'تجويد';
         case 'comprehensive': return 'شامل';
         case 'periodic': return 'دوري';
         default: return type;
       }
     }
   
   
   
    
     analyzeExamResults(exam: exam): void {
       console.log('Analyzing exam results:', exam);
     }
   
     editExam(exam: exam): void {
       console.log('Editing exam:', exam);
     }
   
     editExamResult(result: ExamResult): void {
       console.log('Editing exam result:', result);
     }
   
     addExamResultNotes(result: ExamResult): void {
       console.log('Adding notes to exam result:', result);
     }
     onDateRangeChange(event: any): void {
       console.log('Date range selected:', event);
       // Add your logic here to handle the date range change
     }
   
     filterReadingHistory(): void {
       console.log('Filtering reading history...');
       // Add your filtering logic here
     }
    
     updateAttendanceStats(): void {
       console.log('Attendance stats updated');
       // Add logic here if needed
     }
     updateReadingNotes(index: number, event: any): void {
       // Implement logic to update reading notes for the student at the given index
       console.log(`Updating reading notes for student at index ${index}:`, event);
     }
     updateReadingQuality(index: number, value: number): void {
       console.log(`Updating reading quality for student at index ${index} with value ${value}`);
       // Implement the logic to update the reading quality here
     }
    
     selectAllStudentsForExam(): void {
      this.newExam.participants = [...this.exams[0].participants]; // Assuming exams[0] has the list of students
    }
     calculateTajweed(recitation: number): number {
       return Math.ceil(recitation / 20) || 4;
     }
     getRandomInt(max: number): number {
       return Math.floor(Math.random() * max);
     }
     getScoreProgressClass(score: number): string {
       if (score >= 80) {
         return 'bg-green-600';
       } else if (score >= 50) {
         return 'bg-amber-500';
       } else {
         return 'bg-red-500';
       }
   }











  
   groups: Group[] = [];
   selectedStudent: Student | null = null;
   
   // Form

   isEditMode = false;
   showStudentForm = false;
   showStudentDetails = false;
   
   // Filters

   selectedGender: any = null;
   selectedStatus: any = null;

   
   // Statistics
   totalStudents = 0;
   activeStudents = 0;
   inactiveStudents = 0;
   averageAttendance = 0;
   
   // Options
   genderOptions = [
     { name: 'ذكر', value: 'Male' },
     { name: 'أنثى', value: 'Female' }
   ];
   
   statusOptions = [
     { name: 'النشطين فقط', value: true },
     { name: 'غير النشطين', value: false },
     { name: 'الكل', value: null }
   ];
   
   // Date settings
   maxBirthDate = new Date();
   yearRange = `1900:${new Date().getFullYear()}`;
 

 
  
 
  //  initForm(): FormGroup {
  //    return this.fb.group({
  //      id: [{ value: '', disabled: true }],
  //      name: ['', Validators.required],
  //      birthDate: [null, Validators.required],
  //      phone: ['', [Validators.required, Validators.pattern(/^05\d{8}$/)]],
  //      address: [''],
  //      gender: ['Male', Validators.required],
  //      registrationDate: [new Date()],
  //      groupID: [null, Validators.required],
  //      name: [''],
  //      isActive: [true],
  //      memorizedParts: [0],
  //      memorizedPercentage: [0]
  //    });
  //  }
 
   loadGroups(): void {
     this.groupService.getGroups().subscribe({
       next: (groups) => {
         this.groups = groups;
       },
       error: (err) => {
         console.error('Failed to load groups', err);
         this.messageService.add({
           severity: 'error',
           summary: 'خطأ',
           detail: 'فشل تحميل قائمة المجموعات'
         });
       }
     });
   }
 
   loadStudents(): void {
     this.loading = true;
     this.studentService.getStudentById(this.groupId).subscribe({
       next: (students) => {
         this.students = Array.isArray(students) ? students : [students];
         this.filteredStudents = Array.isArray(students) ? [...students] : [students];
         this.calculateStatistics();
         this.loading = false;
       },
       error: (err) => {
         console.error('Failed to load students', err);
         this.messageService.add({
           severity: 'error',
           summary: 'خطأ',
           detail: 'فشل تحميل قائمة الطلاب'
         });
         this.loading = false;
       }
     });
   }
 
   calculateStatistics(): void {
     this.totalStudents = this.students.length;
     this.activeStudents = this.students.filter(s => s.isActive).length;
     this.inactiveStudents = this.totalStudents - this.activeStudents;
     
     const activeStudents = this.students.filter(s => s.isActive);
     if (activeStudents.length > 0) {
       this.averageAttendance = Math.round(
         activeStudents.reduce((sum, student) => sum + (student.attendanceDays || 0), 0) / activeStudents.length
       );
     }
   }
 
   filterStudents(): void {
     this.filteredStudents = this.students.filter(student => {
       const matchesSearch = this.studentSearchTerm === '' || 
         student.name.toLowerCase().includes(this.studentSearchTerm.toLowerCase()) ||
         (student.studentID && student.studentID.toString().includes(this.studentSearchTerm));
       
       const matchesGender = !this.selectedGender || student.gender === this.selectedGender.value;
       const matchesStatus = this.selectedStatus === null || student.isActive === this.selectedStatus.value;
       
       return matchesSearch && matchesGender && matchesStatus;
     });
   }
 
   showAddStudentDialog(): void {
     this.isEditMode = false;
     this.studentForm.reset();
     this.studentForm.patchValue({
       registrationDate: new Date(),
       gender: 'Male',
       isActive: true
     });
     this.showStudentForm = true;
   }
 
   editStudent(student: Student): void {
     this.selectedStudent = student;
     this.isEditMode = true;
     
     this.studentForm.reset();
     this.studentForm.patchValue({
       id: student.studentID,
       studentID: student.studentID,
       name: student.name,
       
       phone: student.phoneNumber,
       address: student.name,
       gender: student.gender,
       registrationDate: new Date(student.registrationDate),
       groupID: student.groupID,
      //  name: student.name,
       isActive: student.isActive,
     
     });
     
     this.showStudentForm = true;
   }
 
   saveStudent(): void {
     if (this.studentForm.invalid) {
       this.markFormGroupTouched(this.studentForm);
       return;
     }
 
    //  const studentData = this.studentForm.getRawValue();
    //  const operation = this.isEditMode ? 
    //    this.studentService.updateStudent(studentData) : 
    //    this.studentService.createStudent(studentData);
 
    //  operation.subscribe({
    //    next: () => {
    //      this.messageService.add({
    //        severity: 'success',
    //        summary: 'نجاح',
    //        detail: this.isEditMode ? 'تم تحديث بيانات الطالب' : 'تم إضافة الطالب بنجاح'
    //      });
    //      this.showStudentForm = false;
    //      this.loadStudents();
    //    },
    //    error: (err) => {
    //      console.error('Failed to save student', err);
    //      this.messageService.add({
    //        severity: 'error',
    //        summary: 'خطأ',
    //        detail: 'فشل في حفظ بيانات الطالب'
    //      });
    //    }
    //  });
   }
   updateStudent(): void {
     if (this.studentForm.invalid) {

        this.markFormGroupTouched(this.studentForm);
        return;
      }
      const studentData = this.studentForm.getRawValue();
      const studentId = this.selectedStudent?.studentID;
      if (!studentId) {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'معرف الطالب غير صالح'
        });
        return;
      }

      this.studentService.updateStudent(studentId, studentData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تحديث بيانات الطالب بنجاح'
          });
          this.showStudentForm = false;
          this.loadStudents();
        },
        error: (err) => {
          console.error('Failed to update student', err);
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل في تحديث بيانات الطالب'
          });
        }
      });

    }

   viewStudentDetails(student: Student): void {
     this.selectedStudent = student;
     this.showStudentDetails = true;
   }
 
   confirmDelete(student: Student): void {
     this.confirmationService.confirm({
       message: 'هل أنت متأكد من حذف هذا الطالب؟',
       header: 'تأكيد الحذف',
       icon: 'pi pi-exclamation-triangle',
       acceptLabel: 'نعم',
       rejectLabel: 'لا',
       accept: () => {
         this.deleteStudent(student.studentID);
       }
     });
   }
 
   deleteStudent(studentId: number): void {
     this.studentService.deleteStudent(studentId).subscribe({
       next: () => {
         this.messageService.add({
           severity: 'success',
           summary: 'نجاح',
           detail: 'تم حذف الطالب بنجاح'
         });
         this.loadStudents();
       },
       error: (err) => {
         console.error('Failed to delete student', err);
         this.messageService.add({
           severity: 'error',
           summary: 'خطأ',
           detail: 'فشل في حذف الطالب'
         });
       }
     });
   }
 
   exportToExcel(): void {
     // Implement Excel export logic
     this.messageService.add({
       severity: 'info',
       summary: 'تصدير البيانات',
       detail: 'سيتم تصدير البيانات إلى ملف Excel'
     });
   }
 
   // Helper methods

 
   calculateAge(birthDate: Date): number {
     if (!birthDate) return 0;
     const today = new Date();
     const birthDateObj = new Date(birthDate);
     let age = today.getFullYear() - birthDateObj.getFullYear();
     const monthDiff = today.getMonth() - birthDateObj.getMonth();
     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
       age--;
     }
     return age;
   }
 
   getDuration(date: Date): string {
     if (!date) return '--';
     const now = new Date();
     const diff = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
     
     if (diff < 30) return `${Math.floor(diff)} أيام`;
     if (diff < 365) return `${Math.floor(diff/30)} أشهر`;
     return `${Math.floor(diff/365)} سنوات`;
   }
 
   getStudentAvatar(student: Student): string {
     // Use UI Avatars API or your own avatar service
     return `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=059669&color=fff&size=128`;
   }
 
   closeForm(): void {
     this.showStudentForm = false;
     this.studentForm.reset();
   }
}




