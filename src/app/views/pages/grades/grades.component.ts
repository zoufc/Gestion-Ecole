import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MockDataService } from '../../../services/mock-data.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StudentGradesDialogComponent } from '../../components/student-grades-dialog/student-grades-dialog.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css'],
})
export class GradesComponent implements OnInit {
  // Vue actuelle: 'classes' ou 'grades'
  currentView: 'classes' | 'grades' = 'classes';
  selectedClass: string = '';
  selectedClassName: string = '';
  
  // Liste des classes
  classesList: any[] = [];
  
  // Notes groupées par élève pour la classe sélectionnée
  gradesByStudent = signal<any[]>([]);
  isLoadingGrades = false;
  
  // Filtres pour les notes
  actualType: string = 'all';
  selectedSubject: string = 'all';
  search: string = '';
  searchControl = new FormControl('');

  // Options pour les filtres
  typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'exam', label: 'Examen' },
    { value: 'homework', label: 'Devoir' },
    { value: 'project', label: 'Projet' },
    { value: 'quiz', label: 'Quiz' },
  ];

  subjectsList: any[] = [];

  constructor(
    private mockData: MockDataService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClasses();
    this.loadSubjects();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        if (this.currentView === 'grades') {
          this.loadClassGrades(this.selectedClass);
        }
      });
  }


  loadSubjects(): void {
    this.mockData.getSubjects().subscribe({
      next: (response: any) => {
        this.subjectsList = response.data || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des matières:', error);
      },
    });
  }

  loadClasses(): void {
    this.mockData.getClasses().subscribe({
      next: (response: any) => {
        this.classesList = response.data || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      },
    });
  }

  selectClass(classItem: any): void {
    this.selectedClass = classItem.name;
    this.selectedClassName = classItem.name;
    this.currentView = 'grades';
    this.loadClassGrades(classItem.name);
  }

  backToClasses(): void {
    this.currentView = 'classes';
    this.selectedClass = '';
    this.selectedClassName = '';
    this.gradesByStudent.set([]);
  }

  loadClassGrades(className: string): void {
    this.isLoadingGrades = true;
    const params: any = {
      class_name: className,
      ...(this.actualType && this.actualType !== 'all' ? { type: this.actualType } : {}),
      ...(this.selectedSubject && this.selectedSubject !== 'all' ? { subject_id: this.selectedSubject } : {}),
      ...(this.search ? { search: this.search } : {}),
    };

    this.mockData.getGrades(params).subscribe({
      next: (response: any) => {
        // Grouper les notes par élève
        const grades = response.data || [];
        const grouped: any = {};
        
        grades.forEach((grade: any) => {
          const studentId = grade.student_id;
          if (!grouped[studentId]) {
            grouped[studentId] = {
              student_id: studentId,
              student_name: grade.student_name,
              student_number: grade.student_number,
              grades: [],
              average: 0,
              totalGrades: 0,
            };
          }
          grouped[studentId].grades.push(grade);
          grouped[studentId].totalGrades += grade.percentage || 0;
        });

        // Calculer les moyennes
        Object.keys(grouped).forEach((studentId) => {
          const student = grouped[studentId];
          student.average = student.grades.length > 0
            ? Math.round(student.totalGrades / student.grades.length)
            : 0;
        });

        // Convertir en tableau et trier par nom
        this.gradesByStudent.set(Object.values(grouped).sort((a: any, b: any) => 
          a.student_name.localeCompare(b.student_name)
        ));
        this.isLoadingGrades = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notes:', error);
        this.isLoadingGrades = false;
      },
    });
  }

  onFilterChange(): void {
    if (this.currentView === 'grades' && this.selectedClass) {
      this.loadClassGrades(this.selectedClass);
    }
  }

  openStudentGradesDialog(student: any): void {
    this.dialog.open(StudentGradesDialogComponent, {
      panelClass: 'custom-dialog-right',
      data: {
        studentId: student.student_id,
        studentName: student.student_name,
      },
      width: '600px',
      maxWidth: '90vw',
      position: {
        right: '0',
        top: '0',
      },
      height: '100vh',
      maxHeight: '100vh',
      hasBackdrop: true,
      disableClose: false,
    });
  }


  getTypeLabel(type: string): string {
    const option = this.typeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'exam':
        return 'bg-red-100 text-red-800';
      case 'homework':
        return 'bg-blue-100 text-blue-800';
      case 'project':
        return 'bg-purple-100 text-purple-800';
      case 'quiz':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getGradeClass(percentage: number): string {
    if (percentage >= 80) return 'text-green-600 font-bold';
    if (percentage >= 60) return 'text-blue-600 font-semibold';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }


  calculatePercentage(value: number, maxValue: number): number {
    return Math.round((value / maxValue) * 100);
  }
}
