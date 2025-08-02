import { Component , OnInit , ViewChild} from '@angular/core';
import { Teacher, TeacherStatus } from './teacher.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeacherService } from './teacher.service';



import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';


@Component({
  selector: 'app-teacher',
  standalone: false,
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.css'
})
export class TeacherComponent implements OnInit {
  @ViewChild('moreActionsMenu') moreActionsMenu!: Menu;

  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  selectedTeacher: Teacher | null = null;
  teacherForm: FormGroup;
  isDialogVisible = false;
  showDetailsDialog = false;
  isLoading = false;
  
  // Search and Filter
  searchTerm = '';
  selectedStatus = '';
  selectedSpecialization = '';
  
  // Dropdown Options
  statusOptions = [
    { label: 'جميع الحالات', value: '' },
    { label: 'نشط', value: 'active' },
    { label: 'غير نشط', value: 'inactive' }
  ];
  
  specializationOptions = [
    { label: 'جميع التخصصات', value: '' },
    { label: 'تحفيظ القرآن', value: 'تحفيظ القرآن' },
    { label: 'التجويد', value: 'التجويد' },
    { label: 'الفقه', value: 'الفقه' },
    { label: 'التفسير', value: 'التفسير' },
    { label: 'الحديث', value: 'الحديث' },
    { label: 'العقيدة', value: 'العقيدة' },
    { label: 'اللغة العربية', value: 'اللغة العربية' }
  ];
  
