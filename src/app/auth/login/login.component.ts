import { Component, OnInit , OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/AuthService.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.loading = false;
          
          this.messageService.add({
            severity: 'success',
            summary: 'تم تسجيل الدخول',
            detail: `مرحباً بعودتك ${response.user.name}!`
          });

          // Redirect based on user role
          this.redirectBasedOnRole();
        },
        error: (error) => {
          this.loading = false;
          console.error('Login failed:', error);
          
          // Handle different error scenarios
          let errorDetail = 'حدث خطأ أثناء محاولة تسجيل الدخول';
          
          if (error.status === 401) {
            errorDetail = 'بيانات الدخول غير صحيحة';
          } else if (error.status === 404) {
            errorDetail = 'المستخدم غير موجود';
          } else if (error.status === 403) {
            errorDetail = 'الحساب غير مفعل أو محظور';
          } else if (error.status === 0) {
            errorDetail = 'تعذر الاتصال بالخادم';
          }

          this.errorMessage = errorDetail;
          
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ في تسجيل الدخول',
            detail: errorDetail
          });
        }
      });
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    switch (user.role) {
      case 'admin':
        this.router.navigate(['/dashboard']);
        break;
      case 'teacher':
        this.router.navigate(['/teacher-dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for template
  get username() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // Check if field has error and is touched
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.loginForm.get(fieldName);
    if (!field) return false;
    
    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  // Get error message for field
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return fieldName === 'username' ? 'اسم المستخدم مطلوب' : 'كلمة المرور مطلوبة';
    }
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return fieldName === 'username' 
        ? `اسم المستخدم يجب أن يكون ${requiredLength} أحرف على الأقل`
        : `كلمة المرور يجب أن تكون ${requiredLength} أحرف على الأقل`;
    }
    return '';
  }
}