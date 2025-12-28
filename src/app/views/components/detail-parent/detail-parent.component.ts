import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParentService } from '../../../services/parent.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { StudentService } from '../../../services/student.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateParentAccountDialogComponent } from '../create-parent-account-dialog/create-parent-account-dialog.component';
import { ToastService } from '../../../services/toastr.service';

@Component({
  selector: 'app-detail-parent',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule, MatDialogModule],
  templateUrl: './detail-parent.component.html',
  styleUrls: ['./detail-parent.component.css'],
})
export class DetailParentComponent implements OnInit {
  parentId: string | null = null;
  parent = signal<any>(null);
  studentsList = signal<any[]>([]);
  isLoading = false;
  isLoadingStudents = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parentService: ParentService,
    private studentService: StudentService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.parentId = this.route.snapshot.paramMap.get('id');
    if (this.parentId) {
      this.loadParentDetails(this.parentId);
      this.loadParentStudents(this.parentId);
    }
  }

  loadParentDetails(parentId: string): void {
    this.isLoading = true;
    this.parentService.getParentById(parentId).subscribe({
      next: (data: any) => {
        const parentData = data?.data || data;
        this.parent.set(parentData);

        // Si les élèves sont retournés dans les détails du parent, les utiliser
        if (
          parentData &&
          parentData.students &&
          Array.isArray(parentData.students)
        ) {
          this.studentsList.set(parentData.students);
          this.isLoadingStudents = false;
        } else {
          // Sinon, essayer de charger les élèves séparément
          this.loadParentStudents(parentId);
        }

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching parent details:', error);
        this.isLoading = false;
      },
    });
  }

  loadParentStudents(parentId: string): void {
    this.isLoadingStudents = true;
    // Essayer de charger les élèves liés à ce parent via le service student
    // Note: Cela dépend de la structure de votre API backend
    this.studentService.getStudentsList({ parent: parentId }).subscribe({
      next: (response: any) => {
        const students = response?.data || response || [];
        this.studentsList.set(students);
        this.isLoadingStudents = false;
      },
      error: (error: any) => {
        console.error('Error fetching parent students:', error);
        // Si l'API ne supporte pas ce filtre, on laisse la liste vide
        this.studentsList.set([]);
        this.isLoadingStudents = false;
      },
    });
  }

  getParentName(): string {
    const parent = this.parent();
    if (!parent) return '';
    if (parent.firstName && parent.lastName) {
      return `${parent.firstName} ${parent.lastName}`;
    }
    // Fallback pour compatibilité avec ancien format
    return parent.fullName || parent.full_name || parent.name || 'Sans nom';
  }

  hasPlatformAccess(): boolean {
    const parent = this.parent();
    if (!parent) return false;
    if (parent.platformAccess !== undefined) {
      return parent.platformAccess;
    }
    // Fallback pour compatibilité avec ancien format
    return parent.hasAccount || false;
  }

  getStudentName(student: any): string {
    const firstName =
      student.firstName || student.firstname || student.first_name || '';
    const lastName =
      student.lastName || student.lastname || student.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  }

  getClassName(student: any): string {
    if (!student) return '-';
    if (student.class && student.class.name) {
      return student.class.name;
    }
    if (student.class_name) {
      return student.class_name;
    }
    return '-';
  }

  goToStudentDetail(studentId: string): void {
    this.router.navigate(['/students', studentId]);
  }

  getStudentsCount(): number {
    const parent = this.parent();
    // Si on a studentsCount directement, l'utiliser
    if (
      parent &&
      parent.studentsCount !== undefined &&
      parent.studentsCount !== null
    ) {
      return parent.studentsCount;
    }
    // Sinon, utiliser la longueur de la liste des élèves
    return this.studentsList().length;
  }

  openCreateAccountDialog(): void {
    const parent = this.parent();
    if (!parent) return;

    const dialogRef = this.dialog.open(CreateParentAccountDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: { parent },
    });

    dialogRef.componentInstance.accountCreated.subscribe(() => {
      // Recharger les détails du parent après création/mise à jour du compte
      if (this.parentId) {
        this.loadParentDetails(this.parentId);
      }
    });

    dialogRef.componentInstance.accountDeleted.subscribe(() => {
      // Recharger les détails du parent après suppression du compte
      if (this.parentId) {
        this.loadParentDetails(this.parentId);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/parents']);
  }
}
