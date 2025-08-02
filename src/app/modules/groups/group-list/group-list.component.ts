import { Component, OnInit } from '@angular/core';
import { GroupService } from '../group.service';
import { MessageService } from 'primeng/api';
import { Group } from '../group.models';
import { Router } from '@angular/router';
import { TeacherService } from '../../teacher/teacher.service';
import { Teacher } from '../../teacher/teacher.model';


interface GroupFormData {
  teacherId: number;
  groupName: string;
  description: string;
  maxCapacity: number;
  startDate: string;
  scheduleDay:  string;
  startTime: string;
  educationStage: string;
  gradeLevel: number;
  createdBy: string;
}
interface DropdownOption {
  label: string
  value: string
}
@Component({
  selector: 'app-group-list',
  standalone: false,
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css'
})
export class GroupListComponent  implements OnInit{
  groups: Group[] = [];
  filteredGroups: Group[] = [];

  teacher: Teacher[] = [];
  selectedTeacher: any = null;
  

  loading = false;
  // Form variables
  showAddForm = false;
  showEditForm = false;
  editingGroupId: string | null = null;

  groupForm: any = {
    teacherId: 0,
    groupName: '',
    maxCapacity: 20,
    // startDate: new Date().toISOString(),
    scheduleDays: [] as string[],
    educationStage: '',
    gradeLevel: 1,
    createdBy: 'admin' 
  };

  scheduleDayOptions = [
    { label: 'الأحد', value: 'Sunday' },
    { label: 'الإثنين', value: 'Monday' },
    { label: 'الثلاثاء', value: 'Tuesday' },
    { label: 'الأربعاء', value: 'Wednesday' },
    { label: 'الخميس', value: 'Thursday' },
    { label: 'الجمعة', value: 'Friday' },
    { label: 'السبت', value: 'Saturday' }
  ];
  // Filter variables
  searchText = '';
  selectedStatus: DropdownOption | null = null;

  statusOptions: DropdownOption[] = [
    { label: "نشطة", value: "active" },
    { label: "غير نشطة", value: "inactive" },
  ];

  // Dropdown options for form
  scheduleOptions: DropdownOption[] = [
    { label: "الأحد", value: "Sunday" },
    { label: "الإثنين", value: "Monday" },
    { label: "الثلاثاء", value: "Tuesday" },
    { label: "الأربعاء", value: "Wednesday" },
    { label: "الخميس", value: "Thursday" },
    { label: "الجمعة", value: "Friday" },
    { label: "السبت", value: "Saturday" }
  ];

  educationStageOptions: DropdownOption[] = [
    { label: "ابتدائي", value: "Elementary" },
    { label: "متوسط", value: "Middle" },
    { label: "ثانوي", value: "High" }
  ];

  gradeLevels: DropdownOption[] = [
    { label: "الصف الأول", value: "1" },
    { label: "الصف الثاني", value: "2" },
    { label: "الصف الثالث", value: "3" },
    { label: "الصف الرابع", value: "4" },
    { label: "الصف الخامس", value: "5" },
    { label: "الصف السادس", value: "6" }
  ];

  getDayLabel(value: string): string {
    const day = this.scheduleDayOptions.find(opt => opt.value === value);
    return day ? day.label : value;
  }

  constructor(
    private groupService: GroupService,
    private teacherService: TeacherService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGroups();
    this.loadTeachers();
  }


