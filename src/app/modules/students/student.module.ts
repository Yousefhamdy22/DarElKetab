import { NgModule } from "@angular/core";
import { StudentListComponent } from "./student-list/student-list.component";
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
import { StudentService } from "./student.service";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StudentViewComponent } from "./student-view/student-view.component";
import { StudentFormComponent } from "./student-form/student-form.component";

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
    declarations:[
         StudentListComponent
        , StudentViewComponent
        , StudentFormComponent
        
        
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
  InputTextModule ,
   ChartModule,
   InputMaskModule ,
   PaginatorModule,
   ProgressSpinnerModule,
    BrowserAnimationsModule,
    // exam
    ConfirmDialogModule,
    TabMenuModule,
    ToastModule,
    CheckboxModule,
   
   
    DropdownModule,
    
    TableModule,
    ButtonModule,
    InputTextModule,
    
    DialogModule,
  
   
    InputNumberModule,
    //form 
    ReactiveFormsModule,
    CalendarModule,
    RadioButtonModule,
    FileUploadModule,
    DialogModule
    
    ],
    exports:[
        StudentListComponent ,
        StudentViewComponent,
        
        
    ] ,
    providers:[
        StudentService
        
    ]
})
export class studentModule
{

}