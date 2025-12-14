import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MockDataService } from '../../../services/mock-data.service';
import { FormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-student-grades-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatDialogModule,
    NgxSkeletonLoaderModule,
  ],
  providers: [DatePipe],
  templateUrl: './student-grades-dialog.component.html',
  styleUrl: './student-grades-dialog.component.css',
})
export class StudentGradesDialogComponent implements OnInit {
  studentId!: number;
  studentName!: string;
  studentGrades = signal<any[]>([]);
  gradeStats = signal<any>(null);
  isLoadingGrades = false;
  isLoadingStats = false;

  constructor(
    private dialogRef: MatDialogRef<StudentGradesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { studentId: number; studentName: string },
    private mockData: MockDataService,
    private datePipe: DatePipe
  ) {
    this.studentId = data.studentId;
    this.studentName = data.studentName;
  }

  ngOnInit(): void {
    this.loadStudentGrades();
    this.loadGradeStatistics();
  }

  loadStudentGrades(): void {
    this.isLoadingGrades = true;
    this.mockData.getStudentGrades(this.studentId).subscribe({
      next: (response: any) => {
        this.studentGrades.set(response.data);
        this.isLoadingGrades = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notes:', error);
        this.isLoadingGrades = false;
      },
    });
  }

  loadGradeStatistics(): void {
    this.isLoadingStats = true;
    this.mockData.getGradeStatistics(this.studentId).subscribe({
      next: (response: any) => {
        this.gradeStats.set(response.data);
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.isLoadingStats = false;
      },
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  calculatePercentage(value: number, maxValue: number): number {
    return Math.round((value / maxValue) * 100);
  }

  getGradeClass(percentage: number): string {
    if (percentage >= 80) return 'text-green-600 font-bold';
    if (percentage >= 60) return 'text-blue-600 font-semibold';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      exam: 'Examen',
      homework: 'Devoir',
      project: 'Projet',
      quiz: 'Quiz',
    };
    return labels[type] || type;
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

  getSubjectStats(): any[] {
    if (!this.gradeStats()?.bySubject) return [];
    return Object.keys(this.gradeStats()?.bySubject).map((name) => ({
      name,
      ...this.gradeStats()?.bySubject[name],
    }));
  }
}

