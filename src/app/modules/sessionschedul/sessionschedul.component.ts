// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Observable, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators'
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Student } from '../students/student.model';
import { Group } from '../groups/group.models';
import { SessionScheduleService } from './SessionScheduleService.service';
import { GroupService } from '../groups/group.service';
import { TeacherService } from '../teacher/teacher.service';
import { Teacher } from '../teacher/teacher.model';


import { Component, type OnInit, inject, signal, computed } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
// enum SessionStatus {
//   SCHEDULED = 'scheduled',
//   ACTIVE = 'active',
//   COMPLETED = 'completed',
//   CANCELLED = 'cancelled',
//   POSTPONED = 'postponed'
// }

// export interface SessionSchedule {
//   id: number;
//   title: string;
//   description?: string;
//   groupId: number;
//   group?: Group;
//   date: Date;
//   startTime: string;
//   stage: string,
//   stagelevel:string,
//   endTime: string;
//   duration: number; // in minutes
//   dayOfWeek: string;
//   notes: string;
//   sessionType: string;
//   status: SessionStatus;
//   students?: Student[];
//   createdAt: Date;
//   updatedAt: Date;
// }
// export interface SessionRequest {
//   groupId: number;
//   sessionDate: string; // ISO date string
//   sessionType: string;
//   status: string;
//   stage: string;
//   stageLevel: string;
//   notes: string;
//   createdBy: string;
// }



enum SessionStatus {
  SCHEDULED = 'Scheduled',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  POSTPONED = 'Postponed'
}

