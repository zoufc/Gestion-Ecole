import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ClassService } from '../../../services/class.service';
import { CreateClassDialogComponent } from '../../components/create-class-dialog/create-class-dialog.component';
import { ToastService } from '../../../services/toastr.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css'],
})
export class ClassesComponent implements OnInit {
  classesList = signal<any[]>([]);
  filteredClassesList = signal<any[]>([]);
  isLoading = false;
  search: string = '';
  searchControl = new FormControl('');

  // Pagination
  page: number = 1;
  limit: number = 10;
  totalPages: number = 1;

  constructor(
    private classService: ClassService,
    private dialog: MatDialog,
    private toast: ToastService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClasses();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        this.onSearchChange();
      });
  }

  loadClasses(): void {
    this.isLoading = true;
    this.classService.getClasses().subscribe({
      next: (response: any) => {
        const classes = response?.data || response || [];
        let filteredClasses = classes;

        // Appliquer le filtre de recherche
        if (this.search) {
          const searchLower = this.search.toLowerCase();
          filteredClasses = classes.filter(
            (classItem: any) =>
              classItem.name?.toLowerCase().includes(searchLower) ||
              classItem.school?.name?.toLowerCase().includes(searchLower) ||
              classItem.cycle?.name?.toLowerCase().includes(searchLower) ||
              this.getTeacherName(classItem)
                ?.toLowerCase()
                .includes(searchLower)
          );
        }

        this.classesList.set(filteredClasses);
        this.updatePagination(filteredClasses);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.toast.showError('Erreur lors du chargement des classes');
        this.isLoading = false;
      },
    });
  }

  openCreateClassDialog(classItem?: any): void {
    const dialogRef = this.dialog.open(CreateClassDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: { class: classItem },
    });

    dialogRef.componentInstance.classCreated.subscribe(() => {
      this.loadClasses();
    });
  }

  deleteClass(classId: string, className: string): void {
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer la classe "${className}" ?`)
    ) {
      this.spinner.show();
      this.classService.deleteClass(classId).subscribe({
        next: () => {
          this.toast.showSuccess('Classe supprimée avec succès');
          this.loadClasses();
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          const errorMessage =
            error?.error?.message ||
            'Erreur lors de la suppression de la classe';
          this.toast.showError(errorMessage);
          this.spinner.hide();
        },
      });
    }
  }

  editClass(classItem: any): void {
    this.openCreateClassDialog(classItem);
  }

  goToClassDetails(classId: string): void {
    this.router.navigate(['/classes', classId]);
  }

  getSchoolName(classItem: any): string {
    if (classItem.school?.name) {
      return classItem.school.name;
    }
    if (typeof classItem.school === 'string') {
      return classItem.school;
    }
    return 'Non assignée';
  }

  getCycleName(classItem: any): string {
    if (classItem.cycle?.name) {
      return classItem.cycle.name;
    }
    if (typeof classItem.cycle === 'string') {
      return classItem.cycle;
    }
    return 'Non assigné';
  }

  getTeacherName(classItem: any): string {
    if (classItem.teacher?.first_name || classItem.teacher?.last_name) {
      return `${classItem.teacher.first_name || ''} ${
        classItem.teacher.last_name || ''
      }`.trim();
    }
    if (classItem.teacher_name) {
      return classItem.teacher_name;
    }
    return 'Non assigné';
  }

  updatePagination(classes: any[]): void {
    this.totalPages = Math.ceil(classes.length / this.limit);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.page > this.totalPages) this.page = 1;

    const startIndex = (this.page - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.filteredClassesList.set(classes.slice(startIndex, endIndex));
  }

  changePage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.page = pageNumber;
      this.updatePagination(this.classesList());
    }
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadClasses();
  }
}
