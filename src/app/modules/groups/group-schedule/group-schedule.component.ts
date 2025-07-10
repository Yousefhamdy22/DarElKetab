import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';

interface Schedule {
  id: number;
  day: string;
  time: string;
  type: 'regular' | 'exam' | 'special';
  title: string;
  description?: string;
  attendanceTaken: boolean;
}

interface StudentAttendance {
  studentId: number;
  name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  examScore?: number;
}
@Component({
  selector: 'app-group-schedule',
  standalone: false,
  templateUrl: './group-schedule.component.html',
  styleUrl: './group-schedule.component.css'
})
export class GroupScheduleComponent {
  selectedDate: Date = new Date();
  schedules: Schedule[] = [
    {
      id: 1,
      day: 'الأحد',
      time: '16:30 - 18:00',
      type: 'regular',
      title: 'حفظ سورة الملك',
      attendanceTaken: true
    },
    {
      id: 2,
      day: 'الثلاثاء',
      time: '16:30 - 18:00',
      type: 'regular',
      title: 'مراجعة الجزء الثلاثين',
      attendanceTaken: false
    },
    {
      id: 3,
      day: 'الخميس',
      time: '16:30 - 18:00',
      type: 'exam',
      title: 'اختبار شهري - التلاوة',
      attendanceTaken: false
    }
  ];

  students: StudentAttendance[] = [
    { studentId: 1, name: 'محمد أحمد', status: 'present' },
    { studentId: 2, name: 'أحمد خالد', status: 'absent' },
    { studentId: 3, name: 'سارة محمد', status: 'present' },
    { studentId: 4, name: 'فاطمة علي', status: 'late' }
  ];

  selectedSchedule: Schedule | null = null;
  isAttendanceModalVisible = false;
  isExamModalVisible = false;

  attendanceStatuses = [
    { label: 'حاضر', value: 'present', icon: 'pi pi-check' },
    { label: 'غائب', value: 'absent', icon: 'pi pi-times' },
    { label: 'متأخر', value: 'late', icon: 'pi pi-clock' },
    { label: 'معذور', value: 'excused', icon: 'pi pi-info-circle' }
  ];

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {}

  openAttendanceModal(schedule: Schedule): void {
    this.selectedSchedule = schedule;
    this.isAttendanceModalVisible = true;
  }

  openExamModal(schedule: Schedule): void {
    this.selectedSchedule = schedule;
    this.isExamModalVisible = true;
    // Initialize exam scores if not set
    this.students.forEach(student => {
      if (student.examScore === undefined) {
        student.examScore = 0;
      }
    });
  }

  saveAttendance(): void {
    if (this.selectedSchedule) {
      this.selectedSchedule.attendanceTaken = true;
      this.messageService.add({
        severity: 'success',
        summary: 'تم الحفظ',
        detail: 'تم حفظ سجل الحضور بنجاح'
      });
      this.isAttendanceModalVisible = false;
    }
  }

  saveExamResults(): void {
    if (this.selectedSchedule) {
      this.selectedSchedule.attendanceTaken = true;
      this.messageService.add({
        severity: 'success',
        summary: 'تم الحفظ',
        detail: 'تم حفظ نتائج الاختبار بنجاح'
      });
      this.isExamModalVisible = false;
      
      // Here you would typically send data to your backend
      // this.examService.saveExamResults(this.students, this.selectedSchedule.id);
    }
  }

  addNewSchedule(): void {
    const newSchedule: Schedule = {
      id: this.schedules.length + 1,
      day: 'الأحد',
      time: '16:30 - 18:00',
      type: 'regular',
      title: 'جلسة جديدة',
      attendanceTaken: false
    };
    this.schedules.push(newSchedule);
    this.messageService.add({
      severity: 'info',
      summary: 'تم الإضافة',
      detail: 'تم إضافة جدول جديد'
    });
  }

  deleteSchedule(schedule: Schedule): void {
    this.schedules = this.schedules.filter(s => s.id !== schedule.id);
    this.messageService.add({
      severity: 'warn',
      summary: 'تم الحذف',
      detail: 'تم حذف الجدول المحدد'
    });
  }
  calculateAverage(): number {
    const totalScore = this.students
      .filter(student => student.examScore !== undefined)
      .reduce((sum, student) => sum + (student.examScore || 0), 0);
    const count = this.students.filter(student => student.examScore !== undefined).length;
    return count > 0 ? totalScore / count : 0;
  }
}
