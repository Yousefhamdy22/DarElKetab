// daily-attendance.component.ts
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AttendanceService } from '../attendance.service';
import { Attendance ,AttendanceRecordDto , GroupAttendanceRequest  } from '../models';
import { Group  , GroupApi} from '../../groups/group.models';
import { Teacher } from '../../teacher/teacher.model';
import { GroupService } from '../../groups/group.service';
import { TeacherService } from '../../teacher/teacher.service';
import { Student } from '../../students/student.model';
import { AuthService } from '../../../auth/services/AuthService.service';




@Component({
  selector: 'app-daily-attendance',
  templateUrl: './daily-attendance.component.html',
  styleUrl: './daily-attendance.component.css',
  providers: [MessageService]
})
export class DailyAttendanceComponent implements OnInit {
  noStudentsFound : boolean = false;
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  selectedDate: Date = new Date();
  selectedGroup: number | null = null; 
  selectedTeacher: Teacher | null = null;
  searchQuery: string = '';

  students: Student[] = [];
  filteredStudents: Student[] = [];
  groups: Group[] = [];
  teachers: Teacher[] = [];

  statusOptions = [
    { label: 'حاضر', value: 'present' },
    { label: 'غائب', value: 'absent' },
    { label: 'معذور', value: 'excused' },
    { label: 'متأخر', value: 'late' }
  ];

  // UI state
  loading: boolean = false;
  submitting: boolean = false;
  attendanceRecorded: boolean = false;
  sidebarVisible: boolean = false;
  formSubmitted: boolean = false;

  constructor(
    private attendanceService: AttendanceService,
    private groupService: GroupService,
    private authService: AuthService, 
    private teacherService: TeacherService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadGroups();
    this.loadTeachers();
    this.checkForDraft();
  }
  mapToCommand(
    frontendData: any[], 
    selectedDate: Date,
    sessionId: number // Add sessionId parameter
  ): GroupAttendanceRequest {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      throw new Error('User ID not available');
    }

