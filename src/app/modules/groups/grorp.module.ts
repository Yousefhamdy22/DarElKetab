import { NgModule } from "@angular/core";
import { GroupListComponent } from "./group-list/group-list.component";
import { GroupFormComponent } from "./group-form/group-form.component";

import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { TooltipModule } from "primeng/tooltip"
import { InputTextareaModule } from "primeng/inputtextarea"
import { RadioButtonModule } from "primeng/radiobutton"
import { CalendarModule } from "primeng/calendar"
import { CheckboxModule } from "primeng/checkbox"
import { InputNumberModule } from "primeng/inputnumber"
import { DialogModule } from "primeng/dialog"
import { ToastModule } from 'primeng/toast';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { dashModule } from "../dashboard/dashboard.module";
import { GroupAssignComponent } from "./group-assign/group-assign.component";
import { TableModule } from "primeng/table";
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from "primeng/menu";
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChartModule } from 'primeng/chart';
import { GroupScheduleComponent } from "./group-schedule/group-schedule.component";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { GroupReadingComponent } from "./group-reading/group-reading.component";
import { ProgressBarModule } from 'primeng/progressbar';
import { ChipModule } from 'primeng/chip';


@NgModule({
    declarations:[
        GroupListComponent,
        GroupFormComponent,
        GroupReadingComponent,
        GroupAssignComponent, 
        GroupScheduleComponent
    ],
    imports: [
        
    CommonModule,
    FormsModule,
    RouterModule,
    TagModule,
    ProgressBarModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    CheckboxModule,
    InputNumberModule,
    DialogModule,
    ToastModule,
    TableModule,
    MenuModule ,
    TabViewModule,
    SelectButtonModule,
    MultiSelectModule,
    ChartModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    ChipModule,
    dashModule,
    
],
    exports:[
        GroupListComponent,
        GroupFormComponent,
        GroupAssignComponent,
        GroupScheduleComponent
    ],

    providers:[
         MessageService,
         ConfirmationService
    ]
})
export class groupModule
{

}