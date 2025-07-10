import { Component, OnInit  ,OnDestroy } from '@angular/core';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { ActivatedRoute } from "@angular/router"
import { Subject, takeUntil, catchError , of } from "rxjs"
import { StudentService } from '../student.service';

import { GroupService } from '../../groups/group.service';
import { Group } from '../../groups/group.models';
import { Student, StudentPayload } from '../student.model';
import { MessageService } from 'primeng/api';

interface GroupDropdownOption {
  label: string
  value: string
}
@Component({
  selector: 'app-student-form',
  standalone: false,
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.css'
})
export class StudentFormComponent implements OnInit , OnDestroy {
  studentForm!: FormGroup
  isEditMode = false
  loading = false;
  submitted = false
  showSuccessDialog = false
  groups: Group[] = []
  students: Student[] = []
  groupOptions: GroupDropdownOption [] = []
  




  relationOptions: GroupDropdownOption[] = [
    { label: "الأب", value: "father" },
    { label: "الأم", value: "mother" },
    { label: "الأخ", value: "brother" },
    { label: "الأخت", value: "sister" },
    { label: "الجد", value: "grandfather" },
    { label: "الجدة", value: "grandmother" },
    { label: "أخرى", value: "other" },
  ]

  initForm() {
    this.studentForm = this.fb.group({
      id: [{ value: "", disabled: true }],
      name: ["", Validators.required],                // Maps to API's 'Name'
      birthDate: [null, Validators.required],         // Maps to API's 'BirthDate'
      phone: ["", [Validators.required, Validators.pattern(/^05\d{8}$/)]], // Maps to 'PhoneNumber'
      address: [""],                                  // Maps to 'Address'
      gender: ["Male", Validators.required],          // Maps to 'Gender' (fixed case)
      registrationDate: [new Date()],                 // Maps to 'RegistrationDate'
      groupID: [null, Validators.required],           // Maps to 'GroupID' (fixed name)
      egazaCode: [""],                                // Maps to 'EgazaCode'
      isActive: [true]                                // Maps to 'IsActive'
    });
  }
  get f() { 
    return this.studentForm.controls; 
  }

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private messageService: MessageService,
    private groupservice: GroupService,
    private route: ActivatedRoute,
  ) {}
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.initForm()
    this.loadGroups()  
   
    
  }

  createStudent() {
    if (this.studentForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى تعبئة جميع الحقول المطلوبة'
      });
      this.studentForm.markAllAsTouched();
      return;
    }
  
    // Format dates to ISO string
    const birthDate = this.studentForm.value.birthDate 
      ? new Date(this.studentForm.value.birthDate).toISOString() 
      : null;
      
    const registrationDate = this.studentForm.value.registrationDate 
      ? new Date(this.studentForm.value.registrationDate).toISOString()
      : new Date().toISOString();
  
    const payload : StudentPayload = {
      studentID: Number(this.studentForm.getRawValue().id) || 0, // Using getRawValue() for disabled fields
      groupID: Number(this.studentForm.value.groupID),
      name: String(this.studentForm.value.name).trim(),
      birthDate: birthDate ? new Date(birthDate) : undefined,
      gender: String(this.studentForm.value.gender),
      egazaCode: this.studentForm.value.egazaCode || "",
      address: this.studentForm.value.address || "",
      phoneNumber: this.studentForm.value.phone,
      registrationDate: new Date(registrationDate),
     
    };
  
    console.log('API Payload:', payload);
    
    // Add your API call here
    this.studentService.createStudent(payload).subscribe({
      next: (response) => {
        console.log('Student created successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم إنشاء الطالب بنجاح'
        });
        // Reset form or close dialog
      },
      error: (error) => {
        console.error('Error:', error);
        const errorMessage = this.getErrorMessage(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
        });
      }
    });
  }

  private getErrorMessage(error: any): string {
    // Handle different error formats
    if (error?.error?.errors) {
      return Object.entries(error.error.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ');
    }
    return error?.error?.message || error?.message || 'An unknown error occurred';
  }
    
  
  loadGroups() {
    this.groupservice.getGroups()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('Failed to load groups:', err);
          this.groupOptions = [];
          return of([]); // Return empty array to keep stream alive
        })
      )
      .subscribe((response: any) => {
      
      
        const groups = Array.isArray(response) 
          ? response 
          : (response?.data && Array.isArray(response.data)) 
            ? response.data 
            : [];
  
        // Safely transform groups
        this.groupOptions = groups.map((group: any) => ({
          label: group?.groupName || `Group ${group?.groupID || ''}`,
          value: (group?.groupID ?? '').toString()
        }));
  
        // Set initial value if available
        if (this.groupOptions.length > 0 && !this.studentForm.get('group')?.value) {
          this.studentForm.patchValue({
            group: this.groupOptions[0].value
          });
        }
      });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  

  onSubmit() {
    this.submitted = true; // Make sure this property is defined in your class
    
    if (this.studentForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى تعبئة جميع الحقول المطلوبة'
      });
      this.studentForm.markAllAsTouched();
      console.log(this.studentForm.errors)
      console.log(this.studentForm.value)
      return;
     
    }
    
    this.createStudent();
  }
  


  
onCancel() {
  // Reset the form
  this.studentForm.reset();
  this.submitted = false;
  
  
  this.messageService.add({
    severity: 'info',
    summary: 'إلغاء',
    detail: 'تم إلغاء العملية'
  });
}
  

 
  addAnotherStudent() {
    this.submitted = false
    this.showSuccessDialog = false
    this.studentForm.reset()
    this.studentForm.patchValue({
      active: true,
      relation: "father",
    })
  }
}