    return {
      groupId: frontendData[0]?.groupId,
      sessionId: sessionId, // Include sessionId
      date: selectedDate.toISOString(),
      markedBy: userId,
      records: frontendData.map(record => this.mapAttendanceRecord(record))
    };
  }

  private mapAttendanceRecord(record: any): AttendanceRecordDto {
    return {
      studentId: record.studentId,
      studentName: record.studentName,
      studentCode: record.studentCode,
      attendanceStatus: record.attendanceStatus,
      notes: record.notes || '',
      recentAttendance: (record.recentAttendance || []).map((history: any) => ({
        date: history.date,
        status: history.status,
        sessionName: history.sessionName
      }))
    };
  }
  private mapApiGroupToGroup(apiGroup: GroupApi): Group {
    return {
      groupID: apiGroup.groupId,
      groupName: apiGroup.groupName,
      teacherId: Number(apiGroup.teacherId),
      scheduleDay: Array.isArray(apiGroup.scheduleDays) ? apiGroup.scheduleDays.join(', ') : '',
      maxStudentNumber: apiGroup.maxCapacity,
      stage: apiGroup.educationStage,
      stageLevel: apiGroup.gradeLevel?.toString() || '',
      createdAt: new Date(apiGroup.createdAt),
      fees: 0, 
   
    };
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getGroups().subscribe({
      next: (response: any) => {
        const apiGroups: GroupApi[] = Array.isArray(response)
          ? response
          : (response?.data || []);
        // Map API groups to Group[]
        this.groups = apiGroups.map(apiGroup => this.mapApiGroupToGroup(apiGroup));
        console.log('Mapped groups:', this.groups);
        this.loading = false;
      },
      error: (err) => {
        this.handleError('فشل في تحميل المجموعات', err);
      }
    });
  }


  loadGroupStudents(groupId: number): void {
    if (!groupId) {
      console.error('Invalid group ID:', groupId);
      return;
    }
    this.loading = true;
    this.noStudentsFound = false;
    
    this.groupService.getGroupWithStudents(groupId).subscribe({
      next: (response) => {
        this.students = [];
        this.filteredStudents = [];
        
        if (response.data?.students?.length) {
          this.students = this.transformStudents(response.data.students);
          this.filteredStudents = [...this.students];
          this.noStudentsFound = false;
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
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات الطلاب',
          life: 3000
        });
      }
    });
  }
  
  private transformStudents(students: Student[]): Student[] {
    return students.map(student => ({
      ...student,
      id: student.studentID || student.studentID,
     
      registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date()
    }));
  }

  onGroupChange(event: any): void {
 
    const groupID = event.value || this.selectedGroup;
    
    if (groupID && !isNaN(Number(groupID))) {
      this.messageService.add({
        severity: 'info',
        summary: 'جاري التحميل',
        detail: 'جاري تحميل قائمة الطلاب...',
        life: 2000
      });
      this.loadGroupStudents(groupID);
    } else {
      this.resetStudents();
    }
  }

  // Add dropdown event handlers
  onDropdownShow(): void {
    console.log('Dropdown opened, available groups:', this.groups);
  }

  onDropdownHide(): void {
    console.log('Dropdown closed');
  }


  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
      },
      error: (err) => {
        this.handleError('فشل في تحميل قائمة المعلمين', err);
      }
    });
  }

  getAvatarBgClass(groupName?: string): string {
    if (!groupName) {
      return 'bg-gray-500';
    }
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500',
      'bg-teal-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'
    ];
    const index = Math.abs(this.hashCode(groupName)) % colors.length;
    return colors[index];
  }

  private hashCode(str: string): number {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  // Helper method to process different API response formats
  // private processStudentResponse(response: any): any[] {
  //   console.log('Processing student response:', response);
    
  //   // Try different possible response structures
  //   if (response?.data?.students) {
  //     return response.data.students;
  //   }
    
  //   if (response?.students) {
  //     return response.students;
  //   }
    
  //   if (response?.data && Array.isArray(response.data)) {
  //     return response.data;
  //   }
    
  //   if (Array.isArray(response)) {
  //     return response;
  //   }
    
  //   return [];
  // }



  // Enhanced error handling
  private handleError(message: string, error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message
    });
    console.error(message, error);
    this.loading = false;
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredStudents = [...this.students];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredStudents = this.students.filter(student => 
      student.name.toLowerCase().includes(query)
    );
    
    // Show search results message
    if (this.filteredStudents.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'البحث',
        detail: 'لا يوجد طلاب مطابقين لكلمة البحث'
      });
    }
  }

  markAllStatus(status: string): void {
    if (this.filteredStudents.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'لا يوجد طلاب لتحديد حالتهم'
      });
      return;
    }
    
    this.filteredStudents.forEach(student => {
      student.status = status;
    });
    
    this.messageService.add({
      severity: 'success',
      summary: 'تم التحديث',
      detail: `تم تحديد جميع الطلاب كـ "${this.getStatusLabel(status)}"`
    });
  }

  saveDraft(): void {
    if (!this.selectedGroup || this.filteredStudents.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'لا يوجد بيانات لحفظها كمسودة'
      });
      return;
    }
    
    const draftData = {
      date: this.selectedDate,
      groupId: this.selectedGroup,
      teacherId: this.selectedTeacher?.teacherId || null,
      students: this.filteredStudents.map(student => ({
        studentID: student.studentID,
        status: student.status,
        notes: student.notes
      }))
    };
    
    localStorage.setItem('attendanceDraft', JSON.stringify(draftData));
    
    this.messageService.add({
      severity: 'success',
      summary: 'تم الحفظ',
      detail: 'تم حفظ المسودة بنجاح'
    });
  }

  loadDraft(): void {
    const draftData = localStorage.getItem('attendanceDraft');
    if (!draftData) {
      this.messageService.add({
        severity: 'info',
        summary: 'معلومات',
        detail: 'لا توجد مسودة محفوظة'
      });
      return;
    }
    
    try {
      const draft = JSON.parse(draftData);
      
      this.selectedDate = new Date(draft.date);
      
      // Set the selected group
      if (draft.groupId && this.groups.length > 0) {
        this.selectedGroup = draft.groupId;
        // this.loadStudentsByGroup(draft.groupId);
      }
      
      // Set the selected teacher
      if (draft.teacherId && this.teachers.length > 0) {
        const teacherMatch = this.teachers.find(t => t.teacherId === draft.teacherId);
        if (teacherMatch) {
          this.selectedTeacher = teacherMatch;
        }
      }
      
      // Restore student statuses after students are loaded
      setTimeout(() => {
        if (this.students.length > 0 && draft.students) {
          draft.students.forEach((draftStudent: any) => {
            const student = this.students.find(s => s.studentID === draftStudent.studentID);
            if (student) {
              student.status = draftStudent.status;
              student.notes = draftStudent.notes;
            }
          });
          this.filteredStudents = [...this.students];
        }
      }, 1000);
      
      this.messageService.add({
        severity: 'success',
        summary: 'تم التحميل',
        detail: 'تم استعادة المسودة بنجاح'
      });
    } catch (error) {
      console.error('Error loading draft:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'حدث خطأ أثناء استعادة المسودة'
      });
    }
  }

  checkForDraft(): void {
    const hasDraft = localStorage.getItem('attendanceDraft') !== null;
    if (hasDraft) {
      this.messageService.add({
        severity: 'info',
        summary: 'معلومات',
        detail: 'يوجد مسودة محفوظة يمكنك استعادتها',
        life: 5000
      });
    }
  }
  resetStudents(): void {
    this.students = [];
    this.filteredStudents = [];
    this.noStudentsFound = false;
    this.selectedGroup = null;
  }
  resetForm(): void {
    this.selectedDate = new Date();
    this.selectedGroup = null;
    this.selectedTeacher = null;
    this.searchQuery = '';
    this.students = [];
    this.filteredStudents = [];
    this.attendanceRecorded = false;
    this.formSubmitted = false;
    
    this.messageService.add({
      severity: 'info',
      summary: 'تم',
      detail: 'تم إعادة تعيين جميع الحقول'
    });
  }

 
  // saveAttendance(): void {
  //   this.formSubmitted = true;
    
  //   if (!this.selectedGroup || this.filteredStudents.length === 0) {
  //     this.messageService.add({
  //       severity: 'warn',
  //       summary: 'تنبيه',
  //       detail: 'الرجاء اختيار مجموعة وتحديد حالة الحضور للطلاب'
  //     });
  //     return;
  //   }
    
  //   this.submitting = true;
    
  //   const attendanceData: Attendance[] = this.filteredStudents.map(student => ({
  //     date: this.selectedDate,
  //     status: student.status || 'present',
  //     notes: student.notes || '',
  //     studentName : student.name,
  //     studentID: student.studentID,
  //     groupId: this.selectedGroup!,
  //     AttendanceStatus: []
  //   }));
    
  //   console.log('Saving attendance data:', attendanceData , this.selectedDate);
    
  //   const command = this.mapToCommand(attendanceData, this.selectedDate, 1); // Add sessionId as needed
  //   this.attendanceService.saveGroupAttendance(command).subscribe({
  //     next: (response: any) => {
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'تم التسجيل',
  //         detail: `تم تسجيل حضور ${this.filteredStudents.length} طالب بنجاح`
  //       });
  //       this.attendanceRecorded = true;
  //       localStorage.removeItem('attendanceDraft');
  //       this.submitting = false;
  //     },
  //     error: (err) => {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'خطأ',
  //         detail: 'فشل في حفظ سجل الحضور. يرجى المحاولة مرة أخرى'
  //       });
  //       console.error('Error saving attendance:', err);
  //       this.submitting = false;
  //     }
  //   });
  // }
