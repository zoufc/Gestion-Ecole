import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { SchoolService } from '../../../services/school.service';
import { CreateSchoolDialogComponent } from '../../components/create-school-dialog/create-school-dialog.component';
import { ToastService } from '../../../services/toastr.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.css'],
})
export class SchoolsComponent implements OnInit {
  schoolsList = signal<any[]>([]);
  filteredSchoolsList = signal<any[]>([]);
  isLoading = false;
  search: string = '';
  searchControl = new FormControl('');

  // Pagination
  page: number = 1;
  limit: number = 10;
  totalPages: number = 1;

  constructor(
    private schoolService: SchoolService,
    private dialog: MatDialog,
    private toast: ToastService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadSchools();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        this.onSearchChange();
      });
  }

  loadSchools(): void {
    this.isLoading = true;
    this.schoolService.getSchools().subscribe({
      next: (response: any) => {
        const schools = response?.data || response || [];
        let filteredSchools = schools;

        // Appliquer le filtre de recherche
        if (this.search) {
          const searchLower = this.search.toLowerCase();
          filteredSchools = schools.filter(
            (school: any) =>
              school.name?.toLowerCase().includes(searchLower) ||
              school.address?.toLowerCase().includes(searchLower) ||
              school.director_name?.toLowerCase().includes(searchLower)
          );
        }

        this.schoolsList.set(filteredSchools);
        this.updatePagination(filteredSchools);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des écoles:', error);
        this.toast.showError('Erreur lors du chargement des écoles');
        this.isLoading = false;
      },
    });
  }

  openCreateSchoolDialog(school?: any): void {
    const dialogRef = this.dialog.open(CreateSchoolDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: { school },
    });

    dialogRef.componentInstance.schoolCreated.subscribe(() => {
      this.loadSchools();
    });
  }

  deleteSchool(schoolId: string, schoolName: string): void {
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer l'école "${schoolName}" ?`)
    ) {
      this.spinner.show();
      this.schoolService.deleteSchool(schoolId).subscribe({
        next: () => {
          this.toast.showSuccess('École supprimée avec succès');
          this.loadSchools();
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          const errorMessage =
            error?.error?.message || "Erreur lors de la suppression de l'école";
          this.toast.showError(errorMessage);
          this.spinner.hide();
        },
      });
    }
  }

  editSchool(school: any): void {
    this.openCreateSchoolDialog(school);
  }

  getDirectorName(school: any): string {
    if (school.director_name) {
      return school.director_name;
    }
    if (school.director?.first_name || school.director?.last_name) {
      return `${school.director.first_name || ''} ${
        school.director.last_name || ''
      }`.trim();
    }
    return 'Non assigné';
  }

  updatePagination(schools: any[]): void {
    this.totalPages = Math.ceil(schools.length / this.limit);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.page > this.totalPages) this.page = 1;

    const startIndex = (this.page - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.filteredSchoolsList.set(schools.slice(startIndex, endIndex));
  }

  changePage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.page = pageNumber;
      this.updatePagination(this.schoolsList());
    }
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadSchools();
  }
}
