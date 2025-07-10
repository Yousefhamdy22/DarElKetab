import { Component, OnInit, } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';

import { QuranService, Surah } from '../quran.service';
import { ReadSessionService } from '../ReadSession.service';
import { ReadingSession } from '../group.models';
import { GroupService } from '../group.service';
import { Student } from '../../students/student.model';


interface StudentAttendance {
  studentId: number;
  status: string;
  notes: string;
  last5Records: string[];
}

@Component({
  selector: 'app-group-reading',
  standalone: false,
  templateUrl: './group-reading.component.html',
  styleUrl: './group-reading.component.css'
})
export class GroupReadingComponent {
  errorMessage: string = '';



  readSession: ReadingSession[] = [];
  loading: boolean = false;
  // selectedSession: ReadingSession | null = null;
  selectedSessionId: string | null = null;





  chartType: string = 'bar';
  readingAttendanceData: any;
  attendanceChartOptions: any;

  // Dropdown Options
  timeRangeOptions: SelectItem[] = [
    { label: 'آخر أسبوع', value: 'week' },
    { label: 'آخر شهر', value: 'month' },
    { label: 'آخر 3 أشهر', value: 'quarter' },
    { label: 'آخر سنة', value: 'year' }
  ];
  selectedTimeRange: SelectItem = this.timeRangeOptions[1];

  attendanceStatFilters: SelectItem[] = [
    { label: 'الأعلى حضوراً', value: 'top' },
    { label: 'الأقل حضوراً', value: 'bottom' }
  ];
  selectedStatFilter: SelectItem = this.attendanceStatFilters[0];

  // Session Form
  sessionDate: Date = new Date();
  sessionTypes: SelectItem[] = [
    { label: 'حفظ', value: 'memorization' },
    { label: 'مراجعة', value: 'review' },
    { label: 'تسميع', value: 'recitation' }
  ];
  selectedSessionType: SelectItem = this.sessionTypes[0];

  quranSurahs: Surah[] = [];
  selectedSurah: Surah | null = null;
  startAyahOptions: number[] = [];
  selectedStartAyah: number | null = null;
  endAyahOptions: number[] = [];
  selectedEndAyah: number | null = null;
  ayahRangeError: boolean = false;

  qualityOptions: SelectItem[] = [
    { label: 'ممتاز', value: 'excellent' },
    { label: 'جيد جداً', value: 'very good' },
    { label: 'جيد', value: 'good' },
    { label: 'مقبول', value: 'fair' },
    { label: 'ضعيف', value: 'poor' }
  ];
  selectedQuality: SelectItem = this.qualityOptions[0];

  statusOptions: SelectItem[] = [
    { label: 'مكتملة', value: 'completed' },
    { label: 'غير مكتملة', value: 'incomplete' },
    { label: 'ملغاة', value: 'cancelled' }
  ];
  selectedStatus: SelectItem = this.statusOptions[0];
  getStatusLabel(value: string): string {
    const option = this.statusOptions.find(opt => opt.value === value);
    return option?.label ?? value;
  }
  // Students Data
  students: any[] = [];
  selectedStudents: any[] = [];

  generalNotes: string = '';

  // Session History
  readingSessions: any[] = [];
  loadingSessions: boolean = false;
  historyFilterOptions: SelectItem[] = [
    { label: 'الكل', value: 'all' },
    { label: 'حفظ', value: 'memorization' },
    { label: 'مراجعة', value: 'review' },
    { label: 'تسميع', value: 'recitation' }
  ];
  selectedHistoryFilter: SelectItem = this.historyFilterOptions[0];
  historyDateRange: Date[] = [];

  // Session Details Dialog
  displaySessionDetails: boolean = false;
  selectedSession: any;

  // Absence Summary
  absenceStats: any[] = [];

  // Stats
  groupAttendanceRate: number = 85;
  averageMemorization: number = 78;
  averageTajweed: number = 82;
  topStudents: any[] = [];
  totalSessions: number = 30;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private quranService: QuranService,
    private readSessionService: ReadSessionService,
    private groupService: GroupService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && !isNaN(+id)) { }
      this.loadGroupStudents(+id);
    }
    );



    this.initChart();
    this.loadSurahs();
    this.loadReadingSessions();
    this.loadAbsenceStats();
    this.updateAttendanceStats();
  }

  loadAllSession(): void {
    this.loading = true;

    this.readSessionService.getAllReadSessions().subscribe({
      next: (sessions) => {
        this.readSession = sessions;
        this.loading = false;
        console.log('Sessions loaded:', sessions);
      },
      error: () => {
        this.readSession = [];
        this.loading = false;
        this.showError('فشل تحميل الجلسات');
      }
    });
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail
    });
  }




  // Form validation

  isFormValid(): boolean {
  return !!(
    this.selectedSessionType &&
    this.selectedSurah &&
    this.selectedStartAyah &&
    this.selectedEndAyah &&
    !this.ayahRangeError &&
    this.selectedStudents.length > 0 &&
    this.selectedStatus && // Ensure status is selected
    this.selectedQuality // Ensure quality is selected
  );
}

  // Reset form

