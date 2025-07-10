import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Observable, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Student } from '../students/student.model';
import { Group } from '../groups/group.models';
import { SessionScheduleService } from './SessionScheduleService.service';
import { GroupService } from '../groups/group.service';

enum SessionStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

export interface SessionSchedule {
  id: number;
  title: string;
  description?: string;
  groupId: number;
  group?: Group;
  date: Date;
  startTime: string;
  stage: string,
  stagelevel:string,
  endTime: string;
  duration: number; // in minutes
  dayOfWeek: string;
  notes: string;
  sessionType: string;
  status: SessionStatus;
  students?: Student[];
  createdAt: Date;
  updatedAt: Date;
}
export interface SessionRequest {
  groupId: number;
  sessionDate: string; // ISO date string
  sessionType: string;
  status: string;
  stage: string;
  stageLevel: string;
  notes: string;
  createdBy: string;
}
@Component({
  selector: 'app-sessionschedul',
  standalone: false,
  templateUrl: './sessionschedul.component.html',
  styleUrl: './sessionschedul.component.css'
})
export class SessionschedulComponent {

  // Form and Dialog
  sessionForm: FormGroup;
  showSessionDialog = false;
  isEditMode = false;
  currentSession: SessionSchedule | null = null;
  
  // Loading States
  isLoading = false;
  isSaving = false;
  
  // Data
  sessions: SessionSchedule[] = [];
  filteredSessions: SessionSchedule[] = [];
  groups: Group[] = [];
  
  // Filters
  searchTerm = '';
  selectedGroupId: number | null = null;
  selectedStatus: SessionStatus | null = null;
  dateRange: Date[] = [];
  
  // Statistics
  totalSessions = 0;
  activeGroups = 0;
  pendingSessions = 0;
  
