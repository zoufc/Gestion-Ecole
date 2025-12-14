import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { MockDataService } from '../../../services/mock-data.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, Location } from '@angular/common';
import {
  OrganisationCategory,
  CourseStatus,
  UserRoles,
} from '../../../utils/enums';
import { getLocalData } from '../../../utils/local-storage-service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CustomerListComponent } from '../customer-list/customer-list.component';

import Swal from 'sweetalert2';
import { CourseHistoricalListComponent } from '../course-historical-list/course-historical-list.component';
import { AuthService } from '../../../services/auth.service';
import { ShowDocumentDialogComponent } from '../show-document-dialog/show-document-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { CourseNotesListComponent } from '../course-notes-list/course-notes-list.component';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-course-details',
  imports: [NgxEditorModule, FormsModule, CommonModule, NgxSpinnerModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css',
  providers: [DatePipe],
})
export class CourseDetailsComponent {
  appointmentId!: string;
  appointmentDetails!: any;
  appointmentHistoricals!: any;
  isAppointmentLoading!: boolean;
  isUpdatingDescription!: boolean;
  appointmentDescription!: string;

  mediaRecorder!: MediaRecorder;
  audioChunks: Blob[] = [];
  isRecording = false;
  audioBlob!: any;
  audioUrl: string | null = null;
  isPaused: boolean = false;

  appointmentDocuments!: any;

  @ViewChild('dropdown') dropdownRef!: ElementRef;
  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (this.dropdownRef && !this.dropdownRef.nativeElement.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  constructor(
    private dialog: MatDialog,
    private mockData: MockDataService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private location: Location
  ) {
    this.appointmentId = this.route.snapshot.paramMap.get('id')!;
  }
  editor!: Editor;
  htmlContent = '';
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'], // Texte en gras, italique, souligné
    ['text_color', 'background_color'], // Couleurs
    ['ordered_list', 'bullet_list'], // Listes ordonnées et à puces
    ['align_left', 'align_center', 'align_right'], // Alignement du texte
    ['link', 'image'], // Insérer lien et image
    ['code', 'blockquote'], // Citation et code
    ['undo', 'redo'], // Annuler / Rétablir
  ];

  ngOnInit(): void {
    this.getAppointmentDetails(this.appointmentId);
    this.getAppointmentHistoricals(this.appointmentId);
    this.getAppointmentDocuments();
    this.editor = new Editor({
      history: true,
      keyboardShortcuts: true,
    });
  }

