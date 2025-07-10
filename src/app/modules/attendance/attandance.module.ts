import { NgModule } from "@angular/core";
import { AbsenceReportComponent } from "./absence-report/absence-report.component";

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DailyAttendanceComponent } from "./daily-attendance/daily-attendance.component";

import { dashModule } from "../dashboard/dashboard.module";
@NgModule({
    declarations:[
      
     DailyAttendanceComponent ,
     
    ],
    imports:[
        dashModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        TableModule,
        ButtonModule,
        CalendarModule,
        DropdownModule,
        InputTextModule,
        CheckboxModule,
        ToastModule,
        InputTextareaModule
    ],
    exports:[
       
         
        DailyAttendanceComponent

    ],
    providers:[
        MessageService
    ]
})
export class attancenceModule
{

}