  // Options
  statusOptions = [
    { label: 'مجدولة', value: SessionStatus.SCHEDULED, class: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    { label: 'نشطة', value: SessionStatus.ACTIVE, class: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    { label: 'مكتملة', value: SessionStatus.COMPLETED, class: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
    { label: 'ملغاة', value: SessionStatus.CANCELLED, class: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    { label: 'مؤجلة', value: SessionStatus.POSTPONED, class: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' }
  ];

  sessionTypeOptions = [
    { label: 'عادية', value: 'Regular' },
    { label: 'مراجعة', value: 'Review' },
    { label: 'اختبار', value: 'Exam' },
    { label: 'تعويض', value: 'Makeup' }
  ];

  stageLevelOptions =[


  ];
 stageOptions =[

] 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private sessionService: SessionScheduleService,
    private groupService: GroupService
  ) {
    this.sessionForm = this.createForm();
  }

  ngOnInit(): void {
 
  

    // this.loadInitialData();
    this.loadAllSession();
    // this.loadGroups();
  }

  // private createForm(): FormGroup {
  //   return this.fb.group({
  //     title: ['', [Validators.required, Validators.minLength(3)]],
  //     description: [''],
  //     groupId: ['', Validators.required],
  //     date: ['', Validators.required],

  //     startTime: ['', Validators.required],
  //     duration: [90, [Validators.required, Validators.min(15), Validators.max(300)]],
  //     status: [SessionStatus.SCHEDULED, Validators.required]
  //   });
  // }
  private createForm(): FormGroup {
    return this.fb.group({
      groupId: ['', Validators.required],
      sessionDate: ['', Validators.required],
      sessionType: ['Regular', Validators.required],
      status: ['Scheduled', Validators.required],
      stage: ['Initial', Validators.required],
      stageLevel: ['Beginner', Validators.required],
      notes: [''],
      createdBy: ['admin'] // You might want to get this from user context
    });
  }

  // private loadInitialData(): void {
  //   this.isLoading = true;
    
  //   forkJoin({
  //     sessions: this.sessionService.getAllSessions(),
  //     groups: this.groupService.getGroups()
  //   }).pipe(
  //     finalize(() => this.isLoading = false)
  //   ).subscribe({
  //     next: (data) => {
  //       this.sessions = data.sessions;
  //       this.groups = data.groups;
  //       this.filteredSessions = [...this.sessions];
  //       this.calculateStatistics();
  //     },
  //     error: (error) => {
  //       console.error('Error loading data:', error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'خطأ',
  //         detail: 'فشل في تحميل البيانات'
  //       });
  //     }
  //   });
  // }
  private loadInitialData(): void {
    this.isLoading = true;
    
    forkJoin({
      sessions: this.sessionService.getAllSessions(),
      groups: this.groupService.getGroups()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        this.sessions = data.sessions || [];
        this.groups = data.groups || [];
        this.filteredSessions = [...this.sessions];
        this.calculateStatistics();
        console.log('Initial data loaded - Groups:', this.groups.length, 'Sessions:', this.sessions.length);
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل البيانات'
        });
      }
    });
  }


  private calculateStatistics(): void {
    this.totalSessions = this.sessions.length;
    this.activeGroups = new Set(this.sessions.map(s => s.groupId)).size;
    this.pendingSessions = this.sessions.filter(s => 
      s.status === SessionStatus.SCHEDULED || s.status === SessionStatus.ACTIVE
    ).length;
  }


  private applyFilters(): void {
    let filtered = [...this.sessions];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        session.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        session.group?.groupName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Group filter
    if (this.selectedGroupId) {
      filtered = filtered.filter(session => session.groupId === this.selectedGroupId);
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(session => session.status === this.selectedStatus);
    }

    // Date range filter
    if (this.dateRange && this.dateRange.length === 2) {
      const startDate = this.dateRange[0];
      const endDate = this.dateRange[1];
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    }

    this.filteredSessions = filtered;
  }


  loadAllSession(): void {
    this.isLoading = true;
    this.sessionService.getAllSessions().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response: any) => {
        console.log(response, "API Response");
        
        // Handle different response structures
        if (Array.isArray(response)) {
          this.sessions = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.sessions = response.data;
        } else if (response && Array.isArray(response.sessions)) {
          this.sessions = response.sessions;
        } else {
          console.error('Unexpected response structure:', response);
          this.sessions = [];
        }
        
        this.filteredSessions = [...this.sessions];
        this.calculateStatistics();
        
        console.log(this.sessions, "Sessions processed");
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل الحصص'
        });
      }
    });
  }
  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        console.log('Groups loaded:', this.groups);
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل المجموعات'
        });
      }
    });
  }
  // CRUD Operations

  showCreateSessionDialog(): void {
    this.isEditMode = false;
    this.currentSession = null;
    this.sessionForm.reset();
    this.sessionForm.patchValue({
      sessionType: 'Regular',
      status: 'Scheduled',
      stage: 'Initial',
      stageLevel: 'Beginner',
      createdBy: 'admin' // Get from user context
    });
    
    // Load groups if not already loaded
    if (this.groups.length === 0) {
      this.loadGroups();
    }
    
    this.showSessionDialog = true;
  }
  // showCreateSessionDialog(): void {
  //   this.isEditMode = false;
  //   this.currentSession = null;
  //   this.sessionForm.reset();
  //   this.sessionForm.patchValue({
  //     duration: 90,
  //     status: SessionStatus.SCHEDULED
  //   });
  //   this.showSessionDialog = true;
  // }

  editSession(session: SessionSchedule): void {
    this.isEditMode = true;
    this.currentSession = session;
    
    // Convert time format for form
    const sessionDate = new Date(session.date);
    
    this.sessionForm.patchValue({
      // title: session.title,
      description: session.description,
      groupId: session.groupId,
      date: sessionDate,
      sessionType: session.sessionType,
      stage: session.stage,
      stageLevel: session.stagelevel,
      startTime: session.startTime,
      duration: session.duration,
      status: session.status,
      notes: session.notes,
      
    });
    
    this.showSessionDialog = true;
  }

  async saveSession(): Promise<void> {
    if (this.sessionForm.valid && !this.isSaving) {
      this.isSaving = true;
  
      try {
        const formValue = this.sessionForm.value;
        
        const sessionData: SessionRequest = {
          groupId: formValue.groupId,
          sessionDate: new Date(formValue.sessionDate).toISOString(),
          sessionType: formValue.sessionType,
          status: formValue.status,
          stage: formValue.stage,
          stageLevel: formValue.stageLevel,
          notes: formValue.notes || '',
          createdBy: formValue.createdBy
        };
  
        let result: SessionSchedule;
        
        if (this.isEditMode && this.currentSession) {
          result = (await this.sessionService.updateSession(this.currentSession.id, sessionData).toPromise())!;
          
          // Update local data
          const index = this.sessions.findIndex(s => s.id === this.currentSession!.id);
          if (index !== -1) {
            this.sessions[index] = result;
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'تم التحديث',
            detail: 'تم تحديث الحصة بنجاح'
          });
        } else {
          result = (await this.sessionService.createSession(sessionData).toPromise())!;
          
          // Add to local data
          this.sessions.unshift(result);
          
          this.messageService.add({
            severity: 'success',
            summary: 'تم الإنشاء',
            detail: 'تم إنشاء الحصة بنجاح'
          });
        }
  
        this.applyFilters();
        this.calculateStatistics();
        this.closeSessionDialog();
  
      } catch (error) {
        console.error('Error saving session:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: this.isEditMode ? 'فشل في تحديث الحصة' : 'فشل في إنشاء الحصة'
        });
      } finally {
        this.isSaving = false;
      }
    }
  }

  // async saveSession(): Promise<void> {
  //   if (this.sessionForm.valid && !this.isSaving) {
  //     this.isSaving = true;

  //     try {
  //       const formValue = this.sessionForm.value;
        
  //       const sessionData: SessionRequest = {
       
        
  //         groupId: formValue.groupId,
  //         stage: formValue.stage,
  //         stageLevel: formValue.stagelevel,
  //         sessionDate: new Date(formValue.date).toISOString(),
  //         // st: formValue.startTime,
  //         duration: formValue.duration,
  //         status: formValue.status
  //       };

  //       let result: SessionSchedule;
        
  //       if (this.isEditMode && this.currentSession) {
  //         result = (await this.sessionService.updateSession(this.currentSession.id, sessionData).toPromise())!;
          
  //         // Update local data
  //         const index = this.sessions.findIndex(s => s.id === this.currentSession!.id);
  //         if (index !== -1) {
  //           this.sessions[index] = result;
  //         }
          
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'تم التحديث',
  //           detail: 'تم تحديث الجلسة بنجاح'
  //         });
  //       } else {
  //         result = (await this.sessionService.createSession(sessionData).toPromise())!;
          
  //         // Add to local data
  //         this.sessions.unshift(result);
          
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'تم الإنشاء',
  //           detail: 'تم إنشاء الجلسة بنجاح'
  //         });
  //       }

  //       this.applyFilters();
  //       this.calculateStatistics();
  //       this.closeSessionDialog();

  //     } catch (error) {
  //       console.error('Error saving session:', error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'خطأ',
  //         detail: this.isEditMode ? 'فشل في تحديث الجلسة' : 'فشل في إنشاء الجلسة'
  //       });
  //     } finally {
  //       this.isSaving = false;
  //     }
  //   }
  // }

  closeSessionDialog(): void {
    this.showSessionDialog = false;
    this.sessionForm.reset();
    this.currentSession = null;
    this.isEditMode = false;
  }

  deleteSession(session: SessionSchedule): void {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الجلسة "${session.title}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performDelete(session);
      }
    });
  }

  private async performDelete(session: SessionSchedule): Promise<void> {
    try {
      await this.sessionService.deleteSession(session.id).toPromise();
      
      // Remove from local data
      this.sessions = this.sessions.filter(s => s.id !== session.id);
      this.applyFilters();
      this.calculateStatistics();
      
      this.messageService.add({
        severity: 'success',
        summary: 'تم الحذف',
        detail: 'تم حذف الجلسة بنجاح'
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'فشل في حذف الجلسة'
      });
    }
  }

  duplicateSession(session: SessionSchedule): void {
    const duplicatedSession: SessionRequest = {
      groupId: session.groupId,
      sessionDate: new Date(session.date).toISOString(),
      sessionType: session.sessionType,
      status: session.status,
      stage: session.stage,
      stageLevel: session.stagelevel, // or session.stageLevel if that's the correct property
      notes: session.notes || '',
      createdBy: 'admin' // or use the actual user if available
    };

    this.sessionService.createSession(duplicatedSession).subscribe({
      next: (result) => {
        this.sessions.unshift(result);
        this.applyFilters();
        this.calculateStatistics();
        
        this.messageService.add({
          severity: 'success',
          summary: 'تم النسخ',
          detail: 'تم نسخ الجلسة بنجاح'
        });
      },
      error: (error) => {
        console.error('Error duplicating session:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في نسخ الجلسة'
        });
      }
    });
  }

  // Search and Filter Methods
  onSearch(): void {
    this.applyFilters();
  }

  onGroupFilter(): void {
    this.applyFilters();
  }

  onStatusFilter(): void {
    this.applyFilters();
  }

  onDateFilter(): void {
    this.applyFilters();
  }
  viewSessionDetails(session: SessionSchedule): void {
    // Navigate to session details page or show detailed dialog
    this.router.navigate(['/sessions', session.id]);
  }

  // Export functionality
  exportSessions(): void {
    const exportData = this.filteredSessions.map(session => ({
      'عنوان الجلسة': session.title,
      'المجموعة': session.group?.groupName,
      'التاريخ': new Date(session.date).toLocaleDateString('ar-SA'),
      'وقت البداية': session.startTime,
      'المدة': `${session.duration} دقيقة`,
      'الحالة': this.getStatusLabel(session.status),
      'عدد الطلاب': session.students?.length || 0
    }));

    // Here you would implement actual export functionality
    // For now, we'll just show a success message
    this.messageService.add({
      severity: 'info',
      summary: 'تصدير',
      detail: 'سيتم تصدير البيانات قريباً'
    });
  }

  // Utility Methods
  getStatusClass(status: SessionStatus): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption?.class || 'bg-gray-100 text-gray-700';
  }

  getStatusDotClass(status: SessionStatus): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption?.dot || 'bg-gray-500';
  }

  getStatusLabel(status: SessionStatus): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption?.label || status;
  }

  getStudentInitials(name: string): string {
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  getSessionTypeClass(sessionType: string): string {
    const typeClasses = {
      'Regular': 'bg-blue-100 text-blue-700',
      'Review': 'bg-purple-100 text-purple-700',
      'Exam': 'bg-orange-100 text-orange-700',
      'Makeup': 'bg-teal-100 text-teal-700'
    };
    return typeClasses[sessionType as keyof typeof typeClasses] || 'bg-gray-100 text-gray-700';
  }

  getSessionTypeDotClass(sessionType: string): string {
    const dotClasses = {
      'Regular': 'bg-blue-500',
      'Review': 'bg-purple-500',
      'Exam': 'bg-orange-500',
      'Makeup': 'bg-teal-500'
    };
    return dotClasses[sessionType as keyof typeof dotClasses] || 'bg-gray-500';
  }

  getTeacherInitials(name: string): string {
    if (!name) return 'NN';
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getSessionTypeLabel(sessionType: string): string {
    const typeOption = this.sessionTypeOptions.find(opt => opt.value === sessionType);
    return typeOption?.label || sessionType;
  }

  trackBySessionId(index: number, session: SessionSchedule): number {
    return session.id;
  }

  trackByStudentId(index: number, student: Student): number {
    return student.studentID;
  }

  navigateBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  // Form getters
  get title() { return this.sessionForm.get('title'); }
  get description() { return this.sessionForm.get('description'); }
  get groupId() { return this.sessionForm.get('groupId'); }
  get date() { return this.sessionForm.get('date'); }
  get startTime() { return this.sessionForm.get('startTime'); }
  get duration() { return this.sessionForm.get('duration'); }
  get status() { return this.sessionForm.get('status'); }
}
