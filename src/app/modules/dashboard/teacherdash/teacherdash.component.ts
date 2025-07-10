
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacherdash.component.html',
  styleUrls: ['./teacherdash.component.css']
})
export class TeacherDashboardComponent implements OnInit {
  
  // Sidebar state
  isMobile = false;
  sidebarOpen = false;

  // Teacher info
  teacher = {
    name: 'خالد العبدالله',
    specialty: 'معلم الحفظ المتقدم',
    initials: 'خ ع'
  };

  // Stats data
  stats = {
    myStudents: 34,
    todayClasses: 3,
    attendanceRate: 91,
    activeBookings: 2
  };

  // Today's schedule
  todaySchedule = [
    {
      title: 'الحفظ المتقدم - مجموعة أ',
      time: '08:00 - 10:00 صباحاً',
      room: 'القاعة B12',
      students: 12,
      status: 'upcoming',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'الحفظ المتقدم - مجموعة ب',
      time: '10:30 - 12:30 ظهراً',
      room: 'القاعة B12',
      students: 11,
      status: 'current',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'الحفظ المتقدم - مجموعة ج',
      time: '13:00 - 15:00 بعد الظهر',
      room: 'القاعة B12',
      students: 11,
      status: 'upcoming',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-800',
      buttonColor: 'bg-amber-600 hover:bg-amber-700'
    }
  ];

  // My groups
  myGroups = [
    {
      name: 'الحفظ المتقدم - أ',
      students: 12,
      level: 'متقدم',
      nextClass: 'غداً 08:00',
      progress: 85,
      bgColor: 'from-blue-400 to-blue-600'
    },
    {
      name: 'الحفظ المتقدم - ب',
      students: 11,
      level: 'متقدم',
      nextClass: 'اليوم 10:30',
      progress: 78,
      bgColor: 'from-green-400 to-green-600'
    },
    {
      name: 'الحفظ المتقدم - ج',
      students: 11,
      level: 'متقدم',
      nextClass: 'اليوم 13:00',
      progress: 92,
      bgColor: 'from-purple-400 to-purple-600'
    }
  ];

  // Recent students activity
  recentStudents = [
    {
      name: 'عبدالله محمد',
      activity: 'أكمل حفظ سورة البقرة',
      time: 'قبل 10 دقائق',
      type: 'achievement',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: 'pi-check-circle'
    },
    {
      name: 'محمد خالد',
      activity: 'حضر الدرس وشارك بفعالية',
      time: 'قبل 30 دقيقة',
      type: 'attendance',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'pi-calendar-check'
    },
    {
      name: 'أحمد حسن',
      activity: 'تحسن ملحوظ في التجويد',
      time: 'قبل ساعة',
      type: 'improvement',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: 'pi-star'
    }
  ];

  // Booking requests
  bookingRequests = [
    {
      room: 'القاعة A5',
      date: 'غداً',
      time: '09:00 - 11:00',
      purpose: 'حصة إضافية للمراجعة',
      status: 'pending',
      statusText: 'في الانتظار',
      statusColor: 'bg-amber-100 text-amber-800'
    },
    {
      room: 'القاعة C2',
      date: 'الأحد',
      time: '14:00 - 16:00',
      purpose: 'اختبار شفهي',
      status: 'approved',
      statusText: 'مؤكد',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

  // Current date and time
  currentDateTime = '';

  constructor() { }

  ngOnInit(): void {
    this.checkScreenSize();
    this.updateDateTime();
    window.addEventListener('resize', () => this.checkScreenSize());
    
    // Update time every minute
    setInterval(() => this.updateDateTime(), 60000);
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
  }

  updateDateTime() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    this.currentDateTime = now.toLocaleDateString('ar-EG', options);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      // Implement logout logic
      console.log('Logging out...');
    }
  }

  // Navigation methods
  navigateToStudents() {
    // Implement navigation to students list
  }

  navigateToSchedule() {
    // Implement navigation to schedule
  }

  navigateToBookings() {
    // Implement navigation to bookings
  }

  // Action methods
  takeAttendance(classInfo: any) {
    // Implement attendance taking logic
    console.log('Taking attendance for:', classInfo.title);
  }

  viewClassDetails(classInfo: any) {
    // Implement view class details logic
    console.log('Viewing details for:', classInfo.title);
  }

  viewGroupDetails(group: any) {
    // Implement view group details logic
    console.log('Viewing group:', group.name);
  }

  manageGroup(group: any) {
    // Implement group management logic
    console.log('Managing group:', group.name);
  }

  bookRoom() {
    // Implement room booking logic
    console.log('Opening room booking dialog');
  }

  viewBookingDetails(booking: any) {
    // Implement booking details view
    console.log('Viewing booking:', booking);
  }

  startClass(classInfo: any) {
    // Implement start class logic
    console.log('Starting class:', classInfo.title);
  }

  getStatusButtonText(status: string): string {
    switch (status) {
      case 'current':
        return 'الحصة الحالية';
      case 'upcoming':
        return 'تسجيل الحضور';
      default:
        return 'التفاصيل';
    }
  }

  getStatusButtonIcon(status: string): string {
    switch (status) {
      case 'current':
        return 'pi pi-play';
      case 'upcoming':
        return 'pi pi-calendar-check';
      default:
        return 'pi pi-eye';
    }
  }
}