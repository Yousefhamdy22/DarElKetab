import { Component, OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators, type FormControl } from "@angular/forms"
import { ActivatedRoute } from "@angular/router"
import { GroupService } from '../group.service';
import { Group } from '../group.models';

interface DropdownOption {
  label: string
  value: string
}

interface WeekDay {
  label: string
  value: string
}

@Component({
  selector: 'app-group-form',
  standalone: false,
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.css'
})
export class GroupFormComponent implements OnInit {
  groupForm!: FormGroup
  isEditMode = false
  submitted = false
  showSuccessDialog = false

  groups: Group[] = []
  filteredGroups: Group[] = []
 

  teacherOptions: DropdownOption[] = [
    { label: "الأستاذ عبدالله محمد", value: "الأستاذ عبدالله محمد" },
    { label: "الأستاذ خالد أحمد", value: "الأستاذ خالد أحمد" },
    { label: "الأستاذ محمد علي", value: "الأستاذ محمد علي" },
    { label: "الأستاذ أحمد إبراهيم", value: "الأستاذ أحمد إبراهيم" },
    { label: "الأستاذة سارة محمد", value: "الأستاذة سارة محمد" },
    { label: "الأستاذ عمر خالد", value: "الأستاذ عمر خالد" },
  ]

  locationOptions: DropdownOption[] = [
    { label: "قاعة 1 - الطابق الأول", value: "قاعة 1 - الطابق الأول" },
    { label: "قاعة 2 - الطابق الأول", value: "قاعة 2 - الطابق الأول" },
    { label: "قاعة 3 - الطابق الثاني", value: "قاعة 3 - الطابق الثاني" },
    { label: "قاعة 4 - الطابق الثاني", value: "قاعة 4 - الطابق الثاني" },
    { label: "قاعة 5 - الطابق الأول", value: "قاعة 5 - الطابق الأول" },
  ]

  levelOptions: DropdownOption[] = [
    { label: "المستوى الأول (مبتدئ)", value: "beginner" },
    { label: "المستوى الثاني (متوسط)", value: "intermediate" },
    { label: "المستوى الثالث (متقدم)", value: "advanced" },
  ]

  focusAreaOptions: DropdownOption[] = [
    { label: "حفظ القرآن", value: "memorization" },
    { label: "التجويد", value: "tajweed" },
    { label: "التفسير", value: "tafsir" },
    { label: "القراءات", value: "qiraat" },
  ]

  weekDays: WeekDay[] = [
    { label: "الأحد", value: "sunday" },
    { label: "الإثنين", value: "monday" },
    { label: "الثلاثاء", value: "tuesday" },
    { label: "الأربعاء", value: "wednesday" },
    { label: "الخميس", value: "thursday" },
    { label: "الجمعة", value: "friday" },
    { label: "السبت", value: "saturday" },
  ]

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private groupService: GroupService,
  ) {}

  ngOnInit() {
    this.initForm()
    this.loadGruops()

    // Check if we're in edit mode by looking for an ID parameter
    const groupId = this.route.snapshot.paramMap.get("id")
    if (groupId) {
      this.isEditMode = true
      this.loadGroupData(groupId)
    }
  }

  initForm() {
    this.groupForm = this.fb.group({
      id: [{ value: "", disabled: true }],
      name: ["", Validators.required],
      description: [""],
      teacher: ["", Validators.required],
      location: ["", Validators.required],
      maxStudents: [20, [Validators.required, Validators.min(1), Validators.max(50)]],
      active: [true],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      level: ["", Validators.required],
      focusArea: ["", Validators.required],
      curriculumNotes: [""],
      // Days of the week as separate form controls
      sunday: [false],
      monday: [false],
      tuesday: [false],
      wednesday: [false],
      thursday: [false],
      friday: [false],
      saturday: [false],
    })
  }

    loadGruops() {
       this.groupService.getGroups().subscribe((data) => {
      (data: Group[]) => {
        this.groups = data;
      
      }})
        
     }
   

     
  loadGroupData(groupId: string) {
    // In a real application, you would fetch the group data from your API
    // For this example, we'll use mock data
    const mockGroup = {
      id: groupId,
      name: "مجموعة حفظ القرآن - المستوى الأول",
      description: "مجموعة لحفظ القرآن للمبتدئين",
      teacher: "الأستاذ عبدالله محمد",
      location: "قاعة 1 - الطابق الأول",
      maxStudents: 20,
      active: true,
      startTime: new Date(2023, 0, 1, 16, 0), // 4:00 PM
      endTime: new Date(2023, 0, 1, 18, 0), // 6:00 PM
      level: "beginner",
      focusArea: "memorization",
      curriculumNotes: "التركيز على حفظ الجزء الثلاثين وتعلم أساسيات التجويد",
      sunday: true,
      tuesday: true,
      monday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    }

    this.groupForm.patchValue(mockGroup)
  }

  get f() {
    return this.groupForm.controls
  }

  getFormControl(name: string): FormControl {
    return this.groupForm.get(name) as FormControl
  }

  isAnyDaySelected(): boolean {
    return (
      this.groupForm.get("sunday")?.value ||
      this.groupForm.get("monday")?.value ||
      this.groupForm.get("tuesday")?.value ||
      this.groupForm.get("wednesday")?.value ||
      this.groupForm.get("thursday")?.value ||
      this.groupForm.get("friday")?.value ||
      this.groupForm.get("saturday")?.value
    )
  }

  onSubmit() {
    this.submitted = true

    if (this.groupForm.invalid || !this.isAnyDaySelected()) {
      // Scroll to the first invalid field
      const firstInvalidElement = document.querySelector(".ng-invalid")
      if (firstInvalidElement) {
        firstInvalidElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    // Form is valid, proceed with submission
    console.log("Form submitted:", this.groupForm.getRawValue())

    // Show success dialog
    this.showSuccessDialog = true
  }

  addAnotherGroup() {
    this.submitted = false
    this.showSuccessDialog = false
    this.groupForm.reset()
    this.groupForm.patchValue({
      active: true,
      maxStudents: 20,
    })
  }
}
