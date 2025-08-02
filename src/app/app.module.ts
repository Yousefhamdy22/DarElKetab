import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DropdownModule } from 'primeng/dropdown'; 
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from '@angular/common';
import { AppComponent } from "./app.component";
import { dashModule } from "./modules/dashboard/dashboard.module";
import { RouterModule, RouterOutlet } from "@angular/router";

import { PageHeaderComponent } from "./shared/components/page-header/page-header.component";
import { studentModule } from "./modules/students/student.module";
import { StudentViewComponent } from "./modules/students/student-view/student-view.component";
import { AppRoutingModule } from "./app-routing.module";
import { groupModule } from "./modules/groups/grorp.module";
import { attancenceModule } from "./modules/attendance/attandance.module";
import { reportModule } from "./modules/reports/reports.module";
import { TeacherModule } from "./modules/teacher/teacher.module";
import { examModule } from "./modules/exams/exam.module";
import { BookModule } from "./modules/book/book.module";
import { AuthModule } from "./auth/auth.module";

@NgModule({
  declarations: [AppComponent],
  imports: [
    FormsModule,
    dashModule,
    studentModule,
    examModule,
    groupModule,
    TeacherModule,
    attancenceModule,
    reportModule,
    BookModule,
    //
    AppRoutingModule,
    BrowserModule,
    CommonModule,
    RouterModule,
    AuthModule
   
],
 
  bootstrap: [AppComponent]
})
export class AppModule {}