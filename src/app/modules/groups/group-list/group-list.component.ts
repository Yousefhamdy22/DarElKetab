import { Component, OnInit } from '@angular/core';
import { GroupService } from '../group.service';
import { MessageService } from 'primeng/api';
import { Group } from '../group.models';

// interface Group {
//   id: string
//   name: string
//   description: string
//   teacher: string
//   schedule: string
//   location: string
//   currentStudents: number
//   maxStudents: number
//   active: boolean
// }

interface DropdownOption {
  label: string
  value: string
}
@Component({
  selector: 'app-group-list',
  standalone: false,
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css'
})
export class GroupListComponent  implements OnInit{
  groups: Group[] = []
  filteredGroups: Group[] = []

constructor(
  private groupService: GroupService, 
  private messageService: MessageService
) {}

  // Filter variables
  searchText = ""
  selectedStatus: DropdownOption | null = null

  statusOptions: DropdownOption[] = [
    { label: "نشطة", value: "active" },
    { label: "غير نشطة", value: "inactive" },
  ]

  ngOnInit() {

    
    this.loadGruops(); 
        
  
  }

   loadGruops() {
    this.groupService.getGroups().subscribe({
      next: (response: any) => {
        console.log('Response received:', response);
        
        // تأكد أن data موجودة وأنها مصفوفة
        this.groups = Array.isArray(response.data) ? response.data : [];
        
        console.log('Groups extracted:', this.groups);
        console.log(Array.isArray(this.groups));
        
        this.applyFilters();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل البيانات'
        });
        this.groups = [];
      }
    });
    
  }
    
    
      
  

  applyFilters() {
    if (!Array.isArray(this.groups)) {
      this.filteredGroups = [];
      return;
    }
  
    this.filteredGroups = this.groups.filter((group) => {
      // Filter by search text
      const matchesSearch =
        !this.searchText ||
        group.groupName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        group.description?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        group.teacher?.name?.toLowerCase().includes(this.searchText.toLowerCase());
  
      // Filter by status
      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus.value === "active" && group.active) ||
        (this.selectedStatus.value === "inactive" && !group.active);
  
      return matchesSearch && matchesStatus;
    });
  }
  
  getTotalStudents(): number {
    return this.groups.reduce((total, group) => total + (group.currentStudents ?? 0), 0)
  }

  getActiveGroupsCount(): number {
    return this.groups.filter((group) => group.active).length
  }
}
