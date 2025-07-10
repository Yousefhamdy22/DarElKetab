import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';

import { TableModule } from 'primeng/table';
import { StudentReportComponent } from "./student-report/student-report.component";
import { GroupReportComponent } from "./group-report/group-report.component";

@NgModule({
    declarations:[
      StudentReportComponent,
      GroupReportComponent
    ],
    imports:[
        CommonModule,
        FormsModule,
        TabViewModule,
        ButtonModule,
        TableModule,
        ChartModule,
        ProgressBarModule,
        DropdownModule
    ],
    exports:[
        StudentReportComponent,
        GroupReportComponent,

    ],
   providers:[
    DatePipe
]
})
export class reportModule
{

}