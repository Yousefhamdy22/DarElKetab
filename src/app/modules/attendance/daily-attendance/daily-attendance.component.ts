// daily-attendance.component.ts
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AttendanceService } from '../attendance.service';
import { Attendance } from '../models';
import { Group } from '../../groups/group.models';
import { Teacher } from '../../teacher/teacher.model';
import { GroupService } from '../../groups/group.service';
import { TeacherService } from '../../teacher/teacher.service';
import { Student } from '../../students/student.model';

@Component({
  selector: 'app-daily-attendance',
  templateUrl: './daily-attendance.component.html',
  styleUrl: './daily-attendance.component.css',
  providers: [MessageService]
})
export class DailyAttendanceComponent implements OnInit {

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  selectedDate: Date = new Date();
  selectedGroup: number | null = null; // Changed to store just the groupID
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
    private teacherService: TeacherService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadGroups();
    this.loadTeachers();
    this.checkForDraft();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getGroups().subscribe({
      next: (response: any) => {
        console.log('Groups API response:', response);
        
        // Handle different response formats
        this.groups = Array.isArray(response) ? response : (response?.data || []);
        
        // Ensure groups have the required properties
        this.groups = this.groups.map(group => ({
          ...group,
          groupName: group.groupName || `المجموعة ${group.groupID}`
        }));
        
        console.log('Processed groups:', this.groups);
        this.loading = false;
      },
      error: (err) => {
        this.handleError('فشل في تحميل المجموعات', err);
      }
    });
  }

  // Fixed onGroupChange method
  onGroupChange(event: any): void {
    console.log('Group selection event:', event);
    
    // Handle both direct value and event object
    const groupId = event?.value || event;
    this.selectedGroup = groupId;
    
    console.log('Selected group ID:', this.selectedGroup);
    
    if (this.selectedGroup) {
      this.messageService.add({
        severity: 'info',
        summary: 'جاري التحميل',
        detail: 'جاري تحميل قائمة الطلاب...',
        life: 2000
      });
      this.loadStudentsByGroup(this.selectedGroup);
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

  // Helper method to get selected group name
  getSelectedGroupName(): string {
    if (!this.selectedGroup) return '';
    const group = this.groups.find(g => g.groupID === this.selectedGroup);
    return group?.groupName || '';
  }

  loadStudentsByGroup(groupId: number): void {
    if (!groupId) {
      this.resetStudents();
      return;
    }

    console.log('Loading students for group ID:', groupId);
    this.loading = true;
    
    this.groupService.getGroupWithStudents(groupId).subscribe({
      next: (response: any) => {
        console.log('Students API response:', response);
        
        const students = this.processStudentResponse(response);
        console.log('Processed students:', students);
        
        if (students && students.length > 0) {
          // Get the group name for display
          const groupName = this.getSelectedGroupName();
          
          this.students = students.map(student => ({
            studentID: student.studentID || student.id,
            name: student.name,
            group: groupName,
            initials: this.getInitials(student.name),
            absenceCount: student.absenceCount || 0,
            status: 'present', // Default status
            notes: '',
            // Include all other student properties
            ...student
          }));
          
          this.filteredStudents = [...this.students];
          console.log('Final mapped students:', this.filteredStudents);
          
          this.messageService.add({
            severity: 'success',
            summary: 'تم التحميل بنجاح',
            detail: `تم تحميل ${this.students.length} طالب من مجموعة ${groupName}`,
            life: 3000
          });
        } else {
          this.resetStudents();
          this.messageService.add({
            severity: 'warn',
            summary: 'لا يوجد طلاب',
            detail: 'المجموعة المحددة لا تحتوي على أي طلاب',
            life: 3000
          });
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.handleError('فشل في تحميل قائمة الطلاب. يرجى المحاولة مرة أخرى.', err);
        this.resetStudents();
      }
    });
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
  private processStudentResponse(response: any): any[] {
    console.log('Processing student response:', response);
    
    // Try different possible response structures
    if (response?.data?.students) {
      return response.data.students;
    }
    
    if (response?.students) {
      return response.students;
    }
    
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  }

  // Reset students data
  private resetStudents(): void {
    this.students = [];
    this.filteredStudents = [];
    this.loading = false;
  }

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
        this.loadStudentsByGroup(draft.groupId);
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
      }, 1000); // Increased timeout to ensure students are loaded
      
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

  saveAttendance(): void {
    this.formSubmitted = true;
    
    if (!this.selectedGroup || this.filteredStudents.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'الرجاء اختيار مجموعة وتحديد حالة الحضور للطلاب'
      });
      return;
    }
    
    this.submitting = true;
    
    const attendanceData: Attendance[] = this.filteredStudents.map(student => ({
      date: this.selectedDate,
      status: student.status || 'present',
      notes: student.notes || '',
      studentID: student.studentID,
      groupId: this.selectedGroup!
    }));
    
    console.log('Saving attendance data:', attendanceData);
    
    this.attendanceService.saveGroupAttendance(attendanceData).subscribe({
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
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في حفظ سجل الحضور. يرجى المحاولة مرة أخرى'
        });
        console.error('Error saving attendance:', err);
        this.submitting = false;
      }
    });
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