import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';


import { exam } from '../exam/exam.model';
import { ExamResultDto, ExamResultStatsDto } from './examresult.model';
import { ExamResulteService } from './examresulte.service';
import { ExamService } from '../exam/exam.service';
import { Group } from '../../groups/group.models';
import { Student } from '../../students/student.model';
import { GroupService } from '../../groups/group.service';



@Component({
  selector: 'app-exam-resulte',
  standalone: false,
  templateUrl: './exam-resulte.component.html',
  styleUrl: './exam-resulte.component.css',
  providers: [MessageService , ConfirmationService]
})
export class ExamResulteComponent implements OnInit {

showError(summary: string, detail: string): void {
  this.messageService.add({
    severity: 'error',
    summary: summary,
    detail: detail
  });
}
  selectedAvailableStudents: any[] = [];
  examResults: ExamResultDto[] = [];
  filteredResults: ExamResultDto[] = [];
  examStats: ExamResultStatsDto | null = null;
  loadingResults: boolean = false;
  topStudents: ExamResultDto[] = [];

  //exams: exam[] = [];
  selectedExam: exam | null = null;
  //selectedExamId: number | null = null;
  examId: number | null = null;


  groups: Group[] = [];
  exams: exam[] = [];
  selectedGroupId: number | null = null;
  selectedExamId: number | null = null;
  loadingGroups: boolean = false;
  loadingExams: boolean = false;
  

  //groups: Group[] = [];
  selectedGroup: Group | null = null;


  loading = false;
  //loadingExams = false;
 
  //loadingGroups: boolean = false;

  currentUser: string = 'اسم المستخدم'; 
  currentExamId: number | null = null;
  currentDate: Date = new Date();

//chart data
  scoreDistributionData: any;
  passFailData: any;
  gradesDistributionData: any;
  chartOptions: any;
  pieChartOptions: any;

  // Filtering
  showAdvancedSearch: boolean = false;
  filters: { studentName: string; studentCode: string; grade: string } = {
    studentName: '',
    studentCode: '',
    grade: ''
  };
  globalFilterValue: string = '';
  gradeOptions: any[] = [
    { label: 'ممتاز', value: 'A' },
    { label: 'جيد جدا', value: 'B' },
    { label: 'جيد', value: 'C' },
    { label: 'مقبول', value: 'D' },
    { label: 'راسب', value: 'F' }
  ];

