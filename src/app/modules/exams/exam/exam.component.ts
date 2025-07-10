import { Component ,OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '../../students/student.service';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ExamService } from './exam.service';
import { GroupService } from '../../groups/group.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { exam  , ExamPayload} from './exam.model';
import { Group } from '../../groups/group.models';
import { formatDate } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';

// Register Arabic locale
registerLocaleData(localeAr);
@Component({
  selector: 'app-exam',
  standalone: false,
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css',
  providers: [MessageService, ConfirmationService]
})
export class ExamComponent implements OnInit {

 
tabs = [
  {
    label: 'الامتحانات',
    icon: 'pi pi-book',
    value: 'exams',
    index: 0
  },
  {
    label: 'النتائج',
    icon: 'pi pi-list-check',
    value: 'results',
    index: 1
  }
];

groups: Group[] = [];

activeTabIndex: number = 0;
activeTab: string = 'exams';
currentDate: Date = new Date();
currentUser: string = 'مدير النظام'; // Or retrieve from your auth service

// View state management
viewMode: 'list' | 'add' | 'filter' = 'list';

// Set active tab
setActiveTab(tab: any): void {
  this.activeTab = tab.value;
  this.activeTabIndex = tab.index;
}
  showExamList() {
    this.viewMode = 'list';
   
    console.log('Switching to exam list view');
  }

  showAddExam() {
    this.viewMode = 'add';
   
    console.log('Switching to add exam view');
  }

  showFilterExams() {
    this.viewMode = 'filter';
    // Additional logic to set up filtering options
    console.log('Switching to filter exams view');
  }
  // Exams
  exams: exam[] = [];
  filteredExams: exam[] = [];
  loading = false;
  searchQuery = '';
  //selectedGroup: any;
  fromDate!: Date;
  toDate!: Date;
  selectedGroup: Group | null = null;

  // Results
  selectedExam: any;
  selectgroup: Group | null = null;
  examResults: any[] = [];

  loadingResults = false;
  loadingGroups = false;
  selectedStudent: any;

  // Dialog
  showDialog = false;
  editMode = false;
  examForm!: FormGroup;
  saving = false;

