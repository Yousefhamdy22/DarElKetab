// booking-card.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { BookingService } from '../book.service';
import { Booking } from '../book.models';
// import { BookingStatus } from '../book.models';

interface DropdownOption {
  label: string;
  value: string;
}


export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled'
}

@Component({
  selector: 'app-booking-card',
  standalone: false,
  templateUrl: './bookingcard.component.html',
  styleUrls: ['./bookingcard.component.css'],
  providers: [MessageService]
})
export class BookingCardComponent implements OnInit, OnDestroy {
  public BookingStatus = BookingStatus;
  selectedBookingId = '';
  selectedBooking: Booking | null = null;
  currentDate = new Date();
  bookingOptions: DropdownOption[] = [];
  bookings: Booking[] = [];
  isLoading = false;
  isGeneratingPDF = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadBookings();
    this.checkRouteParams();
    this.subscribeToBookingUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBookings() {
    this.isLoading = true;
    
    this.bookingService.getBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.bookings = bookings.filter(b => b.status !== BookingStatus.Cancelled);
          this.updateBookingOptions();
          this.isLoading = false;
          
          // Auto-select first booking if none selected
          if (this.bookings.length > 0 && !this.selectedBookingId) {
            this.selectedBookingId = this.bookings[0].id.toString();
            this.onBookingSelect();
          }
        },
        error: (error) => {
          this.showError('فشل في تحميل الحجوزات');
          console.error('Error loading bookings:', error);
          this.isLoading = false;
        }
      });
  }

  private checkRouteParams() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['bookingId']) {
          this.selectedBookingId = params['bookingId'];
          this.loadSpecificBooking(params['bookingId']);
        }
      });
  }

  private loadSpecificBooking(bookingId: string) {
    this.bookingService.getBookingById(bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking) => {
          this.selectedBooking = booking;
          this.selectedBookingId = booking.id.toString();
          this.bookingService.setSelectedBooking(booking);
        },
        error: (error) => {
          this.showError('فشل في تحميل بيانات الحجز');
          console.error('Error loading specific booking:', error);
        }
      });
  }

  private subscribeToBookingUpdates() {
    this.bookingService.bookings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(bookings => {
        this.bookings = bookings.filter(b => b.status !== BookingStatus.Cancelled);
        this.updateBookingOptions();
      });

    this.bookingService.selectedBooking$
      .pipe(takeUntil(this.destroy$))
      .subscribe(booking => {
        if (booking) {
          this.selectedBooking = booking;
          this.selectedBookingId = booking.id.toString();
        }
      });
  }

  private updateBookingOptions() {
    this.bookingOptions = this.bookings.map(booking => ({
      label: `${booking.student?.name} • ${booking.group?.groupName} • ${this.formatDate(booking.bookingDate.toString()   
      )}`,
      value: booking.id.toString()
    }));
  }

  onBookingSelect() {
    if (!this.selectedBookingId) {
      this.selectedBooking = null;
      return;
    }

    const booking = this.bookings.find(b => b.id.toString() === this.selectedBookingId);
    if (booking) {
      this.selectedBooking = booking;
      this.bookingService.setSelectedBooking(booking);
      
      // Update URL without navigating
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { bookingId: booking.id.toString() },
        queryParamsHandling: 'merge'
      });
    } else {
      this.selectedBooking = null;
    }
  }

  printCard() {
    if (!this.selectedBooking) {
      this.showError('يرجى اختيار حجز لطباعة البطاقة');
      return;
    }
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      this.showError('فشل في فتح نافذة الطباعة');
      return;
    }

    const cardHtml = this.generatePrintableCard();
    
    printWindow.document.write(cardHtml);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };

    this.showSuccess('تم إرسال البطاقة للطباعة');
  }

  async downloadPDF() {
    if (!this.selectedBooking) {
      this.showError('يرجى اختيار حجز لتحميل البطاقة');
      return;
    }

    this.isGeneratingPDF = true;
    
    try {
      // This would integrate with a PDF generation service
      // For now, we'll show a placeholder
      await this.generatePDFPlaceholder();
      this.showSuccess('سيتم إضافة وظيفة تحميل PDF قريباً');
    } catch (error) {
      this.showError('فشل في إنشاء ملف PDF');
      console.error('Error generating PDF:', error);
    } finally {
      this.isGeneratingPDF = false;
    }
  }

  private async generatePDFPlaceholder(): Promise<void> {
    // Simulate PDF generation delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  refreshBookings() {
    this.loadBookings();
    this.showInfo('تم تحديث قائمة الحجوزات');
  }

  navigateToBookingForm() {
    this.router.navigate(['/booking']);
  }

  navigateToBookingList() {
    this.router.navigate(['/bookings']);
  }

  private generatePrintableCard(): string {
    if (!this.selectedBooking) return '';

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>بطاقة حجز - ${this.selectedBooking.student?.name}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        * {
          font-family: 'Cairo', sans-serif;
        }
        
        body {
          direction: rtl;
        }
        
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print-card {
            width: 100% !important;
            height: 100vh !important;
            box-shadow: none !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
        
        @page {
          size: A4;
          margin: 0;
        }
      </style>
    </head>
    <body class="bg-white">
      <div class="print-card w-full max-w-none mx-auto bg-white relative overflow-hidden">
        <!-- Year Badge -->
        <div class="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 font-bold text-lg z-10 rounded shadow-lg">
          ${this.selectedBooking.group?.endDate}
        </div>
        
        <!-- Main Grid Layout -->
        <div class="grid grid-cols-2 min-h-screen">
          <!-- Left Column - Student & Teacher Data -->
          <div class="bg-white p-6 space-y-6">
            <!-- Student Section -->
            <div class="space-y-4">
              <div class="bg-red-500 text-white text-center py-3 font-bold text-lg -mx-6">
                بيانات الطالب
              </div>
              
              <div class="space-y-3">
                <div class="flex border border-gray-300">
                  <div class="bg-blue-500 text-white px-4 py-3 text-sm font-semibold w-32 text-center">
                    اسم الطالب
                  </div>
                  <div class="flex-1 px-4 py-3 bg-gray-50 text-sm font-medium">
                    ${this.selectedBooking.student?.name}
                  </div>
                </div>
                
                <div class="flex border border-gray-300">
                  <div class="bg-blue-500 text-white px-4 py-3 text-sm font-semibold w-32 text-center">
                    الصف
                  </div>
                  <div class="flex-1 px-4 py-3 bg-gray-50 text-sm font-medium">
                    ${this.selectedBooking.student?.name}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Teacher Section -->
            <div class="space-y-4">
              <div class="bg-red-500 text-white text-center py-3 font-bold text-lg -mx-6">
                بيانات المدرس
              </div>
              
              <div class="space-y-3">
                <div class="flex border border-gray-300">
                  <div class="bg-blue-500 text-white px-4 py-3 text-sm font-semibold w-32 text-center">
                    اسم المدرس
                  </div>
                  <div class="flex-1 px-4 py-3 bg-gray-50 text-sm font-medium">
                    ${this.selectedBooking.teacher?.name}
                  </div>
                </div>
                
                <div class="flex border border-gray-300">
                  <div class="bg-blue-500 text-white px-4 py-3 text-sm font-semibold w-32 text-center">
                    محمول
                  </div>
                  <div class="flex-1 px-4 py-3 bg-gray-50 text-sm font-medium">
                    ${this.selectedBooking.teacher?.name}
                  </div>
                </div>
                
                <div class="flex border border-gray-300">
                  <div class="bg-blue-500 text-white px-4 py-3 text-sm font-semibold w-32 text-center">
                    سنسلة
                  </div>
                  <div class="flex-1 px-4 py-3 bg-gray-50 text-sm font-medium">
                    ${this.selectedBooking.teacher?.name}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Special Notes Section -->
            ${this.selectedBooking.notes ? `
            <div class="bg-blue-500 text-white p-4 -mx-6 text-center rounded-none">
              <div class="font-bold mb-2 text-base">ملاحظات خاصة بالمدرس</div>
              <div class="bg-blue-400 p-3 rounded text-sm font-medium">
                ${this.selectedBooking.notes}
              </div>
            </div>
            ` : ''}
            
            <!-- Teacher Address -->
            <div class="bg-blue-500 text-white p-4 -mx-6 text-center rounded-none">
              <div class="font-bold mb-2 text-base">عنوان المدرس</div>
              <div class="bg-blue-400 p-3 rounded text-sm font-medium">
                ${this.selectedBooking.teacher?.name}
              </div>
            </div>
          </div>
          
          <!-- Right Column - Group Data -->
          <div class="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-6 text-white space-y-6">
            <div class="space-y-4">
              <div class="bg-white bg-opacity-20 backdrop-blur-sm text-center py-3 font-bold text-lg -mx-6">
                بيانات المجموعة
              </div>
              
              <div class="space-y-3">
                <div class="flex border border-white border-opacity-30">
                  <div class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-3 text-sm font-semibold w-32 text-center">
                    اليوم
                  </div>
                  <div class="flex-1 px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-sm font-medium">
                    ${this.selectedBooking.group?.schedule}
                  </div>
                </div>
                
                <div class="flex border border-white border-opacity-30">
                  <div class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-3 text-sm font-semibold w-32 text-center">
                    وقت الحصة
                  </div>
                  <div class="flex-1 px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-sm font-medium">
                    ${this.selectedBooking.groupTime}
                  </div>
                </div>
                
                <div class="flex border border-white border-opacity-30">
                  <div class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-3 text-sm font-semibold w-32 text-center">
                    نوع المجموعة
                  </div>
                  <div class="flex-1 px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-sm font-medium">
                    ${this.selectedBooking.group?.active}
                  </div>
                </div>
                
                <div class="flex border border-white border-opacity-30">
                  <div class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-3 text-sm font-semibold w-32 text-center">
                    موعد أول حصة
                  </div>
                  <div class="flex-1 px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-sm font-medium">
                    ${this.formatDate(this.selectedBooking.bookingDate.toString())}
                  </div>
                </div>
                
                <div class="flex border border-white border-opacity-30">
                  <div class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-3 text-sm font-semibold w-32 text-center">
                    مبلغ الحجز
                  </div>
                  <div class="flex-1 px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-sm font-medium">
                    ${this.selectedBooking.fees.toFixed(2)}
                  </div>
                </div>
                
                <div class="flex border border-white border-opacity-30">
                  <div class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-3 text-sm font-semibold w-32 text-center">
                    المبلغ المدفوع
                  </div>
                  <div class="flex-1 px-4 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-sm font-medium">
                    ${this.selectedBooking.paidAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="bg-blue-500 text-white text-center p-4 font-bold">
          <div class="text-base">عزيزي الطالب : يرجى مراجعة بيانات الحجز قبل مغادرة المكتبة</div>
          <div class="text-sm mt-1 opacity-90">مجموعات انتهى الحجز بها - احصائية حسب المجموعة</div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private formatDate(dateString: string): string {
    return this.bookingService.formatDate(dateString);
  }

  private showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'نجح',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message,
      life: 5000
    });
  }

  private showInfo(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'معلومات',
      detail: message,
      life: 3000
    });
  }
}