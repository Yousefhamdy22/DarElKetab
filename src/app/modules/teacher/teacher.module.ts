import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
  // PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from "primeng/chart";
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TeacherService } from "./teacher.service";
import { TeacherComponent } from "./teacher.component";
import { SessionschedulComponent } from "../sessionschedul/sessionschedul.component";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';
@NgModule({
    declarations:[
   TeacherComponent ,
   SessionschedulComponent
        ],
    imports:[
        CommonModule,
        FormsModule,
        RouterModule,
  // PrimeNG Modules
  TableModule,
  ButtonModule,
  DropdownModule,
  TagModule,
  ProgressBarModule,
  TooltipModule,
  InputTextModule,
  ChartModule,
  BrowserAnimationsModule,
  ToastModule,
  //form 
  ReactiveFormsModule,
  CalendarModule,
  RadioButtonModule,
  DialogModule,
  MenuModule,
  ConfirmDialogModule,
  CheckboxModule ,
  ProgressSpinnerModule,

  InputNumberModule
    
    ],
    exports:[
        TeacherComponent,
        SessionschedulComponent
    
    ] ,
    providers:[TeacherService]
})
export class TeacherModule
{

}