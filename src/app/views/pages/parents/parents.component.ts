import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ParentService } from '../../../services/parent.service';
import { CreateParentDialogComponent } from '../../components/create-parent-dialog/create-parent-dialog.component';
import { ToastService } from '../../../services/toastr.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],
  templateUrl: './parents.component.html',
  styleUrls: ['./parents.component.css'],
})
export class ParentsComponent implements OnInit {
  parentsList = signal<any[]>([]);
  filteredParentsList = signal<any[]>([]);
  isLoading = false;
  search: string = '';
  searchControl = new FormControl('');

  // Pagination
  page: number = 1;
  limit: number = 10;
  totalPages: number = 1;

  constructor(
    private parentService: ParentService,
    private dialog: MatDialog,
    private toast: ToastService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadParents();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        this.onSearchChange();
      });
  }

  loadParents(): void {
    this.isLoading = true;
    this.parentService.getParentsList().subscribe({
      next: (response: any) => {
        const parents = response?.data || response || [];
        this.parentsList.set(parents);
        this.onSearchChange(); // Appliquer le filtre de recherche
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des parents:', error);
        this.toast.showError('Erreur lors du chargement des parents');
        this.isLoading = false;
      },
    });
  }

  onSearchChange(): void {
    const parents = this.parentsList();
    let filtered = parents;

    if (this.search) {
      const searchLower = this.search.toLowerCase();
      filtered = parents.filter((parent: any) => {
        const firstName = (parent.firstName || '').toLowerCase();
        const lastName = (parent.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const email = (parent.email || '').toLowerCase();
        const phone = (parent.phoneNumber || parent.phone || '').toLowerCase();

        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });
    }

    this.updatePagination(filtered);
    this.page = 1;
  }

  updatePagination(items: any[]): void {
    this.totalPages = Math.ceil(items.length / this.limit);
    const startIndex = (this.page - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.filteredParentsList.set(items.slice(startIndex, endIndex));
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.onSearchChange();
    }
  }

  openCreateParentDialog(parent?: any): void {
    const dialogRef = this.dialog.open(CreateParentDialogComponent, {
      width: '100%',
      maxWidth: '700px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: parent ? { parent } : {},
    });

    dialogRef.componentInstance.parentCreated.subscribe(() => {
      this.loadParents();
    });
  }

  getParentName(parent: any): string {
    if (parent.firstName && parent.lastName) {
      return `${parent.firstName} ${parent.lastName}`;
    }
    // Fallback pour compatibilité avec ancien format
    return parent.fullName || parent.full_name || parent.name || 'Sans nom';
  }

  getStudentsCount(parent: any): number {
    // Nouveau format : studentsCount est directement un nombre
    if (parent.studentsCount !== undefined && parent.studentsCount !== null) {
      return parent.studentsCount;
    }
    // Fallback pour compatibilité avec ancien format
    if (parent.students && Array.isArray(parent.students)) {
      return parent.students.length;
    }
    return 0;
  }

  hasPlatformAccess(parent: any): boolean {
    // Nouveau format : platformAccess
    if (parent.platformAccess !== undefined) {
      return parent.platformAccess;
    }
    // Fallback pour compatibilité avec ancien format
    return parent.hasAccount || false;
  }

  goToParentDetail(parentId: string): void {
    this.router.navigate(['/parents', parentId]);
  }

  editParent(parent: any): void {
    this.openCreateParentDialog(parent);
  }

  deleteParent(parentId: string, parentName: string): void {
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer le parent "${parentName}" ?`)
    ) {
      this.parentService.deleteParent(parentId).subscribe({
        next: () => {
          this.toast.showSuccess('Parent supprimé avec succès');
          this.loadParents();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toast.showError('Erreur lors de la suppression du parent');
        },
      });
    }
  }
}