  loadGroups() {
    this.groupService.getGroups().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        // Map API response to your Group model
        this.groups = response.data.map((apiGroup: any) => ({
          groupID: apiGroup.groupId,  // Fix casing here
          groupName: apiGroup.groupName,
          teacherId: apiGroup.teacherId,
          teacher: apiGroup.teacherName ? { id: apiGroup.teacherId, name: apiGroup.teacherName } : undefined,
          scheduleDay: apiGroup.scheduleDays?.join(', ') || '',
          maxStudentNumber: apiGroup.maxCapacity,
          memberCount: apiGroup.memberCount,
          stage: this.getEducationStageName(apiGroup.educationStage),
          stageLevel: apiGroup.gradeLevel.toString(),
          startDate: new Date(apiGroup.createdAt),
          endDate: new Date(), // Default end date
          currentStudents: apiGroup.memberCount,
          active: apiGroup.status === 'Active',
          fees: 0
        }));
        
        this.applyFilters();
      },
      error: (err) => {/* error handling */}
    });
  }
  
  private getEducationStageName(stage: number): string {
    const stages = ['ابتدائي', 'متوسط', 'ثانوي'];
    return stages[stage] || 'غير محدد';
  }

  loadTeachers() {
    console.log('Starting to load teachers...');
    
    this.teacherService.getAllTeachers().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        // Handle different possible response structures
        const responseData = response.data || response.items || response;
        
        if (Array.isArray(responseData)) {
          this.teacher = responseData;
          console.log('Successfully loaded teachers:', this.teacher.length);
        } else if (responseData && typeof responseData === 'object') {
          // Handle case where data is an object with array inside
          this.teacher = Object.values(responseData);
          console.log('Converted object to teachers array:', this.teacher);
        } else {
          console.warn('Unexpected data format:', response);
          this.teacher = [];
        }
      },
      error: (err) => {
        console.error('Error loading teachers:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل البيانات: ' + (err.message || '')
        });
        this.teacher = [];
      }
    });
  }

  applyFilters() {
    if (!Array.isArray(this.groups)) {
      this.filteredGroups = [];
      return;
    }

    this.filteredGroups = this.groups.filter((group) => {
      const matchesSearch =
        !this.searchText ||
        group.groupName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        group.description?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        group.teacher?.name?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus.value === "active" && group.active) ||
        (this.selectedStatus.value === "inactive" && !group.active);

      return matchesSearch && matchesStatus;
    });
  }

  getTotalStudents(): number {
    return this.groups.reduce((total, group) => total + (group.currentStudents ?? 0), 0);
  }

  getActiveGroupsCount(): number {
    return this.groups.filter((group) => group.active).length;
  }


  showAddGroupForm() {
    this.resetForm();
    this.showAddForm = true;
  }

  showEditGroupForm(group: Group) {
    this.resetForm();
    this.editingGroupId = String(group.groupID);
    this.groupForm = {
      teacherId: group.teacher?.teacherId || 0,
      groupName: group.groupName || '',
      description: group.description || '',
      maxCapacity: group.maxStudentNumber || 100,
      // startDate: group.startDate.toString() || '',
      scheduleDay: group.scheduleDay || 'Sunday',
      startTime: group.schedule || '',
      educationStage: group.stage || 'Elementary',
      gradeLevel: Number(group.stageLevel) || 6,
      createdBy: '',
    };
    this.showEditForm = true;
  }

  resetForm() {
    this.groupForm = {
      teacherId: 0,
      groupName: '',
      description: '',
      maxCapacity: 100,
      startDate: '',
      scheduleDay: 'Sunday',
      startTime: '',
      educationStage: 'Elementary',
      gradeLevel: 6,
      createdBy: ''
    };
    this.editingGroupId = null;
  }

  hideAddForm() {
    this.showAddForm = false;
    this.resetForm();
  }

  hideEditForm() {
    this.showEditForm = false;
    this.resetForm();
  }

  // submitAddForm() {
  //   const payload = {
  //     command: "CreateGroup", // or whatever command name the API expects
  //     ...this.groupForm,
  //     // startDate: this.groupForm.startDate ? new Date(this.groupForm.startDate).toISOString() : null,
  //     // Remove the .join() - keep scheduleDays as an array
  //     scheduleDays: this.groupForm.scheduleDays // assuming this is already an array
  //   };
  
  //   this.groupService.createGroup(payload).subscribe({
  //     next: (response) => {
  //       this.showAddForm = false;
  //     },
  //     error: (err) => {
  //       console.error('Error creating group:', err);
  //     }
  //   });
  // }
  submitAddForm() {
    const payload = {
      command: "CreateGroup",
      ...this.groupForm,
      scheduleDays: this.groupForm.scheduleDays
    };
  
    this.groupService.createGroup(payload).subscribe({
      next: (response) => {
        this.showAddForm = false;
      },
      error: (err) => {
        console.error('Error creating group:', err);
      }
    });
  }

  submitEditForm() {
    if (this.validateForm() && this.editingGroupId) {
      this.groupService.updateGroup(Number(this.editingGroupId), this.groupForm).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجح',
            detail: 'تم تحديث المجموعة بنجاح'
          });
          this.hideEditForm();
          this.loadGroups();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل في تحديث المجموعة'
          });
        }
      });
    }
  }

  deleteGroup(groupId: string) {
    if (confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      this.groupService.deleteGroup(Number(groupId)).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجح',
            detail: 'تم حذف المجموعة بنجاح'
          });
          this.loadGroups();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل في حذف المجموعة'
          });
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.groupForm.groupName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'اسم المجموعة مطلوب'
      });
      return false;
    }


    if (this.groupForm.maxCapacity <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'السعة القصوى يجب أن تكون أكبر من صفر'
      });
      return false;
    }

    if (!this.groupForm.startDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'تاريخ البداية مطلوب'
      });
      return false;
    }

  

    return true;
  }

  goToHome() {
    this.router.navigate(['/dashboard']);
  }

  navigateToGroupDetails(groupId: string) {
    this.router.navigate(['/group/details', groupId]);
  }
}