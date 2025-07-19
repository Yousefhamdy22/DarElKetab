// booking.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin, finalize, catchError, of } from 'rxjs';
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
import { Student } from '../../students/student.model';
import { groupFilterDto, GroupResponseDto, GroupService } from '../../groups/group.service';

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
 
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  // loading:boolean;

  
  
  // Data arrays
  existingStudents: Student[] = [];
  filteredStudents: Student[] = [];
  groups: Group[] = [];
  groupsError: boolean = false;

  availableGroups: Group[] = [];
  teachers: Teacher[] = [];
  availableTeachers: Teacher[] = [];
  
  // Selected entities
  selectedStudent: Student | null = null;
  selectedGroup: Group | null = null;
  selectedTeacher: Teacher | null = null;
  // loading!:boolean;
  // Form state flags
  isNewStudent = true;
  showStudentDropdown = false;
  
  // Destroy subject for unsubscribing
  private destroy$ = new Subject<void>();

  // Static options
  genderOptions = [
    { label: 'ذكر', value: 'male' },
    { label: 'أنثى', value: 'female' }
  ];
  loadingStates = {
    students: false,
    teachers: false,
    groups: false
  };

  
  selectedStage: number | null = null;
  selectedGrade: number | null = null;
  filteredGrades: any[] = [];

  educationStages = [
    { label: 'الابتدائية', value: 1 },
    { label: 'الاعدادية', value: 2 },
  
  ];

  grades = [
    { label: 'الأول', value: '1' },
    { label: 'الثاني', value: '2' },
    { label: 'الثالث', value: '3' },
    { label: 'الرابع', value: '4' },
    { label: 'الخامس', value: '5' },
    { label: 'السادس', value: '6' }
  ];


  // onEducationStageChange() {
  //   const selectedStage = this.bookingForm.get('educationStage')?.value;
  //   console.log('Selected Stage:', selectedStage); // Debug log
  
  //   if (selectedStage === 1) {
  //     this.filteredGrades = this.grades.filter(grade => parseInt(grade.value) <= 6);
  //   } 
  //   else if (selectedStage === 2) {
  //     this.filteredGrades = this.grades.filter(grade => parseInt(grade.value) <= 3);
  //   } 
  //   else {
  //     this.filteredGrades = [];
  //   }
    
  //   console.log('Filtered Grades:', this.filteredGrades); // Debug log
  //   this.bookingForm.get('grade')?.reset('');
  // }


  onEducationStageChange() {
    const selectedStage = this.bookingForm.get('educationStage')?.value;
    console.log('Selected Stage:', selectedStage);
    console.log('All Grades:', this.grades);
  
    if (selectedStage == 1) { // Use == for loose comparison
      this.filteredGrades = this.grades.filter(grade => +grade.value <= 6); // Use + for conversion
    } 
    else if (selectedStage == 2) {
      this.filteredGrades = this.grades.filter(grade => +grade.value <= 3);
    } 
    else {
      this.filteredGrades = [];
    }
    
    console.log('Filtered Grades:', this.filteredGrades);
    this.bookingForm.get('grade')?.reset('');
  }
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingService,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private groupService: GroupService,
    private messageService: MessageService
  ) {
    this.bookingForm = this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    // this.loadGroups();
  //   this.loadGroup();
    this.setupFormSubscriptions();
  }

  // Add these to your component



loadGroups(): void {
  if (!this.educationStage?.value || !this.grade?.value) return;
  
  this.loadingStates.groups = true;
  this.groupsError = false;
  
  this.groupService.getGroups().subscribe({
    next: (response: any) => {
      // Process response
      console.log(response , "Group data")
      this.availableGroups = Array.isArray(response) ? response : (response?.data || []);
      
      // Enhance group objects
      this.availableGroups = this.availableGroups.map(group => ({
        ...group,
        groupName: group.groupName || `المجموعة ${group.groupID}`,
        // stage: this.getStageName(group.stageLevel) 
      }));
      
      this.loadingStates.groups = false;
    },
    error: (err) => {
      this.groupsError = true;
      this.loadingStates.groups = false;
      console.error('Failed to load groups:', err);
    }
  });
}

