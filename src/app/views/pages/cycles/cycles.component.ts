import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { CycleService } from '../../../services/cycle.service';
import { CreateCycleDialogComponent } from '../../components/create-cycle-dialog/create-cycle-dialog.component';
import { ToastService } from '../../../services/toastr.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-cycles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],
  templateUrl: './cycles.component.html',
  styleUrls: ['./cycles.component.css'],
})
export class CyclesComponent implements OnInit {
  cyclesList = signal<any[]>([]);
  isLoading = false;
  search: string = '';
  searchControl = new FormControl('');

  constructor(
    private cycleService: CycleService,
    private dialog: MatDialog,
    private toast: ToastService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCycles();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        this.loadCycles();
      });
  }

  loadCycles(): void {
    this.isLoading = true;
    this.cycleService.getCycles().subscribe({
      next: (response: any) => {
        const cycles = response?.data || response || [];
        let filteredCycles = cycles;

        // Appliquer le filtre de recherche
        if (this.search) {
          const searchLower = this.search.toLowerCase();
          filteredCycles = cycles.filter(
            (cycle: any) =>
              cycle.name?.toLowerCase().includes(searchLower) ||
              cycle.description?.toLowerCase().includes(searchLower)
          );
        }

        this.cyclesList.set(filteredCycles);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cycles:', error);
        this.toast.showError('Erreur lors du chargement des cycles');
        this.isLoading = false;
      },
    });
  }

  openCreateCycleDialog(cycle?: any): void {
    const dialogRef = this.dialog.open(CreateCycleDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: { cycle },
    });

    dialogRef.componentInstance.cycleCreated.subscribe(() => {
      this.loadCycles();
    });
  }

  deleteCycle(cycleId: string, cycleName: string): void {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer le cycle "${cycleName}" ?`
      )
    ) {
      this.spinner.show();
      this.cycleService.deleteCycle(cycleId).subscribe({
        next: () => {
          this.toast.showSuccess('Cycle supprimé avec succès');
          this.loadCycles();
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          const errorMessage =
            error?.error?.message ||
            'Erreur lors de la suppression du cycle';
          this.toast.showError(errorMessage);
          this.spinner.hide();
        },
      });
    }
  }

  editCycle(cycle: any): void {
    this.openCreateCycleDialog(cycle);
  }
}

