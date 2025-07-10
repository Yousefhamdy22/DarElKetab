import { NgModule } from "@angular/core";

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from "primeng/chart";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { InputMaskModule } from 'primeng/inputmask';
import { PaginatorModule } from 'primeng/paginator';
import { ExamComponent } from "./exam/exam.component";
import { ExamResulteComponent } from "./exam-resulte/exam-resulte.component";
import { SkeletonModule } from 'primeng/skeleton';
import { PickListModule } from 'primeng/picklist';
@NgModule({
    declarations: [
        ExamComponent,
        ExamResulteComponent
              

    ],

    imports: [
        CommonModule,
        ReactiveFormsModule,
        ConfirmDialogModule,
        TabMenuModule,
        ToastModule,
        CheckboxModule,
        DropdownModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        TableModule,
        ButtonModule,
        DropdownModule,
        TagModule,
        ProgressBarModule,
        TooltipModule,
        InputTextModule,
        ChartModule,
        InputMaskModule,
        PaginatorModule,
        ProgressSpinnerModule,
        BrowserAnimationsModule,
        CalendarModule,
        InputNumberModule,
        SkeletonModule
       // PickListModule
    ],

    exports: [
        ExamComponent,
        ExamResulteComponent
    ],

    providers: []
})

export class examModule {



}

