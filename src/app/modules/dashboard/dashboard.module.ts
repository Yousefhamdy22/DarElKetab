import { NgModule } from "@angular/core";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { StatsCardsComponent } from "./stats-cards/stats-cards.component";
import { DatePipe } from "@angular/common";

import { CommonModule } from "@angular/common";

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { RouterModule, RouterOutlet } from "@angular/router";
import { SelectButtonModule } from "primeng/selectbutton";
import { TabViewModule } from 'primeng/tabview';
import { RatingModule } from 'primeng/rating';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SidebarComponent } from "./dashboard/sidebar/sidebar.component";
@NgModule({
    declarations:[
        DashboardComponent,
        SidebarComponent

    ],
    imports:[
        RouterModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        // PrimeNG Modules
        CardModule,
        ChartModule,
        TableModule,
        ProgressBarModule,
        ButtonModule,
        TimelineModule,
        SelectButtonModule,
        TabViewModule ,
        RatingModule
       
    ],
    exports:[DashboardComponent
       , SidebarComponent
        

    ],
    providers:[DatePipe]
})
export class dashModule
{

}