//-------------------------

  saveAttendance(): void {
    this.formSubmitted = true;
    
    // Validate required fields
    if (!this.selectedGroup || this.filteredStudents.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'الرجاء اختيار مجموعة وتحديد حالة الحضور للطلاب'
      });
      return;
    }

    // Validate all students have required data
    const invalidStudents = this.filteredStudents.filter(
      student => !student.studentID || !student.name
    );
    
    // if (invalidStudents.length > 0) {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'خطأ',
    //     detail: 'بعض سجلات الطلاب تفتقد بيانات أساسية (رقم الطالب أو الاسم)'
    //   });
    //   return;
    // }
    
    this.submitting = true;
    
    // Prepare attendance data
    const attendanceData = this.filteredStudents.map(student => ({
      studentId: student.studentID,
      // studentName: student.name,
      // studentCode: student.studentCode || '',
      attendanceStatus: student.status || 'Present',
      notes: student.notes || '',
      groupId: this.selectedGroup!,
      recentAttendance: [] // Add recent attendance if available
    }));
    
    console.log('Saving attendance data:', attendanceData, this.selectedDate);
    
    // Create command object
    const command = {
      groupId: this.selectedGroup,
      // sessionId: 1, // You should get this from your component state
      date: this.selectedDate.toISOString(),
      markedBy: this.authService.getUserId(), // Make sure to inject AuthService
      records: attendanceData
      
    };
    
    this.attendanceService.saveGroupAttendance(command).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم التسجيل',
          detail: `تم تسجيل حضور ${this.filteredStudents.length} طالب بنجاح`
        });
        this.attendanceRecorded = true;
        localStorage.removeItem('attendanceDraft');
        this.submitting = false;
      },
      error: (err) => {
        let errorDetail = 'فشل في حفظ سجل الحضور. يرجى المحاولة مرة أخرى';
        
        // Handle validation errors specifically
        if (err.status === 400 && err.error?.errors) {
          const firstError = Object.values(err.error.errors)[0];
          // errorDetail = firstError[0] || errorDetail;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: errorDetail
        });
        console.error('Error saving attendance:', err);
        this.submitting = false;
      }
    });
  }
 // Helper method to get selected group name
 getSelectedGroupName(): string {
  if (!this.selectedGroup) return '';
  const group = this.groups.find(g => g.groupID === this.selectedGroup);
  return group?.groupName || '';
}
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    const sidebar = document.querySelector('app-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-visible');
    }
  }

  getPresentCount(): number {
    return this.filteredStudents.filter(s => s.status === 'present').length;
  }

  getAbsentCount(): number {
    return this.filteredStudents.filter(s => s.status === 'absent').length;
  }

  getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : 'غير معروف';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'excused':
        return 'status-excused';
      case 'late':
        return 'status-late';
      default:
        return '';
    }
  }
}