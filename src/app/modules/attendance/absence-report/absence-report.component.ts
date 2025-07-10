import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
interface Student {
  id: number;
  name: string;
  group: string;
  avatar: string;
  initials: string;
  present: boolean;
  absenceCount: number;
}

interface Group {
  name: string;
  code: string;
}
@Component({
  selector: 'app-absence-report',
  standalone: false,
  templateUrl: './absence-report.component.html',
  styleUrl: './absence-report.component.css'
})
export class AbsenceReportComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  selectedDate: Date = new Date();
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  searchQuery: string = '';
  attendanceRecorded: boolean = false;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    // Mock data for demo
    this.groups = [
      { name: 'الحفظ المتقدم', code: 'advanced' },
      { name: 'المستوى المتوسط', code: 'intermediate' },
      { name: 'المبتدئين', code: 'beginners' }
    ];

    this.loadStudents();
  }

  loadStudents(): void {
    // Mock student data
    this.students = [
      { 
        id: 1, 
        name: 'عبدالله محمد', 
        group: 'الحفظ المتقدم',
        avatar: '', 
        initials: 'ع م', 
        present: true,
        absenceCount: 0
      },
      { 
        id: 2, 
        name: 'محمد خالد', 
        group: 'المستوى المتوسط',
        avatar: '', 
        initials: 'م خ', 
        present: true,
        absenceCount: 0
      },
      { 
        id: 3, 
        name: 'سعد العمري', 
        group: 'المبتدئين',
        avatar: '', 
        initials: 'س ع', 
        present: false,
        absenceCount: 3
      },
      { 
        id: 4, 
        name: 'أحمد حسن', 
        group: 'الحفظ المتقدم',
        avatar: '', 
        initials: 'أ ح', 
        present: true,
        absenceCount: 0
      },
      { 
        id: 5, 
        name: 'خالد الأحمد', 
        group: 'الحفظ المتقدم',
        avatar: '', 
        initials: 'خ أ', 
        present: false,
        absenceCount: 1
      },
      { 
        id: 6, 
        name: 'فيصل الحارثي', 
        group: 'المستوى المتوسط',
        avatar: '', 
        initials: 'ف ح', 
        present: true,
        absenceCount: 0
      },
      { 
        id: 7, 
        name: 'عمر السليم', 
        group: 'المبتدئين',
        avatar: '', 
        initials: 'ع س', 
        present: true,
        absenceCount: 1
      }
    ];
    
    this.filterStudents();
  }

  filterStudents(): void {
    this.filteredStudents = this.students.filter(student => {
      // Filter by group if selected
      const groupMatch = this.selectedGroup ? student.group === this.selectedGroup.name : true;
      
      // Filter by search query
      const nameMatch = this.searchQuery ? 
        student.name.toLowerCase().includes(this.searchQuery.toLowerCase()) : true;
        
      return groupMatch && nameMatch;
    });
  }

  onGroupChange(): void {
    this.filterStudents();
  }

  onSearchChange(): void {
    this.filterStudents();
  }

  getGroupBgClass(group: string): string {
    if (group === 'الحفظ المتقدم') return 'bg-blue-100 text-blue-800';
    if (group === 'المستوى المتوسط') return 'bg-green-100 text-green-800';
    if (group === 'المبتدئين') return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-800';
  }

  getAvatarBgClass(group: string): string {
    if (group === 'الحفظ المتقدم') return 'bg-blue-100 text-blue-600';
    if (group === 'المستوى المتوسط') return 'bg-green-100 text-green-600';
    if (group === 'المبتدئين') return 'bg-amber-100 text-amber-600';
    return 'bg-gray-100 text-gray-600';
  }

  saveAttendance(): void {
    // Here you would normally save to a backend
    this.attendanceRecorded = true;
    this.messageService.add({
      severity: 'success',
      summary: 'تم بنجاح',
      detail: 'تم تسجيل الحضور لـ ' + this.formatDate(this.selectedDate)
    });
  }

  formatDate(date: Date): string {
    // Simple formatter to display in Arabic format
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  markAllPresent(): void {
    this.filteredStudents.forEach(student => student.present = true);
  }

  resetForm(): void {
    this.selectedDate = new Date();
    this.selectedGroup = null;
    this.searchQuery = '';
    this.students.forEach(student => student.present = true);
    this.filterStudents();
    this.attendanceRecorded = false;
  }
}