addSession() {
  if (!this.isFormValid()) {
    return;
  }

  // Ensure session status is defined and has a value
  if (!this.selectedStatus) {
    console.error('Session status is required');
    // Optionally, you could show a user-friendly error message
    return;
  }

  // Prepare session data
  const sessionData: ReadingSession = {
    readingSessionId: 0, // Replace with actual ID if available
    date: this.sessionDate || new Date().toISOString(), // Ensure date is always set
    groupName: 'Default Group', // Replace with actual group name if available
    sessionType: this.selectedSessionType?.value || '', // Use code instead of value
    surahName: this.selectedSurah?.name || '',
    startAyah: this.selectedStartAyah || 1,
    endAyah: this.selectedEndAyah || 20,
    sessionResult: this.selectedQuality 
      ? this.qualityOptions.find(q => q.value === this.selectedQuality)?.label || '' 
      : '',
    // Ensure you're using the correct property for status
    sessionStatus: typeof this.selectedStatus === 'object' 
      ? this.selectedStatus.value 
      : this.selectedStatus,
    notes: this.generalNotes,
    groupId: this.students[0]?.groupID || 0
  };

  console.log('Sending session data:', JSON.stringify(sessionData, null, 2));

  this.readSessionService.addSession(sessionData).subscribe({
    next: (sessionResponse) => {
      const attendanceRecords = this.selectedStudents.map(student => ({
        studentId: student.studentID,
        status: 'Present', // Ensure this matches backend enum
        notes: student.notes || '',
      }));

      this.readSessionService.addSessionAttendance(
        sessionResponse.readingSessionId, 
        attendanceRecords
      ).subscribe({
        next: (attendanceResponse) => {
          console.log('Session and attendance saved successfully', {
            session: sessionResponse,
            attendance: attendanceResponse
          });
          // Reset form or show success message
          this.resetForm();
        },
        error: (attendanceError) => {
          console.error('Error saving attendance', attendanceError);
          // Handle attendance save error
        }
      });
    },
    error: (sessionError) => {
      console.error('Error saving reading session', sessionError);
      // Handle session save error
    }
  });
}
// Where you set the status (probably in template event handler)
onStatusChange(selected: any) {
  console.log('Status selected:', selected);
  this.selectedStatus = selected;
}
  noStudentsFound: boolean = false;


  loadGroupStudents(groupId: number): void {
    this.loading = true;
    this.noStudentsFound = false;

    this.groupService.getGroupWithStudents(groupId).subscribe({
      next: (response) => {
        // Clear previous data
        this.students = [];
        // this.filteredStudents = [];

        // Check if response contains students
        if (response.data?.students?.length) {
          this.students = this.transformStudents(response.data.students);
          // this.filteredStudents = [...this.students];
        } else {
          this.noStudentsFound = true;
        }

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.students = [];
        // this.filteredStudents = [];
        this.noStudentsFound = true;
        this.showMessage('error', 'خطأ', this.getErrorMessage(error));
      }
    });
  }
  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 5000 });
  }
  private getErrorMessage(error: any): string {
    return error.status === 404
      ? 'المجموعة غير موجودة'
      : error.status === 403
        ? 'غير مصرح لك بمشاهدة هذه المجموعة'
        : 'فشل في تحميل بيانات الطلاب';
  }

  private transformStudents(students: Student[]): Student[] {
    return students.map(student => ({
      ...student,
      id: student.studentID || student.studentID,
      registrationDate: student.registrationDate ? new Date(student.registrationDate) : new Date()
    }));
  }




  // Initialize chart
  initChart(): void {
    this.attendanceChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          rtl: true,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              family: 'Tajawal, sans-serif'
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Tajawal, sans-serif'
            }
          }
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            font: {
              family: 'Tajawal, sans-serif'
            }
          }
        }
      }
    };

    this.readingAttendanceData = {
      labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      datasets: [
        {
          label: 'الحضور الفعلي',
          backgroundColor: '#0d9488',
          borderColor: '#0d9488',
          data: [65, 59, 80, 81, 56, 55, 90]
        },
        {
          label: 'المستهدف',
          backgroundColor: '#cbd5e1',
          borderColor: '#cbd5e1',
          borderDash: [5, 5],
          data: [80, 80, 80, 80, 80, 80, 80]
        }
      ]
    };
  }

  // Change chart type
  changeChartType(type: string): void {
    this.chartType = type;
  }
  getQualityStars(quality: string): number {
    switch (quality) {
      case 'ممتاز': return 5;
      case 'جيد جداً': return 4;
      case 'جيد': return 3;
      case 'مقبول': return 2;
      case 'ضعيف': return 1;
      default: return 0;
    }
  }
  getAttendancePercentage(attendance: any[]): number {
    return Math.round((this.getAttendedCount(attendance) / attendance.length) * 100);
  }

  getAbsentCount(attendance: any[]): number {
    return attendance.filter(a => !a.attended).length;
  }
  getAttendedCount(attendance: any[]): number {
    return attendance.filter(a => a.attended).length;
  }
  // Update attendance statistics
  updateAttendanceStats(): void {
    // In a real app, this would fetch data based on selected filters
    if (this.selectedStatFilter.value === 'top') {
      this.topStudents = [
        { name: 'محمد أحمد', attendanceDays: 28 },
        { name: 'علي محمود', attendanceDays: 27 },
        { name: 'أحمد خالد', attendanceDays: 26 }
      ];
    } else {
      this.topStudents = [
        { name: 'سامي يوسف', attendanceDays: 15 },
        { name: 'خالد عمر', attendanceDays: 17 },
        { name: 'يوسف محمد', attendanceDays: 18 }
      ];
    }
  }
  filterAttendance() {
    // if (this.selectedAttendanceFilter.value === 'all') {
    //   this.dt?.filter(null, 'attended', 'equals'); // Use optional chaining to avoid runtime errors
    // } else {
    //   this.dt?.filter(
    //     this.selectedAttendanceFilter.value === 'attended', 
    //     'attended', 
    //     'equals'
    //   );
    // }
  }
  attendanceFilters = [
    { name: 'الكل', value: 'all' },
    { name: 'الحضور فقط', value: 'attended' },
    { name: 'الغياب فقط', value: 'absent' }
  ];

  selectedAttendanceFilter = this.attendanceFilters[0];

  viewStudentNotes(attendance: any) {
    this.messageService.add({
      severity: 'info',
      summary: 'ملاحظات الطالب',
      detail: attendance.notes || 'لا توجد ملاحظات',
      life: 5000
    });
  }
  printSessionReport() {
    // Implement print functionality
    window.print();
  }


  editSessionNotes() {
    // Implement your notes editing logic here
  }
  // Export report
  exportReport(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'تم التصدير',
      detail: 'تم تصدير تقرير تقدم القراءة بنجاح',
      life: 3000
    });
  }

  // Load Surahs
  loadSurahs(): void {
    this.quranService.getSurahs().subscribe({
      next: (surahs) => {
        this.quranSurahs = surahs;
      },
      error: (err) => {
        console.error('Failed to load surahs:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تحميل بيانات السور',
          life: 3000
        });
      }
    });
  }

  // When Surah changes
  onSurahChange(): void {
    if (this.selectedSurah) {
      this.startAyahOptions = Array.from({ length: this.selectedSurah.ayahCount }, (_, i) => i + 1);
      this.endAyahOptions = [...this.startAyahOptions];
      this.selectedStartAyah = 1;
      this.selectedEndAyah = this.selectedSurah.ayahCount;
    } else {
      this.startAyahOptions = [];
      this.endAyahOptions = [];
      this.selectedStartAyah = null;
      this.selectedEndAyah = null;
    }
    this.ayahRangeError = false;
  }

  // Validate ayah range
  validateAyahRange(): void {
    if (this.selectedStartAyah && this.selectedEndAyah) {
      this.ayahRangeError = this.selectedEndAyah < this.selectedStartAyah;
    } else {
      this.ayahRangeError = false;
    }
  }

  selectAllStudents(select: boolean): void {
    if (select) {
      this.selectedStudents = [...this.students];
    } else {
      this.selectedStudents = [];
    }
  }

  resetForm(): void {
    this.selectedSurah = null;
    this.selectedStartAyah = null;
    this.selectedEndAyah = null;
    this.ayahRangeError = false;
    this.selectedStudents = [];
    this.generalNotes = '';
    this.sessionDate = new Date();
    this.selectedSessionType = this.sessionTypes[0];
    this.selectedQuality = this.qualityOptions[0];
    this.selectedStatus = this.statusOptions[0];
  }

  // // Add new session
  // addSession(): void {
  //   if (!this.isFormValid()) return;

  //   const newSession = {
  //     date: this.sessionDate,
  //     sessionType: this.selectedSessionType.title,
  //     surahName: this.selectedSurah?.name,
  //     startAyah: this.selectedStartAyah,
  //     endAyah: this.selectedEndAyah,
  //     sessionStatus: this.selectedStatus.title,
  //     quality: this.selectedQuality.title,
  //     attendedStudents: this.selectedStudents.length,
  //     totalStudents: this.students.length,
  //     attendance: this.students.map(student => ({
  //       studentId: student.id,
  //       studentName: student.name,
  //       attended: this.selectedStudents.some(s => s.id === student.id),
  //       rating: student.rating,
  //       notes: student.notes
  //     })),
  //     notes: this.generalNotes
  //   };

  //   this.readingSessions.unshift(newSession);
  //   this.messageService.add({
  //     severity: 'success',
  //     summary: 'تم الحفظ',
  //     detail: 'تم تسجيل جلسة القراءة بنجاح',
  //     life: 3000
  //   });
  //   this.resetForm();
  //   this.updateAttendanceStats();
  //   this.loadAbsenceStats();
  // }

  // Load reading sessions
  loadReadingSessions(): void {
    this.loadingSessions = true;
    // Simulate API call
    setTimeout(() => {
      this.readingSessions = [
        {
          date: new Date('2023-05-10'),
          sessionType: 'حفظ',
          surahName: 'البقرة',
          startAyah: 1,
          endAyah: 5,
          sessionStatus: 'مكتملة',
          quality: 'ممتاز',
          attendedStudents: 4,
          totalStudents: 5,
          attendance: [
            { studentId: 1, studentName: 'محمد أحمد', attended: true, rating: 4, notes: '' },
            { studentId: 2, studentName: 'علي محمود', attended: true, rating: 3, notes: '' },
            { studentId: 3, studentName: 'أحمد خالد', attended: true, rating: 5, notes: '' },
            { studentId: 4, studentName: 'سامي يوسف', attended: false, rating: 0, notes: '' },
            { studentId: 5, studentName: 'خالد عمر', attended: true, rating: 4, notes: '' }
          ],
          notes: 'أداء جيد من معظم الطلاب'
        },
        // Add more sample sessions as needed
      ];
      this.loadingSessions = false;
    }, 1000);
  }

  // Filter reading history
  filterReadingHistory(): void {
    // In a real app, this would filter the sessions based on selected filters
    this.loadingSessions = true;
    setTimeout(() => {
      this.loadingSessions = false;
    }, 500);
  }

  // When date range changes
  onDateRangeChange(event: any): void {
    this.filterReadingHistory();
  }

  // View session details
  viewSessionDetails(session: any): void {
    this.selectedSession = session;
    this.displaySessionDetails = true;
  }

  // Edit session
  editSession(session: any): void {
    // In a real app, this would populate the form with session data for editing
    this.messageService.add({
      severity: 'info',
      summary: 'تعديل الجلسة',
      detail: 'سيتم فتح الجلسة للتعديل',
      life: 3000
    });
  }

  // Confirm delete session
  confirmDeleteSession(session: any): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.deleteSession(session);
      }
    });
  }

  // Delete session
  deleteSession(session: any): void {
    this.readingSessions = this.readingSessions.filter(s => s !== session);
    this.messageService.add({
      severity: 'success',
      summary: 'تم الحذف',
      detail: 'تم حذف الجلسة بنجاح',
      life: 3000
    });
    this.updateAttendanceStats();
    this.loadAbsenceStats();
  }

  // Load absence stats
  loadAbsenceStats(): void {
    // In a real app, this would calculate from attendance data
    this.absenceStats = [
      { name: 'سامي يوسف', absenceCount: 5, absenceRate: 25, lastAbsenceDate: new Date('2023-05-10') },
      { name: 'خالد عمر', absenceCount: 3, absenceRate: 15, lastAbsenceDate: new Date('2023-05-03') },
      { name: 'يوسف محمد', absenceCount: 2, absenceRate: 10, lastAbsenceDate: new Date('2023-04-26') }
    ];
  }

  // Send absence alerts
  sendAbsenceAlerts(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'تم الإرسال',
      detail: 'تم إرسال تنبيهات الغياب للطلاب المعنيين',
      life: 3000
    });
  }

  // View absence history
  viewAbsenceHistory(student: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'سجل الغياب',
      detail: `عرض سجل غياب الطالب ${student.name}`,
      life: 3000
    });
  }

  // Add absence note
  addAbsenceNote(student: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'إضافة ملاحظة',
      detail: `إضافة ملاحظة لغياب الطالب ${student.name}`,
      life: 3000
    });
  }

  // Contact guardian
  contactGuardian(student: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'اتصال بالولي',
      detail: `الاتصال بولي أمر الطالب ${student.name}`,
      life: 3000
    });
  }
}
