import { NgModule } from "@angular/core"
// PrimeNG Modules
import { CardModule } from "primeng/card"
import { TabViewModule } from "primeng/tabview"
import { TableModule } from "primeng/table"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { CalendarModule } from "primeng/calendar"
import { InputTextareaModule } from "primeng/inputtextarea"
import { AvatarModule } from "primeng/avatar"
import { TagModule } from "primeng/tag"
import { DividerModule } from "primeng/divider"
import { ToastModule } from "primeng/toast"
import { MessageService } from "primeng/api"
import { BookingComponent } from "./book-form/booking.component"

import { ProgressSpinnerModule } from "primeng/progressspinner";
import { FormsModule, ReactiveFormsModule } from "@angular/forms"

import { CommonModule } from "@angular/common"
import { BookinglistComponent } from "./bookinglist/bookinglist.component"
import { BookingCardComponent } from "./bookingcard/bookingcard.component"

@NgModule({
  declarations: [
         BookingComponent,
         BookinglistComponent,
         BookingCardComponent
        
        ],
       
  imports: [

    FormsModule,
    ReactiveFormsModule,
    CommonModule,

    // PrimeNG Modules
    CardModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputTextareaModule,
    AvatarModule,
    TagModule,
    DividerModule,
    ToastModule,
    ProgressSpinnerModule
    

  ],
  exports:[
    BookingComponent,
         BookinglistComponent,
         BookingCardComponent
  ],
  providers: [MessageService ],

})
export class BookModule {}