  sanitize(htmlString: string) {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  getAppointmentDetails(id: string, isForUpdate?: boolean) {
    if (!isForUpdate) {
      this.isAppointmentLoading = true;
    }
    // Utilisation des données mock
    this.mockData.getCourseById(id).subscribe({
      next: (response: any) => {
        console.log('COURSE DETAILS', response.data);
        this.appointmentDetails = response.data;
        this.appointmentDescription = this.appointmentDetails.description || '';
        this.isAppointmentLoading = false;
      },
      error: (error) => {
        console.log('ERROR', error);
        this.isAppointmentLoading = false;
      },
      complete: () => {
        console.log('Complete');
        this.isAppointmentLoading = false;
      },
    });
    
    // API désactivée - décommenter quand les APIs seront prêtes
    // this.courseService.getCourseById(id).subscribe({...});
  }

  getAppointmentHistoricals(id: string) {
    // Utilisation des données mock
    this.mockData.getCourseHistoricals(id).subscribe({
      next: (response: any) => {
        console.log('COURSE HISTORICALS', response.data);
        this.appointmentHistoricals = response.data.historicals || [];
      },
      error: (error) => {
        console.log('ERROR', error);
        this.appointmentHistoricals = [];
      },
      complete: () => {
        console.log('Complete');
      },
    });
  }

  updateNotes() {
    if (this.htmlContent && this.htmlContent != '') {
      // Simuler la mise à jour des notes
      console.log('Mise à jour des notes du cours:', this.htmlContent);
      this.htmlContent = '';
      this.getAppointmentDetails(this.appointmentId, true);
      // TODO: Implémenter la sauvegarde des notes quand l'API sera prête
    }
  }

  openPostponeRdvDialog() {
    // TODO: Implémenter le report de cours
    console.log('Reporter un cours - À implémenter');
  }

  openConsultantsListDialog() {
    // TODO: Implémenter la gestion des enseignants pour un cours
    console.log('Gérer les enseignants - À implémenter');
  }

  openCustomerListDialog() {
    const dialogRef = this.dialog.open(CustomerListComponent, {
      data: { appointmentId: this.appointmentId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
  }

  openHistoricalsListDialog() {
    const dialogRef = this.dialog.open(CourseHistoricalListComponent, {
      data: { historicals: this.appointmentHistoricals },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
  }

  openNotesListDialog() {
    const dialogRef = this.dialog.open(CourseNotesListComponent, {
      data: { notes: this.appointmentDetails.rdvs_notes },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  isOrganisationProvider(): boolean {
    const category = getLocalData('organisationCategory');
    return category == OrganisationCategory.provider;
  }

  isPending() {
    return (
      this.appointmentDetails?.is_validated &&
      this.appointmentDetails?.status == CourseStatus.scheduled
    );
  }
  isRescheduled() {
    return (
      this.appointmentDetails?.is_validated &&
      this.appointmentDetails?.status == CourseStatus.postponed
    );
  }

  isInProgress() {
    return (
      this.appointmentDetails?.is_validated &&
      this.appointmentDetails?.status == CourseStatus.in_progress
    );
  }

  isFinished() {
    return (
      this.appointmentDetails?.is_validated &&
      this.appointmentDetails?.status == CourseStatus.completed
    );
  }

  isCanceled() {
    return (
      this.appointmentDetails?.is_validated &&
      this.appointmentDetails?.status == CourseStatus.canceled
    );
  }

  isNotValidated() {
    return this.appointmentDetails.is_validated == false;
  }

  canUpdate() {
    return !this.isCanceled() && !this.isFinished() && !this.isInProgress();
  }

  isOwner() {
    const role = this.authService.getUserRole();
    return role == UserRoles.owner;
  }

  isTeacher() {
    const role = this.authService.getUserRole();
    return role == UserRoles.teacher;
  }

  updateAppointment(updateTarget: string) {
    let body!: any;
    let actionMessage!: string;
    switch (updateTarget) {
      case 'validate':
        body = { is_validated: true };
        actionMessage = 'Valider le cours ?';
        break;

      case 'cancel':
        body = { status: CourseStatus.canceled };
        actionMessage = 'Annuler le cours ?';
        break;

      case 'start':
        body = { status: CourseStatus.in_progress };
        actionMessage = 'Démarrer le cours ?';
        break;

      case 'end':
        body = { status: CourseStatus.completed };
        actionMessage = 'Terminer le cours ?';
        break;

      case 'description':
        body = {
          description: this.appointmentDescription,
        };
        actionMessage = 'Enregistrer la description ?';
        break;

      default:
        break;
    }

    Swal.fire({
      title: actionMessage,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FC2828',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        // Simuler la mise à jour
        console.log('Mise à jour du cours:', body);
        if (this.appointmentDetails) {
          this.appointmentDetails = { ...this.appointmentDetails, ...body };
        }
        this.isUpdatingDescription = false;
        // TODO: Implémenter l'appel API quand elle sera prête
        // this.courseService.updateCourse(this.appointmentDetails.id, body).subscribe({...});
      }
    });
  }

  confirmConsultantRescheduled() {
    // TODO: Implémenter le report de cours
    console.log('Report de cours - À implémenter');
  }

  setDescriptionUpdate() {
    this.isUpdatingDescription = !this.isUpdatingDescription;
  }

  getAppointmentDocuments() {
    // Utilisation des données mock
    this.mockData.getCourseDocuments(this.appointmentId).subscribe({
      next: (response: any) => {
        this.appointmentDocuments = response.data || [];
        console.log('DOC RESP', response);
      },
      error: (error) => {
        console.log('ERROR', error);
        this.appointmentDocuments = [];
      },
    });
  }

  downloadDocument(fileUrl: string, fileName: string) {
    fetch(fileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl); // Nettoyage mémoire
      })
      .catch((error) => console.error('Erreur lors du téléchargement:', error));
  }

  downloadAllDocuments() {
    const zip = new JSZip();
    const folder = zip.folder(`Cours ${this.appointmentId}`)!;
    const files = this.appointmentDocuments.map((doc: any) => ({
      name: doc.name,
      url: doc.path,
    }));

    const fetches = files.map((file: any) =>
      fetch(file.url)
        .then((res) => res.blob())
        .then((blob) => folder.file(file.name, blob))
    );

    Promise.all(fetches)
      .then(() => {
        zip.generateAsync({ type: 'blob' }).then((content) => {
          saveAs(content, `Cours ${this.appointmentId}`);
        });
      })
      .catch((err) => {
        console.error('Erreur pendant la création du ZIP :', err);
      });
  }

  // Ouvrir l’explorateur de fichiers
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  selectedFile: File | null = null;
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Récupérer le fichier sélectionné
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];

      Swal.fire({
        title: 'Ajouter ce document?',
        text: `${this.selectedFile.name}`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#FC2828',
        cancelButtonColor: '#9CA3AF',
        confirmButtonText: 'Ajouter',
        cancelButtonText: 'Annuler',
      }).then((result) => {
        if (result.isConfirmed) {
          this.uploadFile();
        }
      });
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    // Simuler l'upload
    console.log('Upload du document:', this.selectedFile.name);
    this.getAppointmentDocuments();
    // TODO: Implémenter l'upload quand l'API sera prête
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/mp4' });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        this.audioChunks = [];
        this.cdr.detectChanges();
        console.log('AUDIO', this.audioBlob);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Erreur lors du démarrage de l’enregistrement', error);
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;
    }
  }

  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }

  saveRdvAudio() {
    // TODO: Implémenter la transcription audio pour les cours
    console.log('Sauvegarde audio du cours - À implémenter');
  }

  showDocument(docUrl: string, docName: string) {
    const dialogRef = this.dialog.open(ShowDocumentDialogComponent, {
      data: {
        docUrl,
        docName,
      },
      width: '80vw', // ou '1000px', '90%', etc.
      maxWidth: '90vw', // optionnel, pour éviter qu’il déborde sur petit écran
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
  }

  getFormatedStatus(status: string) {
    let formatedStatus =
      status == CourseStatus.scheduled
        ? 'Planifié'
        : status == CourseStatus.in_progress
        ? 'En cours'
        : status == CourseStatus.completed
        ? 'Terminé'
        : status == CourseStatus.canceled
        ? 'Annulé'
        : status == CourseStatus.postponed
        ? 'Reporté'
        : '';
    return formatedStatus;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case CourseStatus.scheduled:
        return 'bg-gray-300 text-black'; // gris pour planifié
      case CourseStatus.in_progress:
        return 'bg-[#C7A22829] text-[#E2A820]'; // orange pour en cours
      case CourseStatus.completed:
        return 'bg-[#28C76F29] text-[#28C76F]'; // Vert pour terminé
      case CourseStatus.canceled:
        return 'bg-[#EA545529] text-[#EA5455]'; // Rouge pour annulé
      case CourseStatus.postponed:
        return 'bg-[#C7A22829] text-[#E2A820]'; // orange pour reporté
      default:
        return 'bg-gray-500 text-white'; // Gris par défaut
    }
  }

  goBack() {
    this.location.back();
  }
}
