import { Component, OnInit } from '@angular/core';
import { GroupService } from '../group.service';
import { MessageService } from 'primeng/api';
import { Group } from '../group.models';
import { Router } from '@angular/router';

// interface Group {
//   id: string
//   name: string
//   description: string
//   teacher: string
//   schedule: string
//   location: string
//   currentStudents: number
//   maxStudents: number
//   active: boolean
// }

interface GroupFormData {
  teacherId: number;
  groupName: string;
  description: string;
  maxCapacity: number;
  startDate: string;
  scheduleDay: string;
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
  
  // Form variables
  showAddForm = false;
  showEditForm = false;
  editingGroupId: string | null = null;
  
  groupForm: GroupFormData = {
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

  constructor(
    private groupService: GroupService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.groupService.getGroups().subscribe({
      next: (response: any) => {
        console.log('Response received:', response);
        this.groups = Array.isArray(response.data) ? response.data : [];
        console.log('Groups extracted:', this.groups);
        this.applyFilters();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل البيانات'
        });
        this.groups = [];
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

  // Form methods
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
      startDate: group.startDate.toString() || '',
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

  submitAddForm() {
    if (this.validateForm()) {
      this.groupService.createGroup(this.groupForm).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجح',
            detail: 'تم إضافة المجموعة بنجاح'
          });
          this.hideAddForm();
          this.loadGroups();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل في إضافة المجموعة'
          });
        }
      });
    }
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

    if (!this.groupForm.description.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'وصف المجموعة مطلوب'
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

    if (!this.groupForm.startTime.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'وقت البداية مطلوب'
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