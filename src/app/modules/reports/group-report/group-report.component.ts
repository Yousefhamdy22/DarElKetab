import { Component, OnInit } from '@angular/core';

import { DatePipe } from '@angular/common';
interface Group {
  id: number;
  name: string;
  teacher: string;
  studentsCount: number;
  attendanceRate: number;
  averageMemorization: number;
  averageRecitation: number;
  startDate: Date;
  level: string;
}

interface AttendanceTrend {
  month: string;
  present: number;
  absent: number;
}
@Component({
  selector: 'app-group-report',
  standalone: false,
  templateUrl: './group-report.component.html',
  styleUrl: './group-report.component.css',
  providers: [DatePipe]
})
export class GroupReportComponent implements OnInit{
  currentYear: string = new Date().getFullYear().toString();
  today: Date = new Date();
  
  // Group information
  group: any = {
    name: 'الفرقان',
    teacher: 'أحمد محمد',
    supervisor: 'محمد عبدالله',
    studentsCount: 25,
    averageAge: 12,
    startDate: new Date('2023-09-01'),
    level: 'متوسط',
    classroom: 'قاعة 12',
    studyDays: 'السبت - الإثنين - الأربعاء',
    stats: {
      attendancePercentage: 92,
      memorizationAvg: 84,
      recitationAvg: 78,
      behaviorAvg: 90
    },
    teacherNotes: 'المجموعة تظهر تقدماً ملحوظاً في مجال الحفظ والتلاوة مقارنة بالشهر السابق. هناك حاجة إلى التركيز على تحسين مهارات التجويد لدى بعض الطلاب. الانضباط بشكل عام جيد مع وجود بعض حالات التأخر المتكررة.',
    recommendations: {
      teaching: 'التركيز على مراجعة أحكام التجويد مع تطبيقات عملية أكثر. استخدام وسائل تعليمية متنوعة.',
      dynamics: 'تقسيم الطلاب إلى مجموعات صغيرة للمراجعة المتبادلة. تشجيع روح المنافسة الإيجابية.',
      improvement: 'عقد اختبارات قصيرة أسبوعية. تنظيم مسابقات شهرية للتحفيز.'
    },
    students: [
      { rank: 1, name: 'عبدالله أحمد', attendance: 98, memorization: 95, recitation: 92, behavior: 94, total: 95 },
      { rank: 2, name: 'محمد علي', attendance: 96, memorization: 92, recitation: 88, behavior: 90, total: 91 },
      { rank: 3, name: 'يوسف خالد', attendance: 94, memorization: 88, recitation: 90, behavior: 92, total: 90 },
      { rank: 4, name: 'أحمد عبدالرحمن', attendance: 90, memorization: 85, recitation: 84, behavior: 88, total: 86 },
      { rank: 5, name: 'صالح محمد', attendance: 92, memorization: 82, recitation: 80, behavior: 90, total: 85 },
      { rank: 6, name: 'فيصل عبدالعزيز', attendance: 88, memorization: 84, recitation: 78, behavior: 86, total: 83 },
      { rank: 7, name: 'عمر إبراهيم', attendance: 86, memorization: 80, recitation: 78, behavior: 84, total: 81 },
      { rank: 8, name: 'خالد سعود', attendance: 82, memorization: 78, recitation: 76, behavior: 82, total: 79 },
      { rank: 9, name: 'عبدالرحمن فهد', attendance: 80, memorization: 75, recitation: 72, behavior: 86, total: 77 },
      { rank: 10, name: 'سلطان عبدالله', attendance: 78, memorization: 70, recitation: 72, behavior: 80, total: 74 }
    ]
  };

  // Monthly data
  months = [
    {
      name: 'محرم',
      attendance: {
        present: 92,
        absent: 3,
        late: 4,
        excused: 1
      },
      skills: {
        memorization: 84,
        recitation: 78,
        tajweed: 72,
        behavior: 90,
        participation: 85
      },
      areasForImprovement: [
        'تحسين مهارات التجويد خاصة أحكام المدود',
        'تقليل نسبة التأخر عن الحصص',
        'تعزيز المشاركة الصفية لبعض الطلاب'
      ],
      achievements: [
        'تحسن ملحوظ في حفظ السور الطويلة',
        'ارتفاع معدل الالتزام بالواجبات المنزلية',
        'تطور في مهارات الإلقاء والتلاوة الجماعية'
      ]
    },
    {
      name: 'صفر',
      attendance: {
        present: 90,
        absent: 5,
        late: 3,
        excused: 2
      },
      skills: {
        memorization: 82,
        recitation: 76,
        tajweed: 70,
        behavior: 88,
        participation: 83
      },
      areasForImprovement: [
        'التركيز على إتقان أحكام النون الساكنة والتنوين',
        'تحسين الانتظام في الحضور',
        'العمل على تقوية مراجعة المحفوظات السابقة'
      ],
      achievements: [
        'إتمام حفظ جزء عم بشكل كامل',
        'تحسن مستوى الأداء في الاختبارات الشفوية',
        'مشاركة فعالة في مسابقة التلاوة المدرسية'
      ]
    },
    {
      name: 'ربيع الأول',
      attendance: {
        present: 94,
        absent: 2,
        late: 3,
        excused: 1
      },
      skills: {
        memorization: 86,
        recitation: 80,
        tajweed: 74,
        behavior: 92,
        participation: 88
      },
      areasForImprovement: [
        'تعزيز مهارات ضبط مخارج الحروف',
        'الاهتمام بتطبيق أحكام الوقف والابتداء',
        'تشجيع المزيد من التعاون بين طلاب المجموعة'
      ],
      achievements: [
        'تفوق خمسة طلاب في المسابقة المركزية للحفظ',
        'ارتفاع ملحوظ في مستوى الأداء الجماعي',
        'تحسن في الانضباط السلوكي والحضور المنتظم'
      ]
    }
  ];