// Add this to update selected group when dropdown changes


  private createForm(): FormGroup {
    return this.fb.group({
      // Student Information
      studentName: ['', [Validators.required, Validators.minLength(2)]],
      studentPhone: ['', [Validators.required, Validators.pattern(/^05[0-9]{8}$/)]],
      studentGender: ['', Validators.required],
      educationStage: ['', Validators.required],
      grade: ['', Validators.required],
      
      // Booking Information
      groupId: ['', Validators.required],
      teacherId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // Load students first
    // this.loadStudents();
    
    // Load other data that doesn't depend on form values
    this.loadAllGroups();
    this.loadAllTeachers();
  }
  private loadStudents(): void {
    this.loadingStates.students = true;
    
    this.studentService.getStudents().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading students:', error);
        this.showError('فشل في تحميل بيانات الطلاب');
        return of([]);
      }),
      finalize(() => {
        this.loadingStates.students = false;
        this.updateOverallLoadingState();
      })
    ).subscribe({
      next: (students) => {
        this.existingStudents = students;
        this.filteredStudents = [...this.existingStudents];
        console.log('Students loaded:', students.length);
      }
    });
  }

// async loadGroup()
// {
//    this.loadingStates.groups = false;
//    const params: groupFilterDto = {
//   stageId: this.selectedStage ? Number(this.selectedStage) : null,
//   levelId: this.selectedGrade ? Number(this.selectedGrade) : null
// };

//    this.groupService.getGropsByStageAndStageLevel(params)
//    .subscribe(
//     (response: GroupResponseDto) => {
//       // this.groups = Array.isArray(response) ? response : [];
//       this.groups =  

//     })

// }
async loadGroup() {
  this.loadingStates.groups = true; // Set loading to true at start

  const params: groupFilterDto = {
    stageId: this.selectedStage ? Number(this.selectedStage) : null,
    levelId: this.selectedGrade ? Number(this.selectedGrade) : null
  };

  this.groupService.getGropsByStageAndStageLevel(params).subscribe(
    (response: GroupResponseDto[]) => { 

      console.log(response , "Group as Filter")
      this.groups = response.map(groupDto => ({
        groupID: groupDto.groupId,
        groupName: groupDto.groupName,
        description: groupDto.description,
        teacherId: groupDto.teacherId,
        teacher: undefined, // or remove this line if not needed
        scheduleDay: groupDto.scheduleDay || '',
        maxStudentNumber: groupDto.maxCapacity,
        stage: groupDto.educationStage.toString(),
        stageLevel: groupDto.gradeLevel.toString(),
        startDate: new Date(groupDto.startDate),
        endDate: new Date(),
        currentStudents: groupDto.memberCount,
        active: groupDto.status === 'Active',
        fees: 0,
        // ...other fields as needed
      }));

      this.loadingStates.groups = false;
    },
    (error) => {
      this.loadingStates.groups = false;
      // Handle error if needed
      console.error('Error loading groups:', error);
    }
  );
}
// async loadGroulllp() {

//   const cityValue = this.visitForm.get('visitDetails.city')?.value;
//   const params: any = cityValue ? { cityId: cityValue } : {};

//   this.loadingAreas.set(true);
//   this.areaService.getAreas(params).subscribe(
//     (response: AreasResponseDTO) => {
//       this.areas.set(
//         response.data.map(area => ({
//           label: this.translateService.currentLang === 'ar' ? area.nameAr : area.name,
//           value: area.id
//         }))
//       )

