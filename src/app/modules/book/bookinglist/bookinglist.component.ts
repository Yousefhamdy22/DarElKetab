import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingService } from '../book.service';
import type { Booking, BookingStatus, UpdateBookingRequest } from '../book.models';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-bookinglist',
  standalone: false,
  templateUrl: './bookinglist.component.html',
  styleUrl: './bookinglist.component.css'
})
export class BookinglistComponent {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  searchTerm = '';
  statusFilter = '';
  sortField = 'date';
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;
  isLoading!:boolean;

  selectedBooking: Booking | null = null;
  showViewModal = false;
  showEditModal = false;

  editForm: UpdateBookingRequest = {
    teacherId: 0,
    groupId: 0,
    date: '',
    groupTime: '',
    timeSlot: '',
    status: 'Pending',
    notes: '',
    fees: 0,
    paidAmount: 0
  };
  
  statusOptions = [
    { label: 'جميع الحالات', value: '' },
    { label: 'مؤكد', value: 'confirmed' },
    { label: 'في الانتظار', value: 'pending' },
    { label: 'ملغي', value: 'cancelled' },
    { label: 'مكتمل', value: 'completed' }
  ];

  sortOptions = [
    { label: 'التاريخ (الأحدث)', value: 'date' },
    { label: 'اسم الطالب', value: 'student' },
    { label: 'اسم المعلم', value: 'teacher' },
    { label: 'المادة', value: 'subject' },
    { label: 'الحالة', value: 'status' }
  ];

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  // loadBookings() {
  //   this.isLoading = true;
  //   this.bookingService.getBookings().subscribe({
  //     next: (response: Booking[]) => {
  //       console.log('API Response:', response);
        
  //       // Handle the response data
  //       this.bookings = response || [];
        
  //       // Create a copy for filtering
  //       this.filteredBookings = [...this.bookings];
        
  //       // Apply any existing filters
  //       this.applyFilters();
        
  //       // Update pagination
  //      // this.updatePagination();
        
  //       this.isLoading = false;
        
  //       console.log('Loaded bookings:', this.bookings.length);
  //     },
  //     error: (error) => {
  //       console.error('Error loading bookings:', error);
  //       this.isLoading = false;
        
  //       // Handle error - show user-friendly message
  //       this.showErrorMessage('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
        
  //       // Initialize empty arrays to prevent template errors
  //       this.bookings = [];
  //       this.filteredBookings = [];
  //      // this.paginatedBookings = [];
  //     },
  //     complete: () => {
  //       console.log('Loading bookings completed');
  //     }
  //   });
  // }
  loadBookings() {
    this.isLoading = true;
    // Your API call here
    this.bookingService.getBookings().subscribe({
      next: (response) => {
        this.bookings = response; // Use response directly
        this.filteredBookings = [...this.bookings];
      //  this.updatePaginatedBookings();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    });
  }

  updateBooking() {
    if (!this.selectedBooking) return;

    this.bookingService.updateBooking(this.selectedBooking.id, {
      ...this.editForm,
      teacherId: this.editForm.teacherId.toString(),
      groupId: this.editForm.groupId.toString(),
    } as any).subscribe({
      next: (response) => {
        console.log('Booking updated successfully:', response);
        this.closeEditModal();
        this.loadBookings(); // Reload to get fresh data
        // You can add success toast notification here
      },
      error: (error) => {
        console.error('Error updating booking:', error);
        // You can add error toast notification here
      }
    });
  }

  deleteBooking(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      this.bookingService.deleteBooking(id).subscribe({
        next: (response) => {
          console.log('Booking deleted successfully');
          this.loadBookings(); // Reload to refresh the list
          // You can add success toast notification here
        },
        error: (error) => {
          console.error('Error deleting booking:', error);
          // You can add error toast notification here
        }
      });
    }
  }
  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '0 جنيه';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Helper Methods
  getInitials(name: string): string {
    if (!name || name === 'غير محدد') return '؟';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  showNotes(booking: Booking) {
    // You can implement a modal, alert, or any UI to show the notes.
    alert(booking.notes);
  }
  // getInitials(name: string): string {
  //   return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  // }

  getStatusConfig(status: string) {
    const configs = {
      confirmed: { 
        label: 'مؤكد', 
        bgClass: 'bg-green-100', 
        textClass: 'text-green-800',
        iconClass: 'text-green-600',
        icon: 'pi-check-circle'
      },
      pending: { 
        label: 'في الانتظار', 
        bgClass: 'bg-yellow-100', 
        textClass: 'text-yellow-800',
        iconClass: 'text-yellow-600',
        icon: 'pi-clock'
      },
      cancelled: { 
        label: 'ملغي', 
        bgClass: 'bg-red-100', 
        textClass: 'text-red-800',
        iconClass: 'text-red-600',
        icon: 'pi-times-circle'
      },
      completed: { 
        label: 'مكتمل', 
        bgClass: 'bg-blue-100', 
        textClass: 'text-blue-800',
        iconClass: 'text-blue-600',
        icon: 'pi-check'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  }
  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message,
      life: 5000
    });
  }
  onSearch() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }
  handleNewBooking() {
    this.addNewBooking();  // Execute your function
    this.router.navigate(['/bookingnew']);  // Then navigate
  }
  applyFilters() {
    let filtered = [...this.bookings];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.student?.name.toLowerCase().includes(term) ||
        booking.teacher?.name.toLowerCase().includes(term) ||
       
        booking.student?.studentID.toString().includes(term)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(booking => booking.status === this.statusFilter as BookingStatus);
    }

    // Sort
    // filtered.sort((a, b) => {
    //   switch (this.sortField) {
    //     case 'student':
    //       return a.student?.name.localeCompare(b.student.name, 'ar');
    //     case 'teacher':
    //       return a.teacher.name.localeCompare(b.teacher.name, 'ar');
       
    //     case 'status':
    //       return a.status.localeCompare(b.status);
    //     case 'date':
    //     default:
    //       return new Date(b.date).getTime() - new Date(a.date).getTime();
    //   }
    // });

    this.filteredBookings = filtered;
    this.currentPage = 1;
  }