export interface SessionSchedule {
  id: number;
  groupId: number;
  educationStage: string;
  gradeLevel: number;
  sessionDate: Date[];
  notes: string;
  createdBy: string;
  status: string;
  skipExistingSessions: boolean;
  // Included properties
  group?: {
    id: number;
    groupName: string;
    teacher?: {
      id: number;
      name: string;
    };
  };
  attendanceRecords?: {
    id: number;
    student: {
      id: number;
      studentID: number;
      name: string;
    };
    isPresent: boolean;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionRequest {
  groupId: number;
  educationStage: string;
  gradeLevel: number;
  sessionDate: string[];
  notes: string;
  createdBy: string;
  skipExistingSessions: boolean;
  status?: string; // For update
}

export interface Stage {
  label: string;
  value: string;
}

export interface StageLevel {
  label: string;
  value: number;
}

@Component({
  selector: 'app-sessionschedul',
  standalone: false,
  templateUrl: './sessionschedul.component.html',
  styleUrl: './sessionschedul.component.css'
})
export class SessionschedulComponent implements OnInit {

   // Injected services
   private readonly fb = inject(FormBuilder)
   private readonly router = inject(Router)
   private readonly messageService = inject(MessageService)
   private readonly confirmationService = inject(ConfirmationService)
   private readonly sessionService = inject(SessionScheduleService)
   private readonly groupService = inject(GroupService)
   private readonly teacherService = inject(TeacherService)
 
   // Signals for reactive state management
   sessions = signal<SessionSchedule[]>([])
   groups = signal<Group[]>([])
   teachers = signal<Teacher[]>([])
   stages = signal<Stage[]>([
     { label: "الابتدائية", value: "primary" },
     { label: "المتوسطة", value: "middle" },
     { label: "الثانوية", value: "high" },
   ])
   stageLevels = signal<StageLevel[]>([
     { label: "الصف الأول", value: 1 },
     { label: "الصف الثاني", value: 2 },
     { label: "الصف الثالث", value: 3 },
     { label: "الصف الرابع", value: 4 },
     { label: "الصف الخامس", value: 5 },
     { label: "الصف السادس", value: 6 },
 
   ])
 
   // Loading states
   isLoadingSessions = signal(false)
   isLoadingGroups = signal(false)
   isLoadingTeachers = signal(false)
   isLoadingDetails = signal(false)
   isSaving = signal(false)
 
   // Dialog states
   showSessionDialog = signal(false)
   showDetailsDialog = signal(false)
   isEditMode = signal(false)
   currentSession = signal<SessionSchedule | null>(null)
   selectedSessionDetails = signal<SessionSchedule | null>(null)
 
   // Filters
   searchTerm = signal("")
   selectedGroupId = signal<number | null>(null)
   selectedStatus = signal<SessionStatus | null>(null)
   dateRange = signal<Date[]>([])
 
   // Form
   sessionForm: FormGroup
 
   // Computed values
   filteredSessions = computed(() => {
     const sessions = this.sessions() || []
     let filtered = [...sessions]
 
     // Search filter
     const search = this.searchTerm()?.toLowerCase() || ""
     if (search) {
       filtered = filtered.filter(
         (session) =>
           session.notes?.toLowerCase().includes(search) ||
           session.group?.groupName?.toLowerCase().includes(search) ||
           session.group?.teacher?.name?.toLowerCase().includes(search),
       )
     }
 
     // Group filter
     const groupId = this.selectedGroupId()
     if (groupId) {
       filtered = filtered.filter((session) => session.groupId === groupId)
     }
 
     // Status filter
     const status = this.selectedStatus()
     if (status) {
       filtered = filtered.filter((session) => session.status === status)
     }
 
     // Date range filter
     const dateRange = this.dateRange() || []
     if (dateRange && dateRange.length === 2) {
       const startDate = dateRange[0]
       const endDate = dateRange[1]
       filtered = filtered.filter((session) => {
         if (session.sessionDate && session.sessionDate.length > 0) {
           const sessionDate = new Date(session.sessionDate[0])
           return sessionDate >= startDate && sessionDate <= endDate
         }
         return false
       })
     }
 
     return filtered
   })
 
   // Statistics
   totalSessions = computed(() => this.sessions().length)
   activeGroups = computed(() => new Set(this.sessions().map((s) => s.groupId)).size)
   pendingSessions = computed(
     () => this.sessions().filter((s) => s.status === "Scheduled" || s.status === "Active").length,
   )
 
   isLoadingCriticalData = computed(() => this.isLoadingSessions() || this.isLoadingGroups())
 
   // Status options
   statusOptions = [
     { label: "مجدولة", value: "Scheduled", class: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
     { label: "نشطة", value: "Active", class: "bg-green-100 text-green-700", dot: "bg-green-500" },
     { label: "مكتملة", value: "Completed", class: "bg-gray-100 text-gray-700", dot: "bg-gray-500" },
     { label: "ملغاة", value: "Cancelled", class: "bg-red-100 text-red-700", dot: "bg-red-500" },
     { label: "مؤجلة", value: "Postponed", class: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
   ]
 
   constructor() {
     this.sessionForm = this.createForm()
 
     // Initialize empty arrays to prevent undefined errors
     this.groups.set([])
     this.teachers.set([])
   }
 
   ngOnInit(): void {
     this.loadInitialData()
   }
 
   private createForm(): FormGroup {
     return this.fb.group({
       groupId: ["", Validators.required],
       educationStage: ["", Validators.required],
       gradeLevel: ["", [Validators.required, Validators.min(1), Validators.max(12)]],
       sessionDate: [[], Validators.required],
       notes: [""],
       createdBy: ["admin"],
       skipExistingSessions: [true],
       status: ["Scheduled"],
     })
   }
 
   private loadInitialData(): void {
     this.loadSessions()
     this.loadGroups()
     this.loadTeachers()
   }
 
   loadSessions(): void {
     this.isLoadingSessions.set(true)
     this.sessionService.getAllSessions().subscribe({
       next: (sessions) => {
         // Ensure we always have an array
         this.sessions.set(Array.isArray(sessions) ? sessions : [])
         this.isLoadingSessions.set(false)
         console.log("Sessions loaded:", this.sessions().length)
       },
       error: (error) => {
         console.error("Error loading sessions:", error)
         this.sessions.set([]) // Set empty array on error
         this.isLoadingSessions.set(false)
         this.messageService.add({
           severity: "error",
           summary: "خطأ",
           detail: "فشل في تحميل الحصص",
         })
       },
     })
   }
 
  clearDateRange() {
    this.dateRange.set([]);
    this.onDateFilter();
  }
  
  // Calendar navigation methods
 

getSelectedGroupName(): string {
  if (!this.selectedGroupId) return '';
  const group = this.groups().find(g => g.groupID === this.selectedGroupId());
  return group?.groupName || '';
}

loadGroups(): void {
  this.isLoadingGroups.set(true);
  
  console.log('Loading groups...');
  
  this.groupService.getGroupForSesssion().subscribe({
    next: (groupsArray) => {
      console.log("Processed groups array:", groupsArray);
      console.log("Groups count:", groupsArray.length);
      
      if (groupsArray.length === 0) {
        console.warn('No groups found in response');
        // You can show a user-friendly message here
        this.showNoDataMessage();
      }
      
      this.groups.set(groupsArray);
      this.isLoadingGroups.set(false);
    },
    error: (error) => {
      console.error("API Error:", error);
      this.groups.set([]);
      this.isLoadingGroups.set(false);
      this.showErrorMessage('Failed to load groups');
    }
  });
}

// Helper methods for user feedback
  private showNoDataMessage(): void {
 
  console.log('Show: No groups available');
 
 }

  private showErrorMessage(message: string): void {

  console.log('Show error:', message);
 
  }
   loadTeachers(): void {
     this.isLoadingTeachers.set(true)
     this.teacherService.getAllTeachers().subscribe({
       next: (teachers) => {
         // Ensure we always have an array
         this.teachers.set(Array.isArray(teachers) ? teachers : [])
         this.isLoadingTeachers.set(false)
         console.log("Teachers loaded:", this.teachers().length)
       },
       error: (error) => {
         console.error("Error loading teachers:", error)
         this.teachers.set([]) // Set empty array on error
         this.isLoadingTeachers.set(false)
         this.messageService.add({
           severity: "error",
           summary: "خطأ",
           detail: "فشل في تحميل المعلمين",
         })
       },
     })
   }
 
   // CRUD Operations
   showCreateSessionDialog(): void {
     this.isEditMode.set(false)
     this.currentSession.set(null)
     this.sessionForm.reset()
     this.sessionForm.patchValue({
       createdBy: "admin",
       skipExistingSessions: true,
       status: "Scheduled",
     })
     this.showSessionDialog.set(true)
   }
 
   editSession(session: SessionSchedule): void {
     this.isEditMode.set(true)
     this.currentSession.set(session)
 
     this.sessionForm.patchValue({
       groupId: session.groupId,
       educationStage: session.educationStage,
       gradeLevel: session.gradeLevel,
       sessionDate: session.sessionDate?.map((date) => new Date(date)) || [],
       notes: session.notes,
       createdBy: session.createdBy,
       skipExistingSessions: session.skipExistingSessions || false,
       status: session.status,
     })
 
     this.showSessionDialog.set(true)
   }
 
   async saveSession(): Promise<void> {
     if (this.sessionForm.valid && !this.isSaving()) {
       this.isSaving.set(true)
       try {
         const formValue = this.sessionForm.value
 
         const sessionData: SessionRequest = {
           groupId: formValue.groupId,
           educationStage: formValue.educationStage,
           gradeLevel: formValue.gradeLevel,
           sessionDate: formValue.sessionDate?.map((date: Date) => date.toISOString()) || [],
           notes: formValue.notes || "",
           createdBy: formValue.createdBy,
           skipExistingSessions: formValue.skipExistingSessions,
         }
 
         if (this.isEditMode() && this.currentSession()) {
           sessionData.status = formValue.status
         }
 
         let result: SessionSchedule
 
         if (this.isEditMode() && this.currentSession()) {
           result = (await this.sessionService
             .updateSession(this.currentSession()!.id, sessionData)
             .toPromise()) as SessionSchedule
 
           // Update local data
           const currentSessions = this.sessions()
           const index = currentSessions.findIndex((s) => s.id === this.currentSession()!.id)
           if (index !== -1) {
             currentSessions[index] = result
             this.sessions.set([...currentSessions])
           }
 
           this.messageService.add({
             severity: "success",
             summary: "تم التحديث",
             detail: "تم تحديث الحصة بنجاح",
           })
         } else {
           result = (await this.sessionService.createSession(sessionData).toPromise()) as SessionSchedule
 
           // Add to local data
           this.sessions.update((sessions) => [result, ...sessions])
 
           this.messageService.add({
             severity: "success",
             summary: "تم الإنشاء",
             detail: "تم إنشاء الحصة بنجاح",
           })
         }
 
         this.closeSessionDialog()
       } catch (error) {
         console.error("Error saving session:", error)
         this.messageService.add({
           severity: "error",
           summary: "خطأ",
           detail: this.isEditMode() ? "فشل في تحديث الحصة" : "فشل في إنشاء الحصة",
         })
       } finally {
         this.isSaving.set(false)
       }
     }
   }
 
   closeSessionDialog(): void {
     this.showSessionDialog.set(false)
     this.sessionForm.reset()
     this.currentSession.set(null)
     this.isEditMode.set(false)
   }
 
   deleteSession(session: SessionSchedule): void {
     this.confirmationService.confirm({
       message: `هل أنت متأكد من حذف هذه الحصة؟`,
       header: "تأكيد الحذف",
       icon: "pi pi-exclamation-triangle",
       acceptLabel: "حذف",
       rejectLabel: "إلغاء",
       acceptButtonStyleClass: "p-button-danger",
       accept: () => {
         this.performDelete(session)
       },
     })
   }
 
   private async performDelete(session: SessionSchedule): Promise<void> {
     try {
       await this.sessionService.deleteSession(session.id).toPromise()
 
       // Remove from local data
       this.sessions.update((sessions) => sessions.filter((s) => s.id !== session.id))
 
       this.messageService.add({
         severity: "success",
         summary: "تم الحذف",
         detail: "تم حذف الحصة بنجاح",
       })
     } catch (error) {
       console.error("Error deleting session:", error)
       this.messageService.add({
         severity: "error",
         summary: "خطأ",
         detail: "فشل في حذف الحصة",
       })
     }
   }
 
   duplicateSession(session: SessionSchedule): void {
     const duplicatedSession: SessionRequest = {
       groupId: session.groupId,
       educationStage: session.educationStage,
       gradeLevel: session.gradeLevel,
       sessionDate: session.sessionDate?.map((date) => new Date(date).toISOString()) || [],
       notes: session.notes || "",
       createdBy: "admin",
       skipExistingSessions: true,
     }
 
     this.sessionService.createSession(duplicatedSession).subscribe({
       next: (result) => {
         this.sessions.update((sessions) => [result, ...sessions])
 
         this.messageService.add({
           severity: "success",
           summary: "تم النسخ",
           detail: "تم نسخ الحصة بنجاح",
         })
       },
       error: (error) => {
         console.error("Error duplicating session:", error)
         this.messageService.add({
           severity: "error",
           summary: "خطأ",
           detail: "فشل في نسخ الحصة",
         })
       },
     })
   }
 
   async viewSessionDetails(session: SessionSchedule): Promise<void> {
     this.isLoadingDetails.set(true)
     this.showDetailsDialog.set(true)
 
     try {
       const detailedSession = (await this.sessionService.getSessionDetails(session.id).toPromise()) as SessionSchedule
       this.selectedSessionDetails.set(detailedSession)
     } catch (error) {
       console.error("Error loading session details:", error)
       this.messageService.add({
         severity: "error",
         summary: "خطأ",
         detail: "فشل في تحميل تفاصيل الحصة",
       })
       this.showDetailsDialog.set(false)
     } finally {
       this.isLoadingDetails.set(false)
     }
   }
 
   closeDetailsDialog(): void {
     this.showDetailsDialog.set(false)
     this.selectedSessionDetails.set(null)
   }
 
   // Filter methods
   onSearch(): void {
     // Filters are automatically applied via computed signal
   }
 
   onGroupFilter(): void {
     // Filters are automatically applied via computed signal
   }
 
   onStatusFilter(): void {
     // Filters are automatically applied via computed signal
   }
 
   onDateFilter(): void {
     // Filters are automatically applied via computed signal
   }
 
   // Utility methods
   getPresentCount(session: SessionSchedule): number {
     return session.attendanceRecords?.filter((r) => r.isPresent).length || 0
   }
 
   getAbsentCount(session: SessionSchedule): number {
     return session.attendanceRecords?.filter((r) => !r.isPresent).length || 0
   }
 
   /**
    * Handles date range selection from the calendar, normalizing the event to Date[]
    */
   onDateRangeSelect(event: Date | Date[]): void {
     this.dateRange.set(Array.isArray(event) ? event : [event]);
     this.onDateFilter();
   }
 
   getStatusClass(status: string): string {
     const statusOption = this.statusOptions.find((opt) => opt.value === status)
     return statusOption?.class || "bg-gray-100 text-gray-700"
   }
 
   getStatusDotClass(status: string): string {
     const statusOption = this.statusOptions.find((opt) => opt.value === status)
     return statusOption?.dot || "bg-gray-500"
   }
 
   getStatusLabel(status: string): string {
     const statusOption = this.statusOptions.find((opt) => opt.value === status)
     return statusOption?.label || status
   }
 
   getTeacherInitials(name?: string): string {
     if (!name) return "NN"
     return name
       .split(" ")
       .map((word) => word[0])
       .join("")
       .toUpperCase()
       .substring(0, 2)
   }
 
   getAttendancePercentage(session: SessionSchedule): number {
     if (!session.attendanceRecords || session.attendanceRecords.length === 0) return 0
     const presentCount = session.attendanceRecords.filter((r) => r.isPresent).length
     return Math.round((presentCount / session.attendanceRecords.length) * 100)
   }
 
   getAttendanceCount(session: SessionSchedule): string {
     if (!session.attendanceRecords) return "0/0"
     const presentCount = session.attendanceRecords.filter((r) => r.isPresent).length
     return `${presentCount}/${session.attendanceRecords.length}`
   }
 
   trackBySessionId(index: number, session: SessionSchedule): number {
     return session.id
   }
 
   navigateBack(): void {
     this.router.navigate(["/admin/dashboard"])
   }
 
   exportSessions(): void {
     const exportData = this.filteredSessions().map((session) => ({
       "رقم الحصة": session.id,
       المجموعة: session.group?.groupName || "غير محدد",
       "المرحلة التعليمية": session.educationStage,
       الصف: session.gradeLevel,
       التاريخ: session.sessionDate?.[0] ? new Date(session.sessionDate[0]).toLocaleDateString("ar-SA") : "غير محدد",
       الحالة: this.getStatusLabel(session.status),
       المعلم: session.group?.teacher?.name || "غير محدد",
       "عدد الحضور": session.attendanceRecords?.filter((r) => r.isPresent).length || 0,
     }))
 
     this.messageService.add({
       severity: "info",
       summary: "تصدير",
       detail: "سيتم تصدير البيانات قريباً",
     })
   }
 
   // Form getters
   get groupId() {
     return this.sessionForm.get("groupId")
   }
   get educationStage() {
     return this.sessionForm.get("educationStage")
   }
   get gradeLevel() {
     return this.sessionForm.get("gradeLevel")
   }
   get sessionDate() {
     return this.sessionForm.get("sessionDate")
   }
   get notes() {
     return this.sessionForm.get("notes")
   }
   get status() {
     return this.sessionForm.get("status")
   }
 }
 