  dropdownOptions: any[] = []; 
  constructor(
    private examService: ExamService,
    private groupService: GroupService,
    private studentService: StudentService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadGroups();
    this.loadExams();
    this.createExam();

    this.dropdownOptions = [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 }
    ];
    
   
   
  }

  initForm(exam?: exam): void {
    this.examForm = this.fb.group({
      examID: [exam?.examID || null],
      // Change from examName to Name to match API expectation
      Name: [exam?.Name || '', Validators.required],
      Description: [exam?.Description || '', Validators.required],
      maxScore: [exam?.totaldegree || 100, [Validators.required, Validators.min(1)]],
      examDate: [exam?.ExamDate ? new Date(exam.ExamDate) : new Date(), Validators.required],
      groupID: [exam?.GroupId || '', Validators.required],
      passPercentage: [exam?.PassDegree || 50],
      isActive: [exam?.isActive !== undefined ? exam.isActive : true]
    });
  }

  createExam(): void {
    if (this.examForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى تعبئة جميع الحقول المطلوبة'
      });
      this.examForm.markAllAsTouched();
      return;
    }
  
    // Prepare payload (matching API expectations)
    const payload: ExamPayload = {
      Name: String(this.examForm.value.Name).trim(),
      Description: String(this.examForm.value.Description).trim(),
      totaldegree: Number(this.examForm.value.maxScore),
      ExamDate: new Date(this.examForm.value.examDate).toISOString(),
      GroupId: Number(this.examForm.value.groupID),
      PassDegree: Number(this.examForm.value.passPercentage) || 50,
    };
  
    console.log('API Payload:', payload); // Debugging
  
    this.examService.createExam(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم حفظ الامتحان بنجاح'
        });
        this.loadExams();
        this.showDialog = false;
      },
      error: (error) => {
        console.error('API Error:', error.error);
        
        // Display validation errors if available
        if (error.error?.errors) {
          Object.keys(error.error.errors).forEach(key => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ في الحقل: ' + key,
              detail: error.error.errors[key].join(', ')
            });
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: error.error?.title || 'فشل حفظ الامتحان'
          });
        }
      }
    });
  }
 
  loadGroups(): void {
    this.loadingGroups = true;
    this.groupService.getGroups().subscribe({
      next: (response: any) => {
       
        this.groups = this.transformGroupData(response);
        this.loadingGroups = false;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.groups = []; 
        this.loadingGroups = false;
        this.messageService.add({
          severity: 'error',
          summary: 'فشل تحميل المجموعات',
          detail: 'تعذر تحميل قائمة المجموعات'
        });
      }
    });
  }
  private transformGroupData(response: any): any[] {
   
    let groupsArray = Array.isArray(response?.data) ? response.data : 
                     Array.isArray(response) ? response : [];

   
    return groupsArray.sort((a: Group, b: Group) => 
      a.groupName.localeCompare(b.groupName)
    );
  }
  
  private normalizeResponse(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
    return [];
  }
 
  editExam(exam: any): void {
    this.selectedExam = { ...exam }; 
    this.showDialog = true; 
    this.editMode = true; 
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getallExams().subscribe({
      next: (response: any) => {
        // Transform API data to match table structure
        this.exams = this.transformExamData(response);
        this.filteredExams = [...this.exams];
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تحميل الامتحانات',
          life: 5000
        });
        this.loading = false;
      }
    });
  }

  private transformExamData(response: any): exam[] {
    // Handle single object or array response
    const examsArray = Array.isArray(response) ? response : 
                      response?.data ? response.data : 
                      response ? [response] : [];

    return examsArray.map((exam: any) => ({
      id: exam.id,
      examID: exam.id, // For compatibility with existing template
      Name: exam.examName, // Map examName to Name
      Description: exam.description, // Map description to Description
      groupid: exam.groupid,
      // title: exam.examName, // Map examName to title
      groupName: this.getGroupName(exam.groupid), // You'll need to implement this
      examDate: exam.examDate,
      maxScore: exam.totalMarks, // Map totalMarks to maxScore
      isActive: this.checkIfActive(exam.examDate) // Implement your active logic
    }));
  }

  private getGroupName(groupId: number): string {
    // Implement logic to get group name from your groups data
    // This might come from another service call or local data
    return 'المجموعة ' + groupId; // Example implementation
  }

  private checkIfActive(examDate: string): boolean {
    // Implement your logic to determine if exam is active
    const today = new Date();
    const examDateObj = new Date(examDate);
    return examDateObj >= today;
  }
  getAverageScore(): number {
    if (!this.examResults || this.examResults.length === 0) {
      return 0;
    }
    const totalScore = this.examResults.reduce((sum, result) => sum + (result.score || 0), 0);
    return totalScore / this.examResults.length;
  }
  getPassPercentage(): number {
    if (!this.examResults || this.examResults.length === 0) {
      return 0;
    }
    const passingStudents = this.examResults.filter(result => result.score >= (this.selectedExam?.maxScore * (this.selectedExam?.passPercentage / 100)));
    return (passingStudents.length / this.examResults.length) * 100;
  }

  getMaxScore(): number {
    return Math.max(...this.examResults.map(result => result.score || 0));
  }
  printResults(): void {
    console.log('Printing results...');
    // Add logic to handle printing results if needed
  }
  exportExcel(): void {
    // Logic to export exam results to Excel
    console.log('Exporting exam results to Excel...');
  }
  showAddStudentsDialog(): void {
    // Logic to show the dialog for adding students
    console.log('Add Students Dialog opened');
  }
  filterExams(): void {
    this.filteredExams = this.exams.filter(exam => {
      const matchesSearch = !this.searchQuery || 
        exam.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesGroup = !this.selectgroup || exam.GroupId === this.selectgroup.groupID;
      const matchesDate = !this.fromDate || new Date(exam.ExamDate) >= this.fromDate;
      return matchesSearch && matchesGroup && matchesDate;
    });
  }

  showExamDialog(exam?: any): void {
    this.editMode = !!exam;
    if (this.editMode) {
      this.examForm.patchValue(exam);
    } else {
      this.examForm.reset();
      this.examForm.patchValue({
        examDate: new Date(),
        maxScore: 100,
        isActive: true
      });
    }
    this.showDialog = true;
  }

  saveExam(): void {
    if (this.examForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى تعبئة جميع الحقول المطلوبة'
      });
      this.examForm.markAllAsTouched();
      return;
    }
  
    this.saving = true;
  
    // Directly use the form field names that match the API
    const payload: ExamPayload = {
      Name: String(this.examForm.value.Name).trim(),
      Description: String(this.examForm.value.Description).trim(),
      totaldegree: Number(this.examForm.value.maxScore),
      ExamDate: new Date(this.examForm.value.examDate).toISOString(),
      GroupId: Number(this.examForm.value.groupID),
      PassDegree: Number(this.examForm.value.passPercentage) || 50,
    };

    if (!payload.Name || !payload.Description) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'عنوان الامتحان والوصف مطلوبان'
      });
      this.saving = false;
     
    // For edit mode
    if (this.editMode && this.examForm.value.examID) {
      payload['examID'] = Number(this.examForm.value.examID);
    }
  
    console.log('Final Payload:', payload);
  
    const request = this.editMode 
      ? this.examService.updateExam(payload)
      : this.examService.createExam(payload);
  
    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: this.editMode ? 'تم تحديث الامتحان' : 'تم إنشاء الامتحان'
        });
        this.loadExams();
        this.showDialog = false;
      },
      error: (error) => {
        console.error('Full error response:', error);
        console.error('Validation errors:', error.error?.errors);
        
        if (error.error?.errors) {
          Object.entries(error.error.errors).forEach(([field, messages]) => {
            this.messageService.add({
              severity: 'error',
              summary: `خطأ في الحقل: ${field}`,
              detail: Array.isArray(messages) ? messages.join(', ') : String(messages)
            });
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: error.error?.message || 'فشل حفظ الامتحان'
          });
        }
      },
      complete: () => {
        this.saving = false;
      }
    });
  }
}
  // Helper method for date formatting
  private formatDateForAPI(date: any): string {
    if (!date) return '';
    
    // Handle both string and Date object inputs
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Ensure valid date
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided:', date);
      return '';
    }
    
    return dateObj.toISOString();
  }

  confirmDelete(examID: number): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الامتحان؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => this.deleteExam(examID)
    });
  }

  deleteExam(examID: number): void {
    this.examService.deeleteExam(examID).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم الحذف',
          detail: 'تم حذف الامتحان بنجاح'
        });
        this.loadExams();
      },
      error: (err) => {
        console.error('Error deleting exam:', err);
      }
    });
  }

  viewResults(examID: number): void {
    this.activeTab = 'results';
    this.loadingResults = true;
    
    this.examService.getExamById(examID).subscribe(exam => {
      this.selectedExam = exam;
      
      this.examService.getExamById(examID).subscribe(results => {
        this.examResults = results;
        this.loadingResults = false;
      });
    });
  }

  saveResult(result: any): void {
    this.examService.saveExamResults(result).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم الحفظ',
          detail: 'تم حفظ النتيجة بنجاح'
        });
      },
      error: (err) => {
        console.error('Error saving result:', err);
      }
    });
  }

  saveAllResults(): void {
    this.confirmationService.confirm({
      message: 'هل تريد حفظ جميع التغييرات؟',
      header: 'تأكيد الحفظ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.examService.saveExamResults(this.examResults).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم الحفظ',
              detail: 'تم حفظ جميع النتائج بنجاح'
            });
          },
          error: (err) => {
            console.error('Error saving results:', err);
          }
        });
      }
    });
  }

  getGrade(score: number): string {
    if (!this.selectedExam) return '';
    const percentage = (score / this.selectedExam.maxScore) * 100;
    
    if (percentage >= 90) return 'ممتاز';
    if (percentage >= 80) return 'جيد جداً';
    if (percentage >= 70) return 'جيد';
    if (percentage >= 60) return 'مقبول';
    return 'راسب';
  }

  getGradeSeverity(score: number): string {
    if (!this.selectedExam) return '';
    const percentage = (score / this.selectedExam.maxScore) * 100;
    
    if (percentage >= 70) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  }
}
