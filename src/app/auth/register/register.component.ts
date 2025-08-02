import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/AuthService.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['teacher', Validators.required],
      phoneNumber: ['', [Validators.pattern('^[0-9]*$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  // onSubmit(isUpdate: boolean = false): void {
  //   if (this.registerForm.invalid) {
  //     this.registerForm.markAllAsTouched();
  //     this.showError('Please fill all required fields correctly');
  //     return;
  //   }

  //   this.isLoading = true;
  // this.authService.register(this.registerForm.value).subscribe({
  //   next: () => {
  //     this.handleSuccess(isUpdate);
  //   },
  //   error: (error) => {
  //     this.handleError(error, isUpdate);
  //   }
  // });
  //   const operation = isUpdate 
  //     ? this.authService.update(this.registerForm.value)
  //     : this.authService.register(this.registerForm.value);

  //   operation.subscribe({
  //     next: () => {
  //       this.handleSuccess(isUpdate);
  //     },
  //     error: (error) => {
  //       this.handleError(error, isUpdate);
  //     }
  //   });
  // }


  onSubmit(isUpdate: boolean = false): void {
    // Validate form
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showError('Please fill all required fields correctly');
      return;
    }
  
    this.isLoading = true;
  
    // Prepare form data
    const formData = this.prepareFormData(this.registerForm.value);
  
    // Determine which operation to perform
    const operation = isUpdate 
      ? this.authService.update(formData)
      : this.authService.register(formData);
  
    // Execute the operation
    operation.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.handleSuccess(isUpdate),
      error: (error) => this.handleError(error, isUpdate)
    });
  }
  
  private prepareFormData(formValue: any): any {
    // Transform form data before sending to API
    return {
      ...formValue,
      // Add any necessary transformations here
      phoneNumber: formValue.phoneNumber || null, // Handle optional fields
      // Ensure role is properly formatted
      // role: formValue.role.toUpperCase() 
       role: formValue.role ? formValue.role.toUpperCase() : 'TEACHER'
    };
  }
  
  private handleSuccess(isUpdate: boolean): void {
    const message = isUpdate 
      ? 'Account updated successfully!' 
      : 'Registration successful!';
    // this.showSuccess(message);
    
    // Redirect based on role
    const redirectPath = this.registerForm.value.role === 'admin' 
      ? '/admin/dashboard' 
      : '/teacher/dashboard';
    this.router.navigate([redirectPath]);
  }
  
  private handleError(error: any, isUpdate: boolean): void {
    console.error('Operation error:', error);
    
    const defaultMessage = isUpdate
      ? 'Failed to update account'
      : 'Registration failed';
      
    const errorMessage = error.error?.message || 
                        error.message || 
                        defaultMessage;
    
    this.showError(errorMessage);
  
    // Handle specific error cases
    if (error.status === 409) { // Conflict (duplicate email)
      this.registerForm.get('email')?.setErrors({ duplicate: true });
    }
  }

  //----------
  // private handleSuccess(isUpdate: boolean): void {
  //   this.isLoading = false;
  //   this.messageService.add({
  //     severity: 'success',
  //     summary: 'Success',
  //     detail: isUpdate ? 'Profile updated!' : 'Registration successful!'
  //   });

  //   if (!isUpdate) {
  //     this.registerForm.reset();
  //   }
  // }
  // private handleError(error: Error, isUpdate: boolean): void {
  //   this.isLoading = false;
  //   console.error('API Error:', error);
  //   this.showError(error.message || 
  //     (isUpdate ? 'Update failed' : 'Registration failed'));
  // }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }

}