  // Chart data and options
  groupPerformanceData: any;
  chartPerformanceOptions: any;
  skillDistributionData: any;
  pieChartOptions: any;
  barChartOptions: any;
  radarChartOptions: any;
  groupComparisonData: any;
  groupComparisonOptions: any;
  groupRadarData: any;
  groupRadarOptions: any;

  constructor(private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.initializeCharts();
  }

  initializeCharts(): void {
    // Performance Chart Data
    this.groupPerformanceData = {
      labels: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة'],
      datasets: [
        {
          label: 'الحفظ',
          data: [84, 82, 86, 88, 90, 92],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'التلاوة',
          data: [78, 76, 80, 82, 84, 86],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'السلوك',
          data: [90, 88, 92, 90, 94, 96],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    this.chartPerformanceOptions = {
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    };

    // Skill Distribution Pie Chart
    this.skillDistributionData = {
      labels: ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف'],
      datasets: [
        {
          data: [40, 30, 15, 10, 5],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
          hoverBackgroundColor: ['#059669', '#2563eb', '#d97706', '#ea580c', '#dc2626']
        }
      ]
    };

    this.pieChartOptions = {
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    };

    // Bar Chart Options
    this.barChartOptions = {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      maintainAspectRatio: false,
      responsive: true
    };

    // Radar Chart Options
    this.radarChartOptions = {
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    };

    // Group Comparison Data
    this.groupComparisonData = {
      labels: ['مجموعة الفرقان', 'مجموعة النور', 'مجموعة الهدى', 'مجموعة الإيمان', 'مجموعة الفلاح'],
      datasets: [
        {
          label: 'معدل النجاح',
          data: [92, 88, 85, 90, 82],
          backgroundColor: 'rgba(16, 185, 129, 0.7)'
        },
        {
          label: 'نسبة التفوق',
          data: [40, 35, 30, 38, 28],
          backgroundColor: 'rgba(59, 130, 246, 0.7)'
        }
      ]
    };

    this.groupComparisonOptions = {
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      maintainAspectRatio: false,
      responsive: true,
      indexAxis: 'y'
    };

    // Group Radar Data
    this.groupRadarData = {
      labels: ['الحفظ', 'التلاوة', 'التجويد', 'السلوك', 'المشاركة'],
      datasets: [
        {
          label: 'مجموعة الفرقان',
          data: [84, 78, 72, 90, 85],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#3b82f6'
        },
        {
          label: 'متوسط جميع المجموعات',
          data: [80, 75, 68, 85, 80],
          backgroundColor: 'rgba(249, 115, 22, 0.2)',
          borderColor: '#f97316',
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#f97316'
        }
      ]
    };

    this.groupRadarOptions = {
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    };
  }

  // Helper methods for charts
  getAttendanceChartData(month: any) {
    return {
      labels: ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع'],
      datasets: [
        {
          label: 'نسبة الحضور',
          data: [month.attendance.present - 3, month.attendance.present - 1, month.attendance.present + 2, month.attendance.present],
          backgroundColor: 'rgba(16, 185, 129, 0.7)'
        }
      ]
    };
  }

  getSkillsChartData(month: any) {
    return {
      labels: ['الحفظ', 'التلاوة', 'التجويد', 'السلوك', 'المشاركة'],
      datasets: [
        {
          label: 'مستوى المهارات',
          data: [
            month.skills.memorization,
            month.skills.recitation,
            month.skills.tajweed,
            month.skills.behavior,
            month.skills.participation
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff'
        }
      ]
    };
  }

  getDayName(date: Date): string {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  }

  // Reports actions
  printReport(): void {
    window.print();
  }

  exportPDF(): void {
    alert('تم تصدير التقرير بتنسيق PDF');
    // Implement PDF export functionality here
  }
}
