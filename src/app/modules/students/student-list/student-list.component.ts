import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import { Student } from '../student.model';
import { MessageService } from 'primeng/api';
import { Group } from '../../groups/group.models';
import { GroupService } from '../../groups/group.service';


interface Note {
  title: string;
  content: string;
  date: string;
  teacher: string;
  teacherAvatar: string;
}

interface DropdownOption {
  label: string
  value: string
}
@Component({
  selector: 'app-student-list',
  standalone: false,
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  students: Student[] = []
  filteredStudents: Student[] = []

  groups : Group[] = []
  loading = true

  // Filter variables
  searchText = ""
  selectedStatus: DropdownOption | null = null
  selectedGroup: DropdownOption | null = null


  constructor(
    private studentService: StudentService ,
    private groupservice: GroupService,
    private masterService: MessageService
  
  ) 
    {}

  statusOptions: DropdownOption[] = [
    { label: "نشط", value: "active" },
    { label: "غير نشط", value: "inactive" },
  ]


  ngOnInit() {
   this.loadGruops();
    this.loadStudents();
  }
  
  loadGruops() {
    this.groupservice.getGroups().subscribe({
      next: (response: any) => {
        console.log('Response received:', response);
        
        // تأكد أن data موجودة وأنها مصفوفة
        this.groups = Array.isArray(response.data) ? response.data : [];
        
        console.log('Groups extracted:', this.groups);
        console.log(Array.isArray(this.groups));
        
        this.applyFilters();
      },
      error: (err) => {
        this.masterService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل البيانات'
        });
        this.groups = [];
      }
    });
    
  }
  groupOptions = [
    { label: 'Group 1', value: 1 },
    { label: 'Group 2', value: 2 },
    { label: 'Group 3', value: 3 }
  ];
 
  loadStudents() {
    this.studentService.getStudents().subscribe({
      next: (response: any) => {
        console.log('Response received:', response);
        
        this.students = Array.isArray(response.data) ? response.data : [];
        
        console.log('Students extracted:', this.students);
        console.log(Array.isArray(this.students));
        
        this.applyFilters();
      },
      error: (err) => {
        this.masterService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل البيانات'
        });
        this.students = [];
      }
    });
    
  }


  resetFilters(): void {
    this.searchText = '';
    this.selectedStatus = null;
    this.selectedGroup = null;
    this.filteredStudents = this.students; 
    console.log('Filters have been reset.');
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined {
    return status === 'active' ? 'success' : 'danger';
  }
  


  applyFilters() {
    this.filteredStudents = this.students.filter((student) => {
      // Filter by search text
      const matchesSearch =
        !this.searchText ||
        student.name.toLowerCase().includes(this.searchText.toLowerCase());

      // Filter by status
      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus.value === "active" && student.name) ||
        (this.selectedStatus.value === "inactive" && !student.name)

      // Filter by group
      const matchesGroup = !this.selectedGroup || (student.group && student.group.groupID === Number(this.selectedGroup.value))

      return matchesSearch && matchesStatus && matchesGroup
    })
  }


  getAttendanceClass(percentage: number): string {
    if (percentage >= 75) {
      return "bg-green-500"
    } else if (percentage >= 50) {
      return "bg-amber-500"
    } else {
      return "bg-red-500"
    }
  }

  getAttendanceTextClass(percentage: number): string {
    if (percentage >= 75) {
      return "text-green-600"
    } else if (percentage >= 50) {
      return "text-amber-600"
    } else {
      return "text-red-600"
    }
  }

  getActiveStudentsCount() {
    // return this.filteredStudents.filter((student) => student.active).length
  }

  getAverageAttendance()  {
    // if (this.filteredStudents.length === 0) return 0

    // const total = this.filteredStudents.reduce((sum, student) => sum + student.attendancePercentage, 0)
    // return Math.round(total / this.filteredStudents.length)
  }

  deleteStudent(studentId: number): void {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      this.studentService.deleteStudent(studentId).subscribe({
        next: () => {
          this.masterService.add({
            severity: 'success',
            summary: 'تم الحذف',
            detail: 'تم حذف الطالب بنجاح'
          });
          this.loadStudents(); // Reload the list
        },
        error: (err) => {
          this.masterService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل في حذف الطالب'
          });
        }
      });
    }
  }
}