  // onStatusChange(booking: Booking, newStatus: string) {
  //   const oldStatus = booking.status;
  //   booking.status = newStatus as BookingStatus;
    
  //   // Here you would typically call a service to update the booking
  //   console.log(`Status changed from ${oldStatus} to ${newStatus} for booking ${booking.id}`);
    
  //   // Show success message
  //   this.showToast('تم تحديث حالة الحجز بنجاح', 'success');
  // }
  onStatusChange(booking: Booking, newStatus: string) {
    const originalStatus = booking.status;
    booking.status = newStatus as any;

    // Create update request with current booking data
    const updateRequest: UpdateBookingRequest = {
      teacherId: booking.teacherId,
      groupId: booking.groupId,
      date: booking.date || booking.bookingDate,
      groupTime: booking.groupTime,
      timeSlot: booking.timeSlot,
      status: newStatus as any,
      notes: booking.notes,
      fees: booking.fees,
      paidAmount: booking.paidAmount
    };

    this.bookingService.updateBooking(booking.id, {
      ...updateRequest,
      teacherId: booking.teacherId.toString(),
      groupId: booking.groupId.toString(),
    } as any).subscribe({
      next: (response) => {
        console.log('Status updated successfully');
        // You can add success toast notification here
      },
      error: (error) => {
        console.error('Error updating status:', error);
        booking.status = originalStatus; // Revert on error
        // You can add error toast notification here
      }
    });
  }

  onView(booking: Booking) {
    this.selectedBooking = booking;
    this.showViewModal = true;
  }

  onEdit(booking: Booking) {
    this.selectedBooking = booking;
    // Populate edit form with current booking data
    this.editForm = {
      teacherId: booking.teacherId,
      groupId: booking.groupId,
      date: this.formatDateForInput((booking.date || booking.bookingDate)?.toString()),
      groupTime: booking.groupTime || '',
      timeSlot: booking.timeSlot || '',
      status: booking.status,
      notes: booking.notes || '',
      fees: booking.fees || 0,
      paidAmount: booking.paidAmount || 0
    };
    this.showEditModal = true;
  }

  // onDelete(booking: Booking) {
  //   this.deleteBooking(booking.id);
  // }


  // onEdit(booking: Booking) {
  //   this.router.navigate(['/booking/edit', booking.id]);
  // }

  onDelete(booking: Booking) {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      this.bookings = this.bookings.filter(b => b.id !== booking.id);
      this.applyFilters();
      this.showToast('تم حذف الحجز بنجاح', 'success');
    }
  }

  // onView(booking: Booking) {
  //   // Implement view logic
  //   console.log('View booking:', booking);
  // }
  resetEditForm() {
    this.editForm = {
      teacherId: 0,
      groupId: 0,
      date: '',
      groupTime: '',
      timeSlot: '',
      status: 'Pending',
      notes: '',
      fees: 0,
      paidAmount: 0
    };
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Format for datetime-local input
    } catch {
      return '';
    }
  }

  addNewBooking() {
    this.router.navigate(['/booking/new']);
  }

  exportData() {
    // Implement export logic
    console.log('Export data');
    this.showToast('سيتم تصدير البيانات قريباً', 'info');
  }

  refreshData() {
    this.loadBookings();
    this.showToast('تم تحديث البيانات', 'success');
  }

  // Pagination
  get paginatedBookings() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredBookings.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredBookings.length / this.itemsPerPage);
  }

  get pageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get confirmedBookings() {
    return this.bookings.filter(b => b.status === 'confirmed' as BookingStatus).length;
  }

  get pendingBookings() {
    return this.bookings.filter(b => b.status === 'pending' as BookingStatus).length;
  }

  get cancelledBookings() {
    return this.bookings.filter(b => b.status === 'cancelled' as BookingStatus).length;
  }

  get totalBookings() {
    return this.bookings.length;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'info') {
    // Implement toast notification
    console.log(`${type}: ${message}`);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private showErrorMessage(message: string) {
    // You can use a toast, snackbar, or alert as needed
    alert(message);
  }

  // Add modal control methods
  closeEditModal() {
    this.showEditModal = false;
  }

  closeViewModal() {
    this.showViewModal = false;
  }

  editFromView() {
    if (this.selectedBooking) {
      this.onEdit(this.selectedBooking);
      this.showViewModal = false;
    }
  }
}
