import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register/register.component';
// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { PrimeIcons } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/AuthService.service';
import { AuthGuard, RoleGuard } from './auth.guard';
import { AuthInterceptor } from './auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
@NgModule({
  declarations: [
   LoginComponent,
   RegisterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    CommonModule
    // PrimeIcons
  ],
  exports:[
    LoginComponent,
    RegisterComponent
  ],
  providers: [MessageService,


   
      AuthService,
      AuthGuard,
      RoleGuard,
      MessageService,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ],

  
  
})
export class AuthModule { }