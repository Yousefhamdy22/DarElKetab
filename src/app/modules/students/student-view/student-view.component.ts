import { Component, OnInit } from '@angular/core';
import { Student } from '../student.model';
import { StudentService } from '../student.service';
import { MessageService } from 'primeng/api';
import { AttendanceService } from '../../attendance/attendance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';



interface DropdownOption {
  label: string
  value: string
} 
export interface QuranProgress {
  memorizedPercentage: number;
  memorizedParts: number;
  monthlyRate?: number; // Add monthlyRate as an optional property
}
interface AttendanceDay {
  date: number | null
  dayName: string
  status: "present" | "absent" | "excused" | "none"
  notes?: string // Optional notes property
}
@Component({
  selector: 'app-student-view',
  standalone: false,
  templateUrl: './student-view.component.html',
  styleUrl: './student-view.component.css'
})
export class StudentViewComponent implements OnInit {
  student: Student | null = null;
  loading = true;
  
  // Attendance Data
  selectedMonth: any;
  monthOptions = [
    { name: 'يناير', value: 1 },
    { name: 'فبراير', value: 2 },
    // ... other months
  ];
  
  attendanceStats = {
    percentage: 85,
    present: 17,
    absent: 3
  };
  
  daysOfWeek = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  attendanceCalendar: any[] = [];
  attendanceRecords: any[] = [];
  
  // Academic Data
  selectedTerm: any;
  termOptions = [
    { name: 'الفصل الأول', value: 1 },
    { name: 'الفصل الثاني', value: 2 }
  ];
  
  academicStats = {
    average: 88,
    highest: 95,
    highestSubject: 'القرآن الكريم',
    totalExams: 5
  };
  
  performanceChartData: any;
  chartOptions: any;
  
  exams = [
    { subject: 'القرآن الكريم', type: 'حفظ', date: new Date(), grade: 95 },
    { subject: 'التجويد', type: 'نظري', date: new Date(), grade: 88 },
    // ... more exams
  ];
  
  notes = [
    { title: 'ملاحظة حول الحفظ', content: 'الطالب يحتاج إلى تحسين في التلاوة', date: new Date(), teacherName: 'أ. أحمد', teacherAvatar: '' },
    // ... more notes
  ];

  constructor(
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  
 

  

ngOnInit(): void {
  this.route.params.subscribe(params => {
    const id = params['id'];
    
    // Check if id exists and is a valid number
    if (id && !isNaN(+id)) {
      this.loadStudentData(+id); // Convert to number with the + operator
    } else {
      this.handleInvalidId(); // Handle invalid or missing ID
    }
  });
}
loadStudentData(studentID: number): void {
  this.loading = true;
  this.studentService.getStudentById(studentID).subscribe({
    next: (data) => {
      if (data) {
        this.student = data;
      } else {
        this.handleInvalidId();
      }
      this.loading = false;
    },
    error: (err) => {
      console.error('Error:', err);
      this.loading = false;
      this.handleInvalidId();
    }
  });
}

calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
private handleInvalidId(): void {
  this.messageService.add({
    severity: 'error',
    summary: 'خطأ',
    detail: 'معرف الطالب غير صالح'
  });
  this.router.navigate(['/students']); // Redirect to student list
}




  initAttendanceCalendar(): void {
    // Generate calendar days for current month
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Find first day of month
    const firstDay = new Date(year, month, 1).getDay();
    
    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      this.attendanceCalendar.push({});
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      
      // Simulate random attendance status
      const status = ['present', 'absent', 'excused'][Math.floor(Math.random() * 3)];
      
      this.attendanceCalendar.push({
        date,
        dayOfWeek,
        status,
        time: status === 'present' ? '08:30' : null,
        notes: status === 'absent' ? 'غياب بعذر' : null
      });
    }
    
    // Generate attendance records for table
    this.attendanceRecords = this.attendanceCalendar
      .filter(day => day.date)
      .map(day => ({
        date: day.date,
        status: day.status,
        time: day.time,
        notes: day.notes
      }));
  }

  initCharts(): void {
    this.performanceChartData = {
      labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'],
      datasets: [
        {
          label: 'الدرجات',
          data: [85, 82, 88, 90, 92],
          fill: false,
          borderColor: '#4f46e5',
          tension: 0.4
        }
      ]
    };
    
    this.chartOptions = {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100
        }
      }
    };
  }

  

  getStatusText(status: string): string {
    switch(status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غائب';
      case 'excused': return 'بعذر';
      default: return '--';
    }
  }

  getStatusSeverity(status: string): string {
    switch(status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'excused': return 'warning';
      default: return 'info';
    }
  }

  getGradeText(grade: number): string {
    if (grade >= 90) return 'ممتاز';
    if (grade >= 80) return 'جيد جداً';
    if (grade >= 70) return 'جيد';
    if (grade >= 60) return 'مقبول';
    return 'ضعيف';
  }

  getGradeSeverity(grade: number): string {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'info';
    if (grade >= 70) return 'warning';
    return 'danger';
  }
  
}