   // Student management
   availableStudents: Student[] = [];
   selectedStudents: Student[] = [];
   displayAddStudentsDialog: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examResultsService: ExamResulteService,
    private examService: ExamService,
    private groupservice: GroupService,
    private messageService: MessageService,
    private cons: ConfirmationService,
  ) {}

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectedExamId = +params['id'];
       // this.loadExamResults();
      }
    });
    this.examId = +this.route.snapshot.paramMap.get('id')!;
   
    this.initChartOptions();
    this.loadGroups();
    this.loadExamsByGroup(this.selectedExamId!);
    this.exams = [];
    this.loadExams();
    if (this.examId) {
      // this.loadExamDetails();
      this.loadExamResults(this.examId!);
      this.loadGroups();
    } else {
      this.router.navigate(['/exams']);
    }
  }
  initChartOptions(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    this.pieChartOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }
  loadGroups(): void {
    this.loadingGroups = true;
    this.groupservice.getGroups().subscribe({
      next: (response: any) => {
       
        this.groups = this.transformGroupData(response);
        this.loadingGroups = false;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.groups = []; 
        this.loadingGroups = false;
        this.showError('فشل تحميل المجموعات', 'تعذر تحميل قائمة المجموعات');
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


 

  // Method to get the full group object when needed
  getSelectedGroup() {
    return this.groups.find(group => group.groupID === this.selectedGroupId);
  }
  
  // Method to get the full exam object when needed

  onGroupChange() {
    // Reset exam selection when group changes
    this.selectedExamId = null;
    // Load exams for selected group
    if (this.selectedGroupId) {
      this.loadExamsByGroup(this.selectedGroupId);
      this.loadGroups();
    } else {
      this.exams = [];
    }
  }
  

  loadExamsByGroup(groupId: number): void {
    this.examService.getExamById(groupId).subscribe({
      next: (exams) => {
        this.exams = exams;
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تحميل الامتحانات'
        });
      }
    });
  }

  

// Then when you need the full exam object:
getSelectedExam() {
  return this.exams.find(exam => exam.examID === this.selectedExamId);
}
loadExams() {
  this.loadingExams = true;
  this.examService.getallExams().subscribe({
    next: (response: any) => {
      // IMPORTANT: Always make sure exams is an array
      this.exams = Array.isArray(response?.data) ? response.data : 
                  Array.isArray(response) ? response : [];
      this.loadingExams = false;
    },
    error: (err) => {
      console.error('Error loading exams:', err);
      this.exams = []; // Always fallback to empty array
      this.loadingExams = false;
    }
  });
}
  
  loadExamResults(examId: number): void {
    this.loading = true;
    this.examResultsService.getResultsByExam(examId).subscribe({
      next: (results) => {
        this.examResults = results || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading results:', err);
        this.examResults = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load exam results',
          life: 5000
        });
      }
    });
  
  }

  onExamSelect(): void {
    console.log('Exam selected:', this.selectedExam);
    if (this.selectedExamId) {
      this.loadExamResults(this.examId!);
    }
  }

 

  loadExamStatistics(examId: number): void {
    this.examResultsService.getExamStatistics(examId).subscribe({
      next: (stats: ExamResultStatsDto) => {
        this.examStats = stats;
        
        // Calculate pass percentage if not provided by API
        if (!this.examStats.averageScore && this.examResults.length > 0 && this.selectedExam) {
          const passCount = this.examResults.filter(r => 
            r.score >= (this.selectedExam?.totaldegree ?? 100) * 0.5
          ).length;
          this.examStats.averageScore = (passCount / this.examStats.totalResults) * 100;
        }
      },
      error: (error: any) => {
        this.showError('فشل تحميل إحصائيات الامتحان', error.message);
      }
    });
  }


  getAverageScore(): number {
    if (!this.examResults.length) return 0;
    const sum = this.examResults.reduce((acc, result) => acc + result.score, 0);
    return sum / this.examResults.length;
  }

  getMaxScore(): number {
    if (!this.examResults.length) return 0;
    return Math.max(...this.examResults.map(result => result.score));
  }
  

  //-----------------------------------------------
  resetFilters(): void {
    this.filters = {
      studentName: '',
      studentCode: '',
      grade: ''
    };
  }
  applyFilters(): void {
    this.filteredResults = [...this.examResults].filter(result => {
      // Filter by student name
      if (this.filters.studentName && 
          !result.studentName.toLowerCase().includes(this.filters.studentName.toLowerCase())) {
        return false;
      }
      
      // Filter by student code
      if (this.filters.studentCode && 
          !result.studentName?.toLowerCase().includes(this.filters.studentCode.toLowerCase())) {
        return false;
      }
      
      // Filter by grade
      if (this.filters.grade) {
        const grade = this.getGrade(result.score);
        const gradeMap: { [key: string]: string } = {
          'A': 'ممتاز',
          'B': 'جيد جدا',
          'C': 'جيد',
          'D': 'مقبول',
          'F': 'راسب'
        };
        
        if (grade !== gradeMap[this.filters.grade]) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  applyGlobalFilter(): void {
    if (!this.globalFilterValue) {
      this.filteredResults = [...this.examResults];
      return;
    }
    
    const searchTerm = this.globalFilterValue.toLowerCase();
    
    this.filteredResults = this.examResults.filter(result => 
      result.studentName.toLowerCase().includes(searchTerm) ||
      result.studentName?.toLowerCase().includes(searchTerm) ||
      result.comments?.toLowerCase().includes(searchTerm)
    );
  }

  backToExams(): void {
    this.router.navigate(['/exams']);
  }
  
  moveToAvailable(): void {
    // Implement the logic to move students back to the available list
    console.log('Moving students back to the available list');
  }

  moveToSelected(): void {
    // Implement the logic to move students to the selected list
    console.log('moveToSelected method called');
  }
  //-----------------------------------------
  getPassPercentage(): number {
    if (!this.selectedExam || !this.examResults.length) return 0;
    const passCount = this.examResults.filter(result => 
      (result.score / this.selectedExam!.totaldegree) >= (this.selectedExam!.PassDegree / 100)
    ).length;
    return (passCount / this.examResults.length) * 100;
  }

  getGrade(score: number): string {
    if (!this.selectedExam) return '';
    const percentage = (score / this.selectedExam.totaldegree) * 100;
    
    if (percentage >= 85) return 'ممتاز';
    if (percentage >= 75) return 'جيد جداً';
    if (percentage >= 65) return 'جيد';
    if (percentage >= 50) return 'مقبول';
    return 'راسب';
  }

  getGradeSeverity(score: number): string {
    if (!this.selectedExam) return '';
    const percentage = (score / this.selectedExam.totaldegree) * 100;
    
    if (percentage >= 70) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  }

  saveResult(result: ExamResultDto): void {
    this.loadingResults = true;
    
    this.examResultsService.updateExamResult(result.id, result).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم بنجاح',
          detail: 'تم حفظ النتيجة بنجاح'
        });
        this.loadingResults = false;
      },
      error: (error: any) => {
        this.showError('فشل حفظ النتيجة', error.message);
        this.loadingResults = false;
      }
    });
  }
  
  saveAllResults(): void {
    this.loadingResults = true;
    
    // Using Promise.all to track all update operations
    const updatePromises = this.examResults.map(result => 
      new Promise<void>((resolve, reject) => {
        this.examResultsService.updateExamResult(result.id, result).subscribe({
          next: () => resolve(),
          error: (err: any) => reject(err)
        });
      })
    );
    
    Promise.all(updatePromises)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم بنجاح',
          detail: 'تم حفظ جميع النتائج بنجاح'
        });
        this.loadingResults = false;
      })
      .catch(error => {
        this.showError('فشل حفظ بعض النتائج', error.message);
        this.loadingResults = false;
      });
  }

  confirmDelete(result: ExamResultDto): void {
    this.cons.confirm({
      message: `هل أنت متأكد من رغبتك في حذف نتيجة الطالب ${result.studentName}؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteExamResult(result.id)
    });
  }
  
  deleteExamResult(id: number): void {
    this.loadingResults = true;
    
    this.examResultsService.deleteExamResult(id).subscribe({
      next: () => {
        this.examResults = this.examResults.filter(r => r.id !== id);
        this.filteredResults = this.filteredResults.filter(r => r.id !== id);
        
        this.messageService.add({
          severity: 'success',
          summary: 'تم بنجاح',
          detail: 'تم حذف النتيجة بنجاح'
        });
        
        // Refresh statistics and charts
        if (this.selectedExamId) {
          this.loadExamStatistics(this.selectedExamId);
        }
        this.passFailData();  // TODO
        this.passFailData();
        
        this.loadingResults = false;
      },
      error: (error: any) => {
        this.showError('فشل حذف النتيجة', error.message);
        this.loadingResults = false;
      }
    });
  }

  showAddStudentsDialog(): void {
    // Load available students who don't have results yet
  //  this.loadAvailableStudents();
    this.displayAddStudentsDialog = true;
  }
  
  // loadAvailableStudents(): void {
  //   // Get students who aren't already in the results
  //   const existingStudentIds = this.examResults.map(r => r.studentId);
    
  //   // Call your student service to get all students
  //   this.examResultsService.().subscribe({
  //     next: (students: Student[]) => {
  //       // Filter out students who already have results
  //       this.availableStudents = students.filter(s => !existingStudentIds.includes(s.id));
  //       this.selectedStudents = [];
  //     },
  //     error: (error: any) => {
  //       this.showError('فشل تحميل الطلاب', error.message);
  //     }
  //   });
  // }
  
  addStudentsToResults(): void {
    if (!this.selectedStudents.length || !this.selectedExamId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'الرجاء اختيار طلاب للإضافة'
      });
      return;
    }
    
    this.loadingResults = true;
    
    // Create new result objects for each selected student
    const newResults = this.selectedStudents.map(student => {
      return {
        examId: this.selectedExamId!,
        examName: this.selectedExam?.title || '',
        id: 0, 
        studentId: student.groupID, 
        studentName: student.name,
        studentCode: student.name, 
        score: 0, 
        submittedDate: new Date(),
        comments: ''
      } as ExamResultDto;
    });
    
    // Use Promise.all to track all create operations
    const createPromises = newResults.map(result => 
      new Promise<ExamResultDto>((resolve, reject) => {
        this.examResultsService.createExamResult(result).subscribe({
          next: (createdResult: ExamResultDto) => resolve(createdResult),
          error: (err: any) => reject(err)
        });
      })
    );
    
    Promise.all(createPromises)
      .then((createdResults: ExamResultDto[]) => {
        // Add the new results to the existing ones
        this.examResults = [...this.examResults, ...createdResults];
        this.filteredResults = [...this.examResults];
        
        // Refresh other data
        if (this.selectedExamId) {
          this.loadExamStatistics(this.selectedExamId);
        }
        this.passFailData(); //prepareChartData
        this.passFailData(); //calculateTopStudents
        
        this.messageService.add({
          severity: 'success',
          summary: 'تم بنجاح',
          detail: `تمت إضافة ${createdResults.length} طالب`
        });
        
        this.loadingResults = false;
        this.displayAddStudentsDialog = false;
      })
      .catch(error => {
        this.showError('فشل إضافة بعض الطلاب', error.message);
        this.loadingResults = false;
      });
  }
 
  

  exportExcel(): void {
    // Implement export logic
  }

  printResults(): void {
    // Implement print logic
  }

  
}
