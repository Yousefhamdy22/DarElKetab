import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

interface Student {
  id: number;
  name: string;
  age: number;
  joinDate: Date;
  group: string;
  teacher: string;
  parentName: string;
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

interface AttendanceRecord {
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface MonthlyScores {
  memorization: number;
  recitation: number;
  behavior: number;
  tajweed: number;
  total: number;
}

interface MonthlyReport {
  name: string;
  scores: MonthlyScores;
  notes: string;
  recommendations: string[];
}


@Component({
  selector: 'app-student-report',
  standalone: false,
  templateUrl: './student-report.component.html',
  styleUrl: './student-report.component.css'
})
export class StudentReportComponent implements OnInit {
  currentYear = new Date().getFullYear();
  
  student: Student = {
    id: 1,
    name: 'أحمد محمد علي',
    age: 12,
    joinDate: new Date('2024-09-01'),
    group: 'الفرقان - المستوى الثالث',
    teacher: 'أ. عبدالرحمن السيد',
    parentName: 'محمد علي حسن'
  };
  
  attendanceSummary: AttendanceSummary = {
    present: 6,
    absent: 1,
    late: 1,
    excused: 0,
    percentage: 87.5
  };
  
  monthlyAttendance: AttendanceRecord[] = [
    { date: new Date(2025, 3, 3), status: 'present' },
    { date: new Date(2025, 3, 6), status: 'present' },
    { date: new Date(2025, 3, 10), status: 'present' },
    { date: new Date(2025, 3, 13), status: 'absent' },
    { date: new Date(2025, 3, 17), status: 'present' },
    { date: new Date(2025, 3, 20), status: 'present' },
    { date: new Date(2025, 3, 24), status: 'late' },
    { date: new Date(2025, 3, 27), status: 'present' }
  ];
  
  months: MonthlyReport[] = [
    {
      name: 'يناير',
      scores: {
        memorization: 85,
        recitation: 78,
        behavior: 90,
        tajweed: 75,
        total: 82
      },
      notes: 'الطالب بدأ الفصل بمستوى جيد، ويحتاج إلى تحسين مهارات التجويد.',
      recommendations: [
        'تخصيص 20 دقيقة يومياً للمراجعة',
        'التركيز على أحكام النون الساكنة والتنوين',
        'المشاركة بشكل أكبر في الأنشطة الجماعية'
      ]
    },
    {
      name: 'فبراير',
      scores: {
        memorization: 88,
        recitation: 82,
        behavior: 92,
        tajweed: 80,
        total: 86
      },
      notes: 'تحسن ملحوظ في أداء الطالب خلال هذا الشهر، خاصة في التلاوة.',
      recommendations: [
        'الاستمرار في التدريب على مخارج الحروف',
        'مراجعة السور المحفوظة سابقاً',
        'الاهتمام بتطبيق أحكام المد'
      ]
    },
    {
      name: 'مارس',
      scores: {
        memorization: 92,
        recitation: 85,
        behavior: 95,
        tajweed: 82,
        total: 90
      },
      notes: 'الطالب أحمد يُظهر تطوراً ملحوظاً في الحفظ خلال الشهر الماضي. مستواه في التلاوة جيد لكن يحتاج للتركيز أكثر على مخارج الحروف وأحكام المد.',
      recommendations: [
        'زيادة وقت المراجعة اليومي ليصل إلى 30 دقيقة على الأقل',
        'التركيز على تحسين مخارج الحروف، خاصة الحروف الحلقية',
        'مراجعة السور من الجزء الثلاثين بشكل منتظم',
        'التدرب على تطبيق أحكام المد بشكل سليم'
      ]
    },
    {
      name: 'أبريل',
      scores: {
        memorization: 0,
        recitation: 0,
        behavior: 0,
        tajweed: 0,
        total: 0
      },
      notes: 'لم يتم إجراء الاختبار بعد لهذا الشهر.',
      recommendations: []
    }
  ];
  
  chartOptions = {
    plugins: {
      legend: {
        labels: {
          font: {
            family: 'Tajawal'
          }
        }
      }
    },
    scales: {
      y: {
        min: 50,
        max: 100,
        ticks: {
          font: {
            family: 'Tajawal'
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Tajawal'
          }
        }
      }
    }
  };
  
  constructor(private datePipe: DatePipe) {}
  
  ngOnInit(): void {}
  
  getAttendanceClass(status: string): string {
    switch(status) {
      case 'present':
        return 'bg-green-50 border border-green-100';
      case 'absent':
        return 'bg-red-50 border border-red-100';
      case 'late':
        return 'bg-amber-50 border border-amber-100';
      case 'excused':
        return 'bg-blue-50 border border-blue-100';
      default:
        return '';
    }
  }
  
  getDayName(date: Date): string {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  }
  
  getChartData(month: MonthlyReport) {
    // Get previous months data for trend
    const monthIndex = this.months.findIndex(m => m.name === month.name);
    const previousMonths = this.months.slice(0, monthIndex + 1);
    
    return {
      labels: previousMonths.map(m => m.name),
      datasets: [
        {
          label: 'الحفظ',
          data: previousMonths.map(m => m.scores.memorization),
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'التلاوة',
          data: previousMonths.map(m => m.scores.recitation),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'السلوك',
          data: previousMonths.map(m => m.scores.behavior),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }
  
  printReport(): void {
    window.print();
  }
}
