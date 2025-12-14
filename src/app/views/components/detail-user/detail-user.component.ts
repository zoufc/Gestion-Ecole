import { Component, OnInit, signal, computed, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { NgClass, NgIf, NgFor, NgForOf, CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';
// import { Validators } from 'ngx-editor';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-detail-user',
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.css'],
  imports: [NgIf, NgClass, RouterLink, NgFor, NgForOf,CommonModule, ReactiveFormsModule, NgxSpinnerModule],
})
export class DetailUserComponent implements OnInit {
  userId: string | null = null;
  user = signal<any>(null);
  
  status: boolean = false;
  actualPage: number = 1;
  data: any;
  actualLimit = 5;
  totalPages!: number;
  isDropdownOpen = false;
  createUserForm: FormGroup;
  isEditing = false;
  currentUserId: number | null = null;
  paymentStats = signal<any>(null);
  isLoadingPaymentStats = false;
  gradeStats = signal<any>(null);
  isLoadingGradeStats = false;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  deleteUser(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.deleteUser(userId).subscribe(
          () => {
            console.log('Utilisateur supprimé avec succès');
          },
          (error) => {
            console.error(
              "Erreur lors de la suppression de l'utilisateur :",
              error
            );
          }
        );
      }
    });
  }

  // openEditUserDialog(user: any): void {
  //   const dialogRef = this.dialog.open(CreateUserDialogComponent, {
  //     panelClass: 'custom-dialog',
  //     data: {
  //       user: user,
  //       isEditing: true,
  //       currentUserId: this.user.id,
        
  //     },
  //   });
  //   console.log('current',this.currentUserId);
  //   // console.log();
    
  //   this.isDropdownOpen = false;

  //   dialogRef.componentInstance.userUpdated.subscribe(() => {
  //     this.loadUserDetails(user.id);
  //   });
  // }


  openEditUserDialog(user: any): void {
    if (!user) {
      console.error('User data is not available');
      return;
    }
  
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      panelClass: 'custom-dialog',
      data: {
        user: user.data,
        
        isEditing: true,
        currentUserId: user.data.id, 
      },
    });
    console.log('user.user.data',user.data.id);
  console.log(this.currentUserId);
  
    dialogRef.componentInstance.userUpdated.subscribe(() => {
      this.loadUserDetails(user.data.id);
      console.log( 'this.loadUserDetails(user.id)',this.loadUserDetails(user.data.id) );
      this.isDropdownOpen=false;
    });
  }
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private mockData: MockDataService
  ) {
    this.createUserForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      roles: [''],
      poste: ['', Validators.required],
      max_appointments_per_day: [1, [Validators.required, Validators.min(1)]],
      status: ['actif'],
    });
    // this.isEditing = this.data.isEditing;
    // this.currentUserId = this.data.currentUserId;
  }
  // ngOnInit(): void {
  //   this.userId = this.route.snapshot.paramMap.get('id');
  //   if (this.userId) {
  //     this.loadUserDetails(+this.userId);
  //     this.isEditing = this.data.isEditing || false;
  //     this.currentUserId = this.data.currentUserId || null;
  //   }
    
  // }

  // loadUserDetails(userId: number): void {
  //   this.userService.getUserById(userId).subscribe(
  //     (data) => {
  //       this.user = data;
  //       console.log('User details:', this.user);
  //     },
  //     (error) => {
  //       console.error('Error fetching user details:', error);
  //     }
  //   );
  // }



  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUserDetails(+this.userId);
    }
  }
  
  loadUserDetails(userId: number): void {
    this.userService.getUserById(userId).subscribe(
      (data) => {
        this.user.set(data);
        console.log('User details:', this.user);
        // Charger les statistiques de paiement pour cet élève
        this.loadPaymentStatistics(userId);
        // Charger les statistiques de notes pour cet élève
        this.loadGradeStatistics(userId);
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  loadPaymentStatistics(studentId: number): void {
    this.isLoadingPaymentStats = true;
    this.mockData.getPaymentStatistics(studentId).subscribe({
      next: (response: any) => {
        this.paymentStats.set(response.data);
        this.isLoadingPaymentStats = false;
      },
      error: (error) => {
        console.error('Error fetching payment statistics:', error);
        this.isLoadingPaymentStats = false;
      },
    });
  }

  loadGradeStatistics(studentId: number): void {
    this.isLoadingGradeStats = true;
    this.mockData.getGradeStatistics(studentId).subscribe({
      next: (response: any) => {
        this.gradeStats.set(response.data);
        this.isLoadingGradeStats = false;
      },
      error: (error) => {
        console.error('Error fetching grade statistics:', error);
        this.isLoadingGradeStats = false;
      },
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getMonthLabel(month: string): string {
    if (!month) return '-';
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  }

  getSubjectStats(): any[] {
    if (!this.gradeStats()?.bySubject) return [];
    return Object.keys(this.gradeStats()?.bySubject).map((name) => ({
      name,
      ...this.gradeStats()?.bySubject[name],
    }));
  }

  getGradeClass(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }

  toggleUserStatus(userId: number): void {
    if (this.user) {
      this.user().data.status = !this.user().data.status;
      this.userService.getUserById(userId).subscribe(
        (data) => {
          this.status = data.statut;
          console.log('User details:', this.user);
        },
        (error) => {
          console.error('Error fetching user details:', error);
        }
      );
    }
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.actualPage = page;
      // this.getUsersList(page, this.actualLimit);
    }
  }
}
