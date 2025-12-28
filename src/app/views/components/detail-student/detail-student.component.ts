import {
  Component,
  OnInit,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../services/student.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MockDataService } from '../../../services/mock-data.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { LOGO_CONFIG } from '../../../config/logo.config';
import html2canvas from 'html2canvas';
import { MatDialog } from '@angular/material/dialog';
import { CreatePaymentDialogComponent } from '../create-payment-dialog/create-payment-dialog.component';

@Component({
  selector: 'app-detail-student',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule, QRCodeComponent],
  templateUrl: './detail-student.component.html',
  styleUrls: ['./detail-student.component.css'],
})
export class DetailStudentComponent implements OnInit {
  @ViewChild('badgeElement', { static: false }) badgeElement!: ElementRef;

  studentId: string | null = null;
  student = signal<any>(null);
  isLoading = false;

  paymentStats = signal<any>(null);
  isLoadingPaymentStats = false;
  gradeStats = signal<any>(null);
  isLoadingGradeStats = false;

  logoConfig = LOGO_CONFIG;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private spinner: NgxSpinnerService,
    private mockData: MockDataService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.loadStudentDetails(this.studentId);
    }
  }

  loadStudentDetails(studentId: string): void {
    this.isLoading = true;
    this.studentService.getStudentById(studentId).subscribe({
      next: (data: any) => {
        const studentData = data?.data || data;
        this.student.set(studentData);
        console.log('Student details:', this.student);
        this.isLoading = false;

        // Charger les statistiques de paiement
        this.loadPaymentStatistics(studentId);
        // Charger les statistiques de notes
        this.loadGradeStatistics(studentId);
      },
      error: (error: any) => {
        console.error('Error fetching student details:', error);
        this.isLoading = false;
      },
    });
  }

  loadPaymentStatistics(studentId: string): void {
    this.isLoadingPaymentStats = true;
    this.mockData.getPaymentStatistics(studentId).subscribe({
      next: (response: any) => {
        this.paymentStats.set(response.data);
        this.isLoadingPaymentStats = false;
      },
      error: (error: any) => {
        console.error('Error fetching payment statistics:', error);
        this.isLoadingPaymentStats = false;
      },
    });
  }

  loadGradeStatistics(studentId: string): void {
    this.isLoadingGradeStats = true;
    this.mockData.getGradeStatistics(studentId).subscribe({
      next: (response: any) => {
        this.gradeStats.set(response.data);
        this.isLoadingGradeStats = false;
      },
      error: (error: any) => {
        console.error('Error fetching grade statistics:', error);
        this.isLoadingGradeStats = false;
      },
    });
  }

  getStudentName(): string {
    const student = this.student();
    if (!student) return '';
    const firstName =
      student.firstName || student.firstname || student.first_name || '';
    const lastName =
      student.lastName || student.lastname || student.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  }

  getGenderLabel(): string {
    const student = this.student();
    if (!student) return '';
    const gender = student.gender || '';
    return gender === 'MALE'
      ? 'Masculin'
      : gender === 'FEMALE'
      ? 'Féminin'
      : gender;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getQRCodeData(): string {
    const student = this.student();
    if (!student) return '';

    // Générer le QR code avec les informations de l'élève
    const studentData = {
      id: student._id || student.id || this.studentId,
      studentNumber: student.code || student.student_number || student.studentNumber || '',
      name: this.getStudentName(),
    };

    return JSON.stringify(studentData);
  }

  getStudentNumber(): string {
    const student = this.student();
    return student?.code || student?.studentNumber || student?.student_number || 'Non assigné';
  }

  getParentName(): string {
    const student = this.student();
    if (!student) return 'Non renseigné';
    if (student.parent?.firstName && student.parent?.lastName) {
      return `${student.parent.firstName} ${student.parent.lastName}`;
    }
    // Fallback pour compatibilité avec ancien format
    return student.parentFullName || student.parent_full_name || student.parentName || student.parent_name || 'Non renseigné';
  }

  getParentPhone(): string {
    const student = this.student();
    if (!student) return 'Non renseigné';
    if (student.parent?.phoneNumber) return student.parent.phoneNumber;
    // Fallback pour compatibilité avec ancien format
    return student.parentPhoneNumber || student.parent_phone_number || student.parentPhone || student.parent_phone || 'Non renseigné';
  }

  getParentEmail(): string {
    const student = this.student();
    if (!student) return 'Non renseigné';
    if (student.parent?.email) return student.parent.email;
    // Fallback pour compatibilité avec ancien format
    return student.parentEmail || student.parent_email || 'Non renseigné';
  }

  getSchoolName(): string {
    const student = this.student();
    if (!student) return 'École';

    // Récupérer l'école depuis la classe de l'élève
    const school = student?.class?.school || student?.school || null;
    return school?.name || 'École';
  }

  getSchoolLogo(): string {
    const student = this.student();
    if (!student) return this.logoConfig.main;

    // Récupérer l'école depuis la classe de l'élève
    const school = student?.class?.school || student?.school || null;
    if (school?.logo) {
      // Si le logo est une URL complète ou un chemin relatif
      return school.logo;
    }
    // Sinon utiliser le logo par défaut
    return this.logoConfig.main;
  }

  getQRCodeWidth(): number {
    // Adapter la taille du QR code selon la taille de l'écran
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile
        return 150;
      } else if (width < 1024) {
        // Tablette
        return 175;
      }
    }
    // Desktop
    return 200;
  }

  async downloadBadgeAsPNG(): Promise<void> {
    if (!this.badgeElement) {
      console.error('Badge element not found');
      return;
    }

    try {
      this.spinner.show();

      // Attendre un peu pour s'assurer que le QR code est rendu
      await new Promise((resolve) => setTimeout(resolve, 500));

      const element = this.badgeElement.nativeElement;

      // Utiliser html2canvas pour convertir en canvas puis en PNG
      // Options pour éviter les problèmes avec les couleurs modernes CSS (oklch)
      const canvas = await html2canvas(element, {
        backgroundColor: '#0d3b66',
        scale: 2, // Pour une meilleure qualité
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Supprimer toutes les classes Tailwind qui pourraient utiliser oklch
          // et forcer les styles inline avec des couleurs RGB/hex
          const clonedElement = clonedDoc.querySelector(
            '#badgeElement'
          ) as HTMLElement;
          if (clonedElement) {
            // Fonction récursive pour nettoyer tous les éléments
            const cleanElement = (el: HTMLElement) => {
              // Supprimer toutes les classes qui contiennent des couleurs
              if (el.className && typeof el.className === 'string') {
                const classes = el.className.split(' ').filter((cls) => {
                  // Garder uniquement les classes de layout/sizing qui ne touchent pas aux couleurs
                  return (
                    cls.includes('flex') ||
                    cls.includes('items') ||
                    cls.includes('justify') ||
                    cls.includes('p-') ||
                    cls.includes('m-') ||
                    cls.includes('w-') ||
                    cls.includes('h-') ||
                    cls.includes('text-center') ||
                    cls.includes('font-') ||
                    cls.includes('rounded') ||
                    cls.includes('border') ||
                    cls.includes('max-w') ||
                    cls.includes('break') ||
                    cls.includes('object') ||
                    cls.includes('shrink')
                  );
                });
                el.className = classes.join(' ');
              }

              // Appliquer récursivement
              Array.from(el.children).forEach((child: any) => {
                if (child instanceof HTMLElement) {
                  cleanElement(child);
                }
              });
            };

            cleanElement(clonedElement);

            // Forcer les styles de base sur le conteneur principal avec la couleur primaire
            clonedElement.style.setProperty(
              'background-color',
              '#0d3b66',
              'important'
            );
            clonedElement.style.setProperty(
              'border-color',
              '#0d3b66',
              'important'
            );
            clonedElement.style.setProperty('border-width', '2px', 'important');
            clonedElement.style.setProperty(
              'border-style',
              'solid',
              'important'
            );
            clonedElement.style.setProperty(
              'border-radius',
              '0.5rem',
              'important'
            );

            // Forcer les couleurs de texte en blanc pour le badge
            const allTextElements =
              clonedElement.querySelectorAll('h3, p, strong');
            allTextElements.forEach((el: any) => {
              if (el.tagName === 'H3') {
                el.style.setProperty('color', '#ffffff', 'important');
              } else if (el.tagName === 'P' || el.tagName === 'STRONG') {
                const text = el.textContent || '';
                if (
                  text.includes('N°:') ||
                  text.includes('Non assigné') ||
                  text.includes('Élève')
                ) {
                  el.style.setProperty('color', '#e0e6f1', 'important'); // Couleur primaire-50 pour le texte secondaire
                } else {
                  el.style.setProperty('color', '#ffffff', 'important');
                }
              }
            });
          }
        },
      });

      // Convertir le canvas en blob
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          // Créer un lien de téléchargement
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const studentName = this.getStudentName().replace(/\s+/g, '_');
          link.download = `badge_${studentName}_${this.getStudentNumber()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
        this.spinner.hide();
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading badge:', error);
      this.spinner.hide();
    }
  }

  printBadge(): void {
    if (!this.badgeElement) {
      console.error('Badge element not found');
      return;
    }

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Unable to open print window');
      return;
    }

    // Cloner l'élément badge
    const badgeClone = this.badgeElement.nativeElement.cloneNode(
      true
    ) as HTMLElement;

    // Appliquer les styles pour l'impression
    const printStyles = `
      <style>
        @media print {
          @page {
            margin: 0;
            size: A4 landscape;
          }
          body {
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
        }
        body {
          font-family: "Public Sans", sans-serif;
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: white;
        }
        #badgePrint {
          background-color: #0d3b66 !important;
          color: #ffffff !important;
          border: 2px solid #0d3b66 !important;
          border-radius: 0.5rem;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 400px;
          width: 100%;
          max-width: 500px;
        }
        #badgePrint h3 {
          color: #ffffff !important;
          font-weight: bold;
        }
        #badgePrint p {
          color: #ffffff !important;
        }
        #badgePrint p strong {
          color: #e0e6f1 !important;
        }
        #badgePrint p:has(strong) {
          color: #e0e6f1 !important;
        }
      </style>
    `;

    // Ajouter un ID au clone pour le cibler avec les styles
    badgeClone.id = 'badgePrint';

    // Ajouter le contenu à la fenêtre d'impression
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Badge Élève - ${this.getStudentName()}</title>
          ${printStyles}
        </head>
        <body>
          ${badgeClone.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Attendre que les images soient chargées avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Fermer la fenêtre après l'impression (optionnel)
        // printWindow.close();
      }, 500);
    };
  }

  openCreatePaymentDialog(): void {
    const student = this.student();
    if (!student) return;

    const studentId = student._id || student.id || this.studentId;

    const dialogRef = this.dialog.open(CreatePaymentDialogComponent, {
      width: '100%',
      maxWidth: '700px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: {
        studentId: studentId,
        // Pré-remplir avec le mois actuel
        month: new Date().toISOString().slice(0, 7), // Format: "2024-12"
      },
    });

    dialogRef.componentInstance.paymentCreated.subscribe(() => {
      // Recharger les statistiques de paiement
      if (this.studentId) {
        this.loadPaymentStatistics(this.studentId);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/students']);
  }
}
