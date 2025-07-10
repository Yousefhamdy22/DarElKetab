import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'teacher';
  name: string;
  specialty?: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  // Mock users for demonstration
  mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@quran-center.com',
      role: 'admin',
      name: 'مدير النظام'
    },
    {
      id: 2,
      username: 'khalid.teacher',
      email: 'khalid@quran-center.com',
      role: 'teacher',
      name: 'خالد العبدالله',
      specialty: 'الحفظ المتقدم'
    },
    {
      id: 3,
      username: 'mohammed.teacher',
      email: 'mohammed@quran-center.com',
      role: 'teacher',
      name: 'محمد السالم',
      specialty: 'المستوى المتوسط'
    },
    {
      id: 4,
      username: 'ahmed.teacher',
      email: 'ahmed@quran-center.com',
      role: 'teacher',
      name: 'أحمد الزهراني',
      specialty: 'المبتدئين'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.redirectBasedOnRole(currentUser.role);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password, rememberMe } = this.loginForm.value;

      // Simulate API call
      setTimeout(() => {
        const user = this.authenticateUser(username, password);
        
        if (user) {
          // Store user data
          this.storeUserData(user, rememberMe);
          
          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'تم تسجيل الدخول بنجاح',
            detail: `مرحباً ${user.name}`
          });

          // Redirect based on role
          setTimeout(() => {
            this.redirectBasedOnRole(user.role);
          }, 1000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ في تسجيل الدخول',
            detail: 'اسم المستخدم أو كلمة المرور غير صحيحة'
          });
        }
        
        this.loading = false;
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  authenticateUser(username: string, password: string): User | null {
    // Mock authentication - In real app, this would be an API call
    const user = this.mockUsers.find(u => u.username === username);
    
    // Simple password check (in real app, this would be handled by backend)
    if (user && password === '123456') {
      return user;
    }
    
    return null;
  }

  storeUserData(user: User, rememberMe: boolean) {
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      specialty: user.specialty,
      loginTime: new Date().toISOString()
    };

    if (rememberMe) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
    }
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  redirectBasedOnRole(role: 'admin' | 'teacher') {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'teacher':
        this.router.navigate(['/teacher/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Quick login methods for demo
  loginAsAdmin() {
    this.loginForm.patchValue({
      username: 'admin',
      password: '123456'
    });
  }

  loginAsTeacher() {
    this.loginForm.patchValue({
      username: 'khalid.teacher',
      password: '123456'
    });
  }

  // Getters for form validation
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
