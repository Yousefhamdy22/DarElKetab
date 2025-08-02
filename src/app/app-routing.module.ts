// app-routing.module.ts
import { Component, NgModule, inject } from '@angular/core';
import { RouterModule, Routes, ActivatedRoute } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard/dashboard.component';
import { StudentListComponent } from './modules/students/student-list/student-list.component';
import { StudentViewComponent } from './modules/students/student-view/student-view.component';
import { StudentFormComponent } from './modules/students/student-form/student-form.component';
import { GroupListComponent } from './modules/groups/group-list/group-list.component';
import { GroupFormComponent } from './modules/groups/group-form/group-form.component';
import { DailyAttendanceComponent } from './modules/attendance/daily-attendance/daily-attendance.component';
import { StudentReportComponent } from './modules/reports/student-report/student-report.component';
import { GroupReportComponent } from './modules/reports/group-report/group-report.component';
import { GroupAssignComponent } from './modules/groups/group-assign/group-assign.component';
import { GroupScheduleComponent } from './modules/groups/group-schedule/group-schedule.component';
import { TeacherComponent } from './modules/teacher/teacher.component';
import { ExamComponent } from './modules/exams/exam/exam.component';
import { ExamResulteComponent } from './modules/exams/exam-resulte/exam-resulte.component';
import { TeacherDashboardComponent } from './modules/dashboard/teacherdash/teacherdash.component';
import { BookinglistComponent } from './modules/book/bookinglist/bookinglist.component';
import { BookingComponent } from './modules/book/book-form/booking.component';
import { BookingCardComponent } from './modules/book/bookingcard/bookingcard.component';
import { SessionschedulComponent } from './modules/sessionschedul/sessionschedul.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';







const routes: Routes = [
 { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
     {path: 'dashboard' , component: DashboardComponent}
    ,{path: 'students' , component: StudentListComponent }
    ,{ path:'students/:id',  component: StudentViewComponent 
    }
    ,{ path: 'student/add' , component: StudentFormComponent}
    ,{path: 'gruops' , component: GroupListComponent}
    ,{path: 'group/add' , component: GroupFormComponent}
    ,{path: 'dailyattandance' , component: DailyAttendanceComponent}
    ,{path:'studentrepo' , component:StudentReportComponent}
    ,{path:'groupsrepo' , component: GroupReportComponent}
    ,{path: 'group/details/:id' , component: GroupAssignComponent}
    ,{path: 'group/shcedu' , component: GroupScheduleComponent}
    ,{path: 'teacher' , component: TeacherComponent}
    ,{path: 'exam' , component: ExamComponent}
    ,{path: 'examResult' , component: ExamResulteComponent}
    ,{path: 'group/repo' , component: GroupReportComponent}
    ,{path: 'dash/teacher' , component: TeacherDashboardComponent}


    
    ,{path: 'booking' , component: BookinglistComponent}
    ,{path: 'bookingnew' , component: BookingComponent}
    ,{path: 'bookingcard' , component: BookingCardComponent}


    ,{path: 'sessionschedule' , component: SessionschedulComponent}
    ,{path: 'login' , component: LoginComponent}
    ,{path: 'register' , component: RegisterComponent}









    ,{ path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule] 
})
export class AppRoutingModule { }