//       this.loadingAreas.set(false);
//     }
//   );
// }












  private loadAllGroups(): void {
    this.loadingStates.groups = true;
    this.groupsError = false;
    
    this.groupService.getGroups().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading groups:', error);
        this.groupsError = true;
        this.showError('فشل في تحميل المجموعات');
        return of([]);
      }),
      finalize(() => {
        this.loadingStates.groups = false;
        this.updateOverallLoadingState();
      })
    ).subscribe({
      next: (response: any) => {
        // Handle different response formats
        const groups = Array.isArray(response) ? response : (response?.data || []);
        this.availableGroups = groups.map((group: any) => ({
          ...group,
          groupName: group.groupName || `المجموعة ${group.groupID}`,
          displayName: this.getGroupDisplayName(group)
        }));
        console.log('Groups loaded:', this.availableGroups.length);
      }
    });
  }

  private loadAllTeachers(): void {
    this.loadingStates.teachers = true;
    
    this.teacherService.getAllTeachers().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading teachers:', error);
        this.showError('فشل في تحميل بيانات المعلمين');
        return of([]);
      }),
      finalize(() => {
        this.loadingStates.teachers = false;
        this.updateOverallLoadingState();
      })
    ).subscribe({
      next: (teachers) => {
        this.availableTeachers = teachers;
        console.log('Teachers loaded:', teachers.length);
      }
    });
  }

  private updateOverallLoadingState(): void {
    this.isLoading = Object.values(this.loadingStates).some(state => state);
  }

  private getGroupDisplayName(group: any): string {
    let displayName = group.groupName || `المجموعة ${group.groupID}`;
    
    if (group.stage && group.stageLevel) {
      displayName += ` (${this.getStageDisplayName(group.stage)} - ${this.getGradeDisplayName(group.stageLevel)})`;
    }
    
    return displayName;
  }

  private getStageDisplayName(stage: string): string {
    const stageMap: { [key: string]: string } = {
      'Elementary': 'الابتدائية',
      'Middle': 'الاعدادية',
      'Secondary': 'الثانوية'
    };
    return stageMap[stage] || stage;
  }

  private getGradeDisplayName(grade: string): string {
    const gradeMap: { [key: string]: string } = {
      'Grade1': 'الأول',
      'Grade2': 'الثاني',
      'Grade3': 'الثالث',
      'Grade4': 'الرابع',
      'Grade5': 'الخامس',
      'Grade6': 'السادس',
      'Grade7': 'السابع',
      'Grade8': 'الثامن',
      'Grade9': 'التاسع',
      'Grade10': 'العاشر',
      'Grade11': 'الحادي عشر',
      'Grade12': 'الثاني عشر'
    };
    return gradeMap[grade] || grade;
  }

  // Filter groups based on stage and grade
  private filterGroupsByStageAndGrade(): void {
    const stage = this.bookingForm.get('educationStage')?.value;
    const grade = this.bookingForm.get('grade')?.value;
    
    if (!stage || !grade) {
      this.availableGroups = [];
      return;
    }
    
    // Filter groups based on stage and grade
    this.availableGroups = this.availableGroups.filter(group => 
      group.stage === stage && group.stageLevel === grade
    );
    
    console.log('Filtered groups:', this.availableGroups.length);
  }

  // Filter teachers based on selected group
  private filterTeachersByGroup(): void {
    const groupId = this.bookingForm.get('groupId')?.value;
    
    if (!groupId) {
      this.availableTeachers = [];
      return;
    }
    
    // Find teachers for the selected group
    this.availableTeachers = this.availableTeachers.filter(teacher => 
      teacher.groupId === +groupId
    );
    
    console.log('Filtered teachers:', this.availableTeachers.length);
  }


  onGradeChange(): void {
    // Reset dependent fields
    this.bookingForm.patchValue({
      groupId: '',
      teacherId: ''
    });
    
    this.selectedGroup = null;
    this.selectedTeacher = null;
    
    // Filter groups based on stage and grade
    this.filterGroupsByStageAndGrade();
  }

  onGroupChange(): void {
    const groupId = this.bookingForm.get('groupId')?.value;
    
    if (groupId) {
      this.selectedGroup = this.availableGroups.find(g => g.groupID === +groupId) || null;
      this.filterTeachersByGroup();
    } else {
      this.selectedGroup = null;
      this.availableTeachers = [];
    }
    
    // Reset teacher selection
    this.bookingForm.patchValue({ teacherId: '' });
    this.selectedTeacher = null;
  }

  onTeacherChange(): void {
    const teacherId = this.bookingForm.get('teacherId')?.value;
    
    if (teacherId) {
      this.selectedTeacher = this.availableTeachers.find(t => t.teacherId === +teacherId) || null;
    } else {
      this.selectedTeacher = null;
    }
  }

  private setupFormSubscriptions(): void {
    // Watch for student name changes
    this.bookingForm.get('studentName')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(name => {
      this.onStudentNameChange(name);
    });

    // Watch for form changes
    this.bookingForm.get('educationStage')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.onEducationStageChange();
    });

    this.bookingForm.get('grade')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.onGradeChange();
    });

    this.bookingForm.get('groupId')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.onGroupChange();
    });

    this.bookingForm.get('teacherId')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.onTeacherChange();
    });
  }

  private onStudentNameChange(name: string): void {
    if (!name || name.length < 2) {
      this.showStudentDropdown = false;
      this.selectedStudent = null;
      this.isNewStudent = true;
      return;
    }

    // Filter existing students by name
    this.filteredStudents = this.existingStudents.filter(student =>
      student.name.toLowerCase().includes(name.toLowerCase())
    );

    // Show dropdown if there are matching students
    this.showStudentDropdown = this.filteredStudents.length > 0;
    
    // Check if exact match exists
    const exactMatch = this.existingStudents.find(student => 
      student.name.toLowerCase() === name.toLowerCase()
    );

    if (exactMatch) {
      this.selectExistingStudent(exactMatch);
    } else {
      this.selectedStudent = null;
      this.isNewStudent = true;
    }
  }

  selectExistingStudent(student: Student): void {
    this.selectedStudent = student;
    this.isNewStudent = false;
    this.showStudentDropdown = false;

    // Populate form with existing student data
    this.bookingForm.patchValue({
      studentName: student.name,
      studentPhone: student.phoneNumber,
      studentGender: student.gender,
      educationStage: student.stage,
      grade: student.stageLevel
    });

    // Trigger stage change to update grades
    this.onEducationStageChange();
  }

  selectNewStudent(): void {
    this.selectedStudent = null;
    this.isNewStudent = true;
    this.showStudentDropdown = false;
    
    // Clear student fields except name
    this.bookingForm.patchValue({
      studentPhone: '',
      studentGender: '',
      educationStage: '',
      grade: ''
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  onSubmit(): void {
    if (this.bookingForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formData = this.prepareBookingData();
      
      this.bookingService.createBooking(formData).pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      ).subscribe({
        next: (booking) => {
          this.showSuccess('تم إنشاء الحجز بنجاح!');
          setTimeout(() => {
            this.router.navigate(['/bookings']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating booking:', error);
          this.showError('فشل في إنشاء الحجز. يرجى المحاولة مرة أخرى.');
        }
      });
    } else {
      this.markAllFieldsAsTouched();
      this.showError('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
    }
  }

  private prepareBookingData(): BookingRequest {
    const formValue = this.bookingForm.value;
    
    const bookingData: BookingRequest = {
      studentName: formValue.studentName,
      studentPhone: formValue.studentPhone,
      studentGender: formValue.studentGender,
      educationStage: formValue.educationStage,
      grade: formValue.grade,
      groupId: +formValue.groupId,
      teacherId: formValue.teacherId?.toString(),
      date: new Date().toISOString(),
      notes: formValue.notes || '',
      timeSlot: '09:00',
      teacherd: formValue.teacherId?.toString(), // or the correct teacher id field
      educationStageLevel: formValue.grade,      // or the correct grade/level field
      studentInfo: {
        name: formValue.studentName,
        phoneNumber: formValue.studentPhone,
        gender: formValue.studentGender,
        stage: formValue.educationStage,
        stageLevel: formValue.grade,
        status: 'Active'
      }
    };

    // Add existing student ID if using existing student
    if (this.selectedStudent) {
      bookingData.groupId = this.selectedStudent.studentID;
    }

    return bookingData;
  }

  resetForm(): void {
    this.bookingForm.reset();
    this.selectedStudent = null;
    this.selectedGroup = null;
    this.selectedTeacher = null;
    this.isNewStudent = true;
    this.showStudentDropdown = false;
    this.filteredGrades = [];
  }

  navigateToBookingList(): void {
    this.router.navigate(['/bookings']);
  }

  navigateToBookingCard(): void {
    this.router.navigate(['/booking-card']);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.bookingForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'نجح',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message,
      life: 5000
    });
  }

  // Form validation getters
  get studentName() { return this.bookingForm.get('studentName'); }
  get studentPhone() { return this.bookingForm.get('studentPhone'); }
  get studentGender() { return this.bookingForm.get('studentGender'); }
  get educationStage() { return this.bookingForm.get('educationStage'); }
  get grade() { return this.bookingForm.get('grade'); }
  get groupId() { return this.bookingForm.get('groupId'); }
  get teacherId() { return this.bookingForm.get('teacherId'); }
  get amount() { return this.bookingForm.get('amount'); }
  get paidAmount() { return this.bookingForm.get('paidAmount'); }
  get notes() { return this.bookingForm.get('notes'); }

  // Getter for loading state
  get loading(): boolean {
    return this.loadingStates.groups;
  }

}