import { Component ,OnDestroy , OnInit} from '@angular/core';
import { SidebarService } from '../dashboard/sidebar/sidebar.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/services/AuthService.service';
interface SummaryData {
  totalStudents: number;
  memorizedVerses: number;
  attendanceRate: number;
  topGroup: string | null;
}
interface Event {
  title: string;
  date: Date;
  group: string;
  type: 'exam' | 'event' | 'holiday';
}
interface Student {
  name: string;
  group: string;
  groupLevel: string;
  registrationDate: Date;
  active: boolean;
}
interface Group {
  id: number;
  name: string;
  studentCount: number;
  supervisor: string;
}
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent  implements OnInit, OnDestroy {

   isCollapsed = false;
  isMobile = false;
  sidebarOpen = false;
  isDropdownOpen = false;


  groups: Group[] = [
    { id: 1, name: 'مجموعة 1', studentCount: 20, supervisor: 'أحمد' },
    { id: 2, name: 'مجموعة 2', studentCount: 15, supervisor: 'محمد' },
    { id: 3, name: 'مجموعة 3', studentCount: 10, supervisor: 'سارة' }
  ];
  today: Date = new Date();
  recentStudents: Student[] = [
    {
      name: 'أحمد علي',
      group: 'المجموعة أ',
      groupLevel: 'متقدم',
      registrationDate: new Date('2023-10-01'),
      active: true,
    },
    {
      name: 'سارة محمد',
      group: 'المجموعة ب',
      groupLevel: 'متوسط',
      registrationDate: new Date('2023-09-25'),
      active: true,
    },
    {
      name: 'خالد حسن',
      group: 'المجموعة ج',
      groupLevel: 'مبتدئ',
      registrationDate: new Date('2023-09-20'),
      active: false,
    },
  ];
  students = [
    { 
      name: 'أحمد علي', 
      group: 'المجموعة ١', 
      progress: 75,
      currentSurah: 'البقرة (1-20)',
      recitationLevel: 'متوسط',
      rating: 4
    },
    { 
      name: 'فاطمة حسن', 
      group: 'المجموعة ٢', 
      progress: 90,
      currentSurah: 'النساء (1-15)',
      recitationLevel: 'ممتاز',
      rating: 5
    },
    { 
      name: 'يوسف إبراهيم', 
      group: 'المجموعة ٣', 
      progress: 60,
      currentSurah: 'آل عمران (1-10)',
      recitationLevel: 'جيد',
      rating: 3
    },
    { 
      name: 'عائشة محمد', 
      group: 'المجموعة ١', 
      progress: 85,
      currentSurah: 'المائدة (1-12)',
      recitationLevel: 'جيد جداً',
      rating: 4
    },
    { 
      name: 'عمر خالد', 
      group: 'المجموعة ٢', 
      progress: 70,
      currentSurah: 'الأنعام (1-8)',
      recitationLevel: 'متوسط',
      rating: 3
    }
  ];
isLoggedIn(): boolean {
  return this.authServcie.isLoggedIn(); // Make sure you have this method
}

onLogout() {
  this.authServcie.logout();
}
  absentStudents = [
    { name: 'سارة عبدالله', group: 'المجموعة ١', absenceCount: 2 },
    { name: 'خالد سعيد', group: 'المجموعة ٣', absenceCount: 3 },
    { name: 'نورا أحمد', group: 'المجموعة ٢', absenceCount: 1 }
  ];

  events = [
    { title: 'اختبار شهري', date: new Date(2024, 5, 15), group: 'جميع المجموعات' },
    { title: 'اجتماع أولياء الأمور', date: new Date(2024, 5, 20), group: 'المجموعات ١-٣' },
    { title: 'مسابقة القرآن', date: new Date(2024, 5, 25), group: 'المتقدمين' }
  ];

  attendanceViewOptions = [
    { label: 'أسبوعي', value: 'weekly' },
    { label: 'شهري', value: 'monthly' },
    { label: 'فصلي', value: 'seasonal' }
  ];
  selectedView = 'weekly';

  attendanceChartData = {
    labels: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    datasets: [
      {
        label: 'الحضور',
        backgroundColor: '#3B82F6',
        data: [65, 72, 68, 79, 85, 82]
      }
    ]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        rtl: true,
        textDirection: 'rtl'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    rtl: true
  };


  constructor(private sidebarService: SidebarService
  , private authServcie: AuthService

  ) {}

  ngOnInit() {
    this.subscribeToSidebar();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  getMainContentClass(): string {
    if (this.isMobile) {
      return 'main-content-mobile';
    }
    return this.isCollapsed ? 'main-content-collapsed' : 'main-content-expanded';
  }




   private subscriptions: Subscription[] = [];

  // Dashboard data
  stats = {
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    totalGroups: 0,
    pendingRegistrations: 0,
    monthlyRevenue:0,
    attendanceRate: 0
  };

  // Pending actions that need admin attention
  pendingActions = [
    { type: 'registration', title: 'طلبات التسجيل الجديدة', count: 5, priority: 'high', icon: 'pi-user-plus', color: 'blue' },
    { type: 'payment', title: 'المدفوعات المعلقة', count: 8, priority: 'medium', icon: 'pi-credit-card', color: 'amber' },
    { type: 'teacher', title: 'طلبات إجازة المعلمين', count: 2, priority: 'medium', icon: 'pi-calendar-times', color: 'purple' },
    { type: 'complaint', title: 'شكاوى ومقترحات', count: 3, priority: 'low', icon: 'pi-exclamation-triangle', color: 'red' }
  ];

  // Recent activities
  recentActivities = [
    { type: 'student', message: 'تم قبول طالب جديد: أحمد محمد', time: '5 دقائق', icon: 'pi-user-plus', color: 'green' },
    { type: 'payment', message: 'تم استلام رسوم شهرية: 2,500 ريال', time: '15 دقيقة', icon: 'pi-money-bill', color: 'blue' },
    { type: 'teacher', message: 'المعلم خالد العبدالله سجل حضوره', time: '30 دقيقة', icon: 'pi-check-circle', color: 'teal' },
    { type: 'system', message: 'تم إنشاء تقرير شهري جديد', time: 'ساعة', icon: 'pi-file', color: 'purple' }
  ];

  // Critical alerts
  criticalAlerts = [
    { type: 'attendance', message: 'معدل الحضور انخفض إلى 87%', severity: 'warning' },
    { type: 'payment', message: '8 طلاب لم يدفعوا الرسوم الشهرية', severity: 'error' },
    { type: 'capacity', message: 'مجموعة الحفظ المتقدم وصلت للحد الأقصى', severity: 'info' }
  ];



 
 

  private subscribeToSidebar() {
    this.subscriptions.push(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.isCollapsed = collapsed;
      }),
      this.sidebarService.isMobile$.subscribe(mobile => {
        this.isMobile = mobile;
      }),
      this.sidebarService.sidebarOpen$.subscribe(open => {
        this.sidebarOpen = open;
      })
    );
  }

  handlePendingAction(action: any) {
    // Navigate to specific management page
    console.log('Handling action:', action);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

}