  moreActionsItems: MenuItem[] = [];

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.teacherForm = this.createTeacherForm();
    this.initializeMoreActionsMenu();
  }

  ngOnInit() {
    this.loadTeachers();

  }

  // private createTeacherForm(): FormGroup {
  //   return this.fb.group({
  //     name: ['', [Validators.required, Validators.minLength(3)]],
  //     email: ['', [Validators.required, Validators.email]],
  //     phone: ['', [Validators.required, Validators.pattern(/^05\d{8}$/)]],
  //     specialization: ['', Validators.required],
  //     qualification: ['', Validators.required],
  //     experience: [0, [Validators.min(0), Validators.max(50)]],
  //     joinDate: [new Date(), Validators.required],
  //     isActive: [true]
  //   });
  // }
  private createTeacherForm(): FormGroup {
    return this.fb.group({
      userId: [''], // Will be populated when editing
      name: ['', [Validators.required, Validators.minLength(3)]],
      phoneNunber: ['', [Validators.required, Validators.pattern(/^01\d{9}$/)]],
      eduQulaified: ['', Validators.required],
      specialization: ['', Validators.required],
      joinDa: [new Date(), Validators.required],
      status: ['Active'] // Default to Active
    });
  }

  private initializeMoreActionsMenu() {
    this.moreActionsItems = [
      {
        label: 'إرسال بريد إلكتروني',
        icon: 'pi pi-envelope',
        command: () => this.sendEmail()
      },
      {
        label: 'عرض المجموعات',
        icon: 'pi pi-users',
        command: () => this.viewTeacherGroups()
      },
      {
        label: 'تقرير الأداء',
        icon: 'pi pi-chart-bar',
        command: () => this.generatePerformanceReport()
      },
      {
        separator: true
      },
      {
        label: 'حذف المعلم',
        icon: 'pi pi-trash',
        // command: () => this.deleteTeacher(this.selectedTeacher?.userId ),
        styleClass: 'text-red-500'
      }
    ];
  }



  loadTeachers(): void {
    this.isLoading = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
     
        this.filteredTeachers = teachers;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load teachers'
        });
        this.isLoading = false;
      }
    });
  }

  showAddDialog() {
    this.selectedTeacher = null;
    this.teacherForm.reset();
    this.teacherForm.patchValue({
      joinDate: new Date(),
      isActive: true,
      experience: 0
    });
    this.isDialogVisible = true;
  }
  showEditDialog(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    
   
    const joinDate = typeof teacher.joinDate === 'string' 
      ? new Date(teacher.joinDate) 
      : teacher.joinDate;
  
    this.teacherForm.patchValue({
      name: teacher.name,
      phone: teacher.phoneNumber,
      joinDate: joinDate,
      isActive: teacher.status === TeacherStatus.Active
    });
    
    this.isDialogVisible = true;
  }


  // saveTeacher() {
  //   if (this.teacherForm.valid) {
  //     const formData = this.teacherForm.value;
      
  //     if (this.selectedTeacher) {
  //       // Update existing teacher
  //       const index = this.teachers.findIndex(t => t.teacherId === this.selectedTeacher!.teacherId);
  //       if (index !== -1) {
  //         this.teachers[index] = {
  //           ...this.selectedTeacher,
  //           ...formData
  //         };
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'تم التحديث بنجاح',
  //           detail: 'تم تحديث بيانات المعلم بنجاح'
  //         });
  //       }
  //     } else {
  //       // Add new teacher
  //       const newTeacher: Teacher = {
  //         id: Date.now().toString(),
  //         ...formData
  //       };
  //       this.teachers.push(newTeacher);
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'تم الإضافة بنجاح',
  //         detail: 'تم إضافة المعلم الجديد بنجاح'
  //       });
  //     }
      
  //     this.filteredTeachers = [...this.teachers];
  //     this.isDialogVisible = false;
  //     this.teacherForm.reset();
  //   }
  // }

  saveTeacher() {
    if (this.teacherForm.valid) {
      const formData = this.teacherForm.value;
      
      if (this.selectedTeacher) {
        // Update existing teacher
        
        this.teacherService.updateTeacher(this.selectedTeacher.teacherId, formData)
          .subscribe({
            next: (updatedTeacher) => {
              const index = this.teachers.findIndex(t => t.userId === this.selectedTeacher!.userId);
              if (index !== -1) {
                this.teachers[index] = updatedTeacher;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'تم التحديث بنجاح',
                detail: 'تم تحديث بيانات المعلم بنجاح'
              });
              this.resetFormAndClose();
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'خطأ في التحديث',
                detail: 'حدث خطأ أثناء محاولة تحديث بيانات المعلم'
              });
            }
          });
      } else {
        // Add new teacher
        this.teacherService.createTeacher(formData)
          .subscribe({
            next: (newTeacher) => {
              this.teachers.push(newTeacher);
              this.messageService.add({
                severity: 'success',
                summary: 'تم الإضافة بنجاح',
                detail: 'تم إضافة المعلم الجديد بنجاح'
              });
              this.resetFormAndClose();
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'خطأ في الإضافة',
                detail: 'حدث خطأ أثناء محاولة إضافة المعلم الجديد'
              });
            }
          });
      }
    }
  }
  private resetFormAndClose() {
    this.filteredTeachers = [...this.teachers];
    this.isDialogVisible = false;
    this.teacherForm.reset();
    this.selectedTeacher = null;
  }

  deleteTeacher(teacherId: string) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا المعلم؟ لا يمكن التراجع عن هذا الإجراء.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.teachers = this.teachers.filter(t => t.teacherId !== teacherId);
        this.filteredTeachers = [...this.teachers];
        this.messageService.add({
          severity: 'success',
          summary: 'تم الحذف',
          detail: 'تم حذف المعلم بنجاح'
        });
      }
    });
  }

  toggleTeacherStatus(teacher: Teacher) {
    const newStatus = teacher.status === TeacherStatus.Active ? TeacherStatus.Inactive : TeacherStatus.Active;
    const action = newStatus === TeacherStatus.Active ? 'تفعيل' : 'إلغاء تفعيل';
    
    this.confirmationService.confirm({
      message: `هل أنت متأكد من ${action} حساب المعلم ${teacher.name}؟`,
      header: `تأكيد ${action}`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'نعم',
      rejectLabel: 'إلغاء',
      accept: () => {
        teacher.status = newStatus;
        this.messageService.add({
          severity: 'success',
          summary: `تم ${action} بنجاح`,
          detail: `تم ${action} حساب المعلم ${teacher.name}`
        });
      }
    });
  }

  viewTeacher(teacher: Teacher) {
    this.selectedTeacher = teacher;
    this.showDetailsDialog = true;
  }

  editFromDetails() {
    this.showDetailsDialog = false;
    if (this.selectedTeacher) {
      this.showEditDialog(this.selectedTeacher);
    }
  }

  showMoreActions(event: Event, teacher: Teacher) {
    this.selectedTeacher = teacher;
    this.moreActionsMenu.toggle(event);
  }

  filterTeachers() {
    this.filteredTeachers = this.teachers.filter(teacher => {
      const matchesSearch = !this.searchTerm || 
        teacher.name.toLowerCase().includes(this.searchTerm.toLowerCase()) 
        // teacher..toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        // teacher.phone.includes(this.searchTerm) ||
        // teacher.specialization.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' && teacher.status) ||
        (this.selectedStatus === 'inactive' && !teacher.status);
      
      const matchesSpecialization = !this.selectedSpecialization 
        // teacher.specialization === this.selectedSpecialization;
      
      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedSpecialization = '';
    this.filteredTeachers = [...this.teachers];
  }

  refreshTeachers() {
    this.loadTeachers();
    this.messageService.add({
      severity: 'info',
      summary: 'تم التحديث',
      detail: 'تم تحديث قائمة المعلمين'
    });
  }

  exportTeachers() {
    // Implementation for exporting teachers data
    this.messageService.add({
      severity: 'info',
      summary: 'جاري التصدير',
      detail: 'سيتم تصدير البيانات قريباً'
    });
  }

  // Helper Methods
  getInitials(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getActiveTeachersCount(): number {
    return this.teachers.filter(t => t.status).length;
  }

  getNewTeachersCount(): number {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return this.teachers.filter(t => {
      const joinDate = new Date(t.joinDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
  }

  getAverageExperience() {
    // if (this.teachers.length === 0) return '0';
    
    // const totalExperience = this.teachers.reduce((sum, teacher) => sum + teacher.experience, 0);
    // const average = totalExperience / this.teachers.length;
    
    // return average.toFixed(1);
  }

  getDateDifference(joinDate: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(joinDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 30) return `${days} يوم`;
    if (days < 365) return `${Math.floor(days / 30)} شهر`;
    return `${Math.floor(days / 365)} سنة`;
  }

  // More Actions Methods
  sendEmail() {
    // if (this.selectedTeacher) {
    //   window.open(`mailto:${this.selectedTeacher.email}`, '_blank');
    // }
  }

  viewTeacherGroups() {
    this.messageService.add({
      severity: 'info',
      summary: 'عرض المجموعات',
      detail: `عرض مجموعات المعلم ${this.selectedTeacher?.name}`
    });
  }

  generatePerformanceReport() {
    this.messageService.add({
      severity: 'info',
      summary: 'تقرير الأداء',
      detail: `إنشاء تقرير أداء للمعلم ${this.selectedTeacher?.name}`
    });
  }
}