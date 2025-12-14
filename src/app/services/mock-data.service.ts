import { Injectable } from '@angular/core';
import { of, delay, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  // Données mock pour les étudiants
  private mockStudents = [
    {
      id: 1,
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '0123456789',
      date_of_birth: '2010-05-15',
      student_number: 'STU001',
      class_name: '6ème A',
      status: 'active',
      enrollment_date: '2023-09-01',
      parent_name: 'Marie Dupont',
      parent_phone: '0123456790',
    },
    {
      id: 2,
      first_name: 'Sophie',
      last_name: 'Martin',
      email: 'sophie.martin@example.com',
      phone: '0123456788',
      date_of_birth: '2010-08-20',
      student_number: 'STU002',
      class_name: '6ème A',
      status: 'active',
      enrollment_date: '2023-09-01',
      parent_name: 'Pierre Martin',
      parent_phone: '0123456791',
    },
    {
      id: 3,
      first_name: 'Lucas',
      last_name: 'Bernard',
      email: 'lucas.bernard@example.com',
      phone: '0123456787',
      date_of_birth: '2009-12-10',
      student_number: 'STU003',
      class_name: '5ème B',
      status: 'active',
      enrollment_date: '2022-09-01',
      parent_name: 'Julie Bernard',
      parent_phone: '0123456792',
    },
    {
      id: 4,
      first_name: 'Emma',
      last_name: 'Petit',
      email: 'emma.petit@example.com',
      phone: '0123456786',
      date_of_birth: '2009-03-25',
      student_number: 'STU004',
      class_name: '5ème B',
      status: 'active',
      enrollment_date: '2022-09-01',
      parent_name: 'Thomas Petit',
      parent_phone: '0123456793',
    },
    {
      id: 5,
      first_name: 'Hugo',
      last_name: 'Leroy',
      email: 'hugo.leroy@example.com',
      phone: '0123456785',
      date_of_birth: '2008-07-18',
      student_number: 'STU005',
      class_name: '4ème A',
      status: 'active',
      enrollment_date: '2021-09-01',
      parent_name: 'Catherine Leroy',
      parent_phone: '0123456794',
    },
  ];

  // Données mock pour les enseignants
  private mockTeachers = [
    {
      id: 1,
      first_name: 'Marie',
      last_name: 'Dubois',
      email: 'marie.dubois@ecole.fr',
      phone: '0123456780',
      subject: 'Mathématiques',
      speciality: 'Algèbre et Géométrie',
      status: 'active',
      hire_date: '2020-09-01',
      classes: ['6ème A', '5ème B'],
    },
    {
      id: 2,
      first_name: 'Pierre',
      last_name: 'Moreau',
      email: 'pierre.moreau@ecole.fr',
      phone: '0123456781',
      subject: 'Français',
      speciality: 'Littérature',
      status: 'active',
      hire_date: '2019-09-01',
      classes: ['6ème A', '4ème A'],
    },
    {
      id: 3,
      first_name: 'Julie',
      last_name: 'Laurent',
      email: 'julie.laurent@ecole.fr',
      phone: '0123456782',
      subject: 'Sciences',
      speciality: 'Physique-Chimie',
      status: 'active',
      hire_date: '2021-09-01',
      classes: ['5ème B', '4ème A'],
    },
    {
      id: 4,
      first_name: 'Thomas',
      last_name: 'Simon',
      email: 'thomas.simon@ecole.fr',
      phone: '0123456783',
      subject: 'Histoire-Géographie',
      speciality: 'Histoire',
      status: 'active',
      hire_date: '2018-09-01',
      classes: ['6ème A'],
    },
  ];

  // Données mock pour les classes
  private mockClasses = [
    {
      id: 1,
      name: '6ème A',
      level: '6ème',
      school_year: '2024-2025',
      teacher_name: 'Marie Dubois',
      student_count: 25,
      max_students: 30,
      classroom: 'Salle 101',
    },
    {
      id: 2,
      name: '5ème B',
      level: '5ème',
      school_year: '2024-2025',
      teacher_name: 'Julie Laurent',
      student_count: 28,
      max_students: 30,
      classroom: 'Salle 202',
    },
    {
      id: 3,
      name: '4ème A',
      level: '4ème',
      school_year: '2024-2025',
      teacher_name: 'Pierre Moreau',
      student_count: 26,
      max_students: 30,
      classroom: 'Salle 301',
    },
  ];

  // Données mock pour les cours
  private mockCourses = [
    {
      id: 1,
      title: 'Cours de Mathématiques',
      subject_name: 'Mathématiques',
      class_name: '6ème A',
      teacher_name: 'Marie Dubois',
      scheduled_date: '2024-12-20',
      start_time: '08:00',
      end_time: '09:00',
      status: 'scheduled',
      classroom: 'Salle 101',
    },
    {
      id: 2,
      title: 'Cours de Français',
      subject_name: 'Français',
      class_name: '6ème A',
      teacher_name: 'Pierre Moreau',
      scheduled_date: '2024-12-20',
      start_time: '09:15',
      end_time: '10:15',
      status: 'scheduled',
      classroom: 'Salle 102',
    },
    {
      id: 3,
      title: 'Cours de Sciences',
      subject_name: 'Sciences',
      class_name: '5ème B',
      teacher_name: 'Julie Laurent',
      scheduled_date: '2024-12-20',
      start_time: '10:30',
      end_time: '11:30',
      status: 'in_progress',
      classroom: 'Salle 201',
    },
    {
      id: 4,
      title: 'Cours de Mathématiques',
      subject_name: 'Mathématiques',
      class_name: '5ème B',
      teacher_name: 'Marie Dubois',
      scheduled_date: '2024-12-19',
      start_time: '14:00',
      end_time: '15:00',
      status: 'completed',
      classroom: 'Salle 202',
    },
  ];

  // Données mock pour les matières
  private mockSubjects = [
    {
      id: 1,
      name: 'Mathématiques',
      code: 'MATH',
      hours_per_week: 4,
      teacher_name: 'Marie Dubois',
    },
    {
      id: 2,
      name: 'Français',
      code: 'FR',
      hours_per_week: 5,
      teacher_name: 'Pierre Moreau',
    },
    {
      id: 3,
      name: 'Sciences',
      code: 'SCI',
      hours_per_week: 3,
      teacher_name: 'Julie Laurent',
    },
    {
      id: 4,
      name: 'Histoire-Géographie',
      code: 'HIST-GEO',
      hours_per_week: 3,
      teacher_name: 'Thomas Simon',
    },
  ];

  // Méthodes pour simuler les appels API avec delay
  getStudents(params: any = {}): Observable<any> {
    let filtered = [...this.mockStudents];

    // Filtrer par statut
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((s) => s.status === params.status);
    }

    // Filtrer par recherche
    if (params.name || params.email || params.phone) {
      const searchTerm = (params.name || params.email || params.phone || '').toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.first_name.toLowerCase().includes(searchTerm) ||
          s.last_name.toLowerCase().includes(searchTerm) ||
          s.email.toLowerCase().includes(searchTerm) ||
          s.phone.includes(searchTerm)
      );
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return of({
      data: paginated,
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    }).pipe(delay(500));
  }

  getTeachers(params: any = {}): Observable<any> {
    let filtered = [...this.mockTeachers];

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((t) => t.status === params.status);
    }

    if (params.first_name) {
      filtered = filtered.filter((t) =>
        t.first_name.toLowerCase().includes(params.first_name.toLowerCase())
      );
    }

    if (params.last_name) {
      filtered = filtered.filter((t) =>
        t.last_name.toLowerCase().includes(params.last_name.toLowerCase())
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return of({
      data: paginated,
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    }).pipe(delay(500));
  }

  getClasses(params: any = {}): Observable<any> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = this.mockClasses.slice(startIndex, endIndex);

    return of({
      data: paginated,
      meta: {
        page,
        limit,
        total: this.mockClasses.length,
        totalPages: Math.ceil(this.mockClasses.length / limit),
      },
    }).pipe(delay(500));
  }

  getCourses(params: any = {}): Observable<any> {
    let filtered = [...this.mockCourses];

    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    if (params.date) {
      filtered = filtered.filter((c) => c.scheduled_date === params.date);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return of({
      data: paginated,
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    }).pipe(delay(500));
  }

  getSubjects(params: any = {}): Observable<any> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = this.mockSubjects.slice(startIndex, endIndex);

    return of({
      data: paginated,
      meta: {
        page,
        limit,
        total: this.mockSubjects.length,
        totalPages: Math.ceil(this.mockSubjects.length / limit),
      },
    }).pipe(delay(500));
  }

  getCourseStatistics(): Observable<any> {
    const total = this.mockCourses.length;
    const completed = this.mockCourses.filter((c) => c.status === 'completed').length;
    const scheduled = this.mockCourses.filter((c) => c.status === 'scheduled').length;
    const toCome = scheduled + this.mockCourses.filter((c) => c.status === 'in_progress').length;
    const canceled = this.mockCourses.filter((c) => c.status === 'canceled').length;
    
    return of({
      data: {
        // Pour compatibilité avec le template existant
        totalRdvs: total,
        totalRdvsHonored: completed,
        totalRdvsToCome: toCome,
        totalRdvsCanceled: canceled,
        // Nouvelles propriétés pour la gestion d'école
        total: total,
        scheduled: scheduled,
        in_progress: this.mockCourses.filter((c) => c.status === 'in_progress').length,
        completed: completed,
        canceled: canceled,
      },
    }).pipe(delay(300));
  }

  getCourseById(id: string): Observable<any> {
    const course = this.mockCourses.find(c => c.id.toString() === id);
    if (course) {
      // Ajouter des propriétés supplémentaires pour simuler les détails complets
      return of({
        data: {
          ...course,
          description: `Cours de ${course.subject_name} pour la classe ${course.class_name}`,
          start_date: `${course.scheduled_date}T${course.start_time}:00`,
          end_date: `${course.scheduled_date}T${course.end_time}:00`,
          is_validated: true,
          rdvs_notes: [],
        }
      }).pipe(delay(300));
    }
    return of({ data: null }).pipe(delay(300));
  }

  getCourseHistoricals(id: string): Observable<any> {
    // Simuler un historique vide ou avec quelques entrées
    return of({
      data: {
        historicals: []
      }
    }).pipe(delay(300));
  }

  getCourseDocuments(id: string): Observable<any> {
    // Simuler des documents vides
    return of({
      data: []
    }).pipe(delay(300));
  }

  // Données mock pour les paiements
  private mockPayments = [
    {
      id: 1,
      student_id: 1,
      student_name: 'Jean Dupont',
      student_number: 'STU001',
      class_name: '6ème A',
      amount: 50000,
      payment_date: '2024-12-01',
      due_date: '2024-12-05',
      month: '2024-12',
      year: 2024,
      status: 'paid',
      payment_method: 'bank_transfer',
      reference: 'PAY001',
    },
    {
      id: 2,
      student_id: 1,
      student_name: 'Jean Dupont',
      student_number: 'STU001',
      class_name: '6ème A',
      amount: 50000,
      payment_date: '2024-11-01',
      due_date: '2024-11-05',
      month: '2024-11',
      year: 2024,
      status: 'paid',
      payment_method: 'cash',
      reference: 'PAY002',
    },
    {
      id: 3,
      student_id: 2,
      student_name: 'Sophie Martin',
      student_number: 'STU002',
      class_name: '6ème A',
      amount: 50000,
      payment_date: '2024-12-02',
      due_date: '2024-12-05',
      month: '2024-12',
      year: 2024,
      status: 'paid',
      payment_method: 'mobile_money',
      reference: 'PAY003',
    },
    {
      id: 4,
      student_id: 2,
      student_name: 'Sophie Martin',
      student_number: 'STU002',
      class_name: '6ème A',
      amount: 50000,
      payment_date: null,
      due_date: '2024-11-05',
      month: '2024-11',
      year: 2024,
      status: 'overdue',
      payment_method: null,
      reference: null,
    },
    {
      id: 5,
      student_id: 3,
      student_name: 'Lucas Bernard',
      student_number: 'STU003',
      class_name: '5ème B',
      amount: 55000,
      payment_date: null,
      due_date: '2024-12-10',
      month: '2024-12',
      year: 2024,
      status: 'pending',
      payment_method: null,
      reference: null,
    },
    {
      id: 6,
      student_id: 4,
      student_name: 'Emma Petit',
      student_number: 'STU004',
      class_name: '5ème B',
      amount: 55000,
      payment_date: '2024-12-03',
      due_date: '2024-12-10',
      month: '2024-12',
      year: 2024,
      status: 'paid',
      payment_method: 'bank_transfer',
      reference: 'PAY004',
    },
    {
      id: 7,
      student_id: 5,
      student_name: 'Hugo Leroy',
      student_number: 'STU005',
      class_name: '4ème A',
      amount: 60000,
      payment_date: '2024-12-01',
      due_date: '2024-12-15',
      month: '2024-12',
      year: 2024,
      status: 'paid',
      payment_method: 'cash',
      reference: 'PAY005',
    },
  ];

  // Méthodes pour les paiements
  getPayments(params: any = {}): Observable<any> {
    let filtered = [...this.mockPayments];

    // Filtrer par statut
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // Filtrer par élève
    if (params.student_id) {
      filtered = filtered.filter((p) => p.student_id.toString() === params.student_id.toString());
    }

    // Filtrer par recherche
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.student_name.toLowerCase().includes(searchTerm) ||
          p.student_number?.toLowerCase().includes(searchTerm) ||
          p.reference?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrer par mois
    if (params.month) {
      filtered = filtered.filter((p) => p.month === params.month);
    }

    // Filtrer par année
    if (params.year) {
      filtered = filtered.filter((p) => p.year === params.year);
    }

    // Trier par date de paiement (plus récent en premier)
    filtered.sort((a, b) => {
      const dateA = a.payment_date ? new Date(a.payment_date).getTime() : 0;
      const dateB = b.payment_date ? new Date(b.payment_date).getTime() : 0;
      return dateB - dateA;
    });

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return of({
      data: paginated,
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    }).pipe(delay(500));
  }

  getStudentPayments(studentId: number, params: any = {}): Observable<any> {
    return this.getPayments({ ...params, student_id: studentId });
  }

  getPaymentStatistics(studentId?: number): Observable<any> {
    let payments = [...this.mockPayments];

    // Filtrer par élève si spécifié
    if (studentId) {
      payments = payments.filter((p) => p.student_id === studentId);
    }

    const totalDue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = payments.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

    // Grouper par mois
    const monthlyPayments: { [key: string]: { month: string; amount: number; status: string } } = {};
    payments.forEach((p) => {
      if (!monthlyPayments[p.month]) {
        monthlyPayments[p.month] = {
          month: p.month,
          amount: 0,
          status: p.status,
        };
      }
      monthlyPayments[p.month].amount += p.amount;
    });

    const paymentRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

    const stats: any = {
      total_paid: totalPaid,
      total_due: totalDue,
      total_pending: totalPending,
      total_overdue: totalOverdue,
      payment_rate: paymentRate,
      monthly_payments: Object.values(monthlyPayments),
    };

    // Si un élève spécifique, ajouter ses infos
    if (studentId) {
      const student = this.mockStudents.find((s) => s.id === studentId);
      if (student) {
        stats.student_id = student.id;
        stats.student_name = `${student.first_name} ${student.last_name}`;
      }
    } else {
      // Statistiques globales
      stats.total_students = this.mockStudents.length;
      stats.students_with_payments = new Set(payments.map((p) => p.student_id)).size;
    }

    return of({ data: stats }).pipe(delay(1200));
  }

  getPaymentsByMonth(month: string, params: any = {}): Observable<any> {
    return this.getPayments({ ...params, month });
  }

  // Données mock pour les notes
  private mockGrades = [
    {
      id: 1,
      student_id: 1,
      student_name: 'Jean Dupont',
      student_number: 'STU001',
      class_name: '6ème A',
      subject_id: 1,
      subject_name: 'Mathématiques',
      teacher_id: 1,
      teacher_name: 'Marie Dubois',
      course_id: 1,
      value: 15,
      max_value: 20,
      percentage: 75,
      type: 'exam',
      date: '2024-12-15',
      comments: 'Très bon travail',
      created_at: '2024-12-15T10:00:00',
    },
    {
      id: 2,
      student_id: 1,
      student_name: 'Jean Dupont',
      student_number: 'STU001',
      class_name: '6ème A',
      subject_id: 2,
      subject_name: 'Français',
      teacher_id: 2,
      teacher_name: 'Pierre Moreau',
      course_id: 2,
      value: 18,
      max_value: 20,
      percentage: 90,
      type: 'homework',
      date: '2024-12-10',
      comments: 'Excellent',
      created_at: '2024-12-10T14:00:00',
    },
    {
      id: 3,
      student_id: 2,
      student_name: 'Sophie Martin',
      student_number: 'STU002',
      class_name: '6ème A',
      subject_id: 1,
      subject_name: 'Mathématiques',
      teacher_id: 1,
      teacher_name: 'Marie Dubois',
      course_id: 1,
      value: 16,
      max_value: 20,
      percentage: 80,
      type: 'exam',
      date: '2024-12-15',
      comments: 'Bon travail',
      created_at: '2024-12-15T10:00:00',
    },
    {
      id: 4,
      student_id: 2,
      student_name: 'Sophie Martin',
      student_number: 'STU002',
      class_name: '6ème A',
      subject_id: 3,
      subject_name: 'Sciences',
      teacher_id: 3,
      teacher_name: 'Julie Laurent',
      course_id: 3,
      value: 14,
      max_value: 20,
      percentage: 70,
      type: 'project',
      date: '2024-12-12',
      comments: 'Satisfaisant',
      created_at: '2024-12-12T16:00:00',
    },
    {
      id: 5,
      student_id: 3,
      student_name: 'Lucas Bernard',
      student_number: 'STU003',
      class_name: '5ème B',
      subject_id: 1,
      subject_name: 'Mathématiques',
      teacher_id: 1,
      teacher_name: 'Marie Dubois',
      value: 12,
      max_value: 20,
      percentage: 60,
      type: 'quiz',
      date: '2024-12-14',
      comments: 'À améliorer',
      created_at: '2024-12-14T09:00:00',
    },
    {
      id: 6,
      student_id: 1,
      student_name: 'Jean Dupont',
      student_number: 'STU001',
      class_name: '6ème A',
      subject_id: 4,
      subject_name: 'Histoire-Géographie',
      teacher_id: 4,
      teacher_name: 'Thomas Simon',
      value: 17,
      max_value: 20,
      percentage: 85,
      type: 'exam',
      date: '2024-12-13',
      comments: 'Très bien',
      created_at: '2024-12-13T11:00:00',
    },
  ];

  // Méthodes pour gérer les notes
  getGrades(params: any = {}): Observable<any> {
    let filtered = [...this.mockGrades];

    // Filtrer par élève
    if (params.student_id) {
      filtered = filtered.filter((g) => g.student_id.toString() === params.student_id.toString());
    }

    // Filtrer par matière
    if (params.subject_id) {
      filtered = filtered.filter((g) => g.subject_id.toString() === params.subject_id.toString());
    }

    // Filtrer par classe
    if (params.class_name) {
      filtered = filtered.filter((g) => g.class_name === params.class_name);
    }

    // Filtrer par type
    if (params.type && params.type !== 'all') {
      filtered = filtered.filter((g) => g.type === params.type);
    }

    // Filtrer par date
    if (params.start_date) {
      filtered = filtered.filter((g) => g.date >= params.start_date);
    }
    if (params.end_date) {
      filtered = filtered.filter((g) => g.date <= params.end_date);
    }

    // Filtrer par recherche (nom d'élève ou matière)
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.student_name.toLowerCase().includes(searchTerm) ||
          g.subject_name.toLowerCase().includes(searchTerm) ||
          g.student_number?.toLowerCase().includes(searchTerm)
      );
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return of({
      data: paginated,
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    }).pipe(delay(500));
  }

  getGradeById(id: number): Observable<any> {
    const grade = this.mockGrades.find((g) => g.id === id);
    if (grade) {
      return of({ data: grade }).pipe(delay(300));
    }
    return of({ data: null }).pipe(delay(300));
  }

  getStudentGrades(studentId: number, params: any = {}): Observable<any> {
    return this.getGrades({ ...params, student_id: studentId });
  }

  createGrade(gradeData: any): Observable<any> {
    const newGrade = {
      id: this.mockGrades.length + 1,
      ...gradeData,
      percentage: Math.round((gradeData.value / gradeData.max_value) * 100),
      student_name: this.mockStudents.find((s) => s.id === gradeData.student_id)?.first_name + ' ' + this.mockStudents.find((s) => s.id === gradeData.student_id)?.last_name,
      subject_name: this.mockSubjects.find((s) => s.id === gradeData.subject_id)?.name,
      teacher_name: this.mockTeachers.find((t) => t.id === gradeData.teacher_id)?.first_name + ' ' + this.mockTeachers.find((t) => t.id === gradeData.teacher_id)?.last_name,
      class_name: this.mockStudents.find((s) => s.id === gradeData.student_id)?.class_name,
      student_number: this.mockStudents.find((s) => s.id === gradeData.student_id)?.student_number,
      created_at: new Date().toISOString(),
    };
    this.mockGrades.push(newGrade);
    return of({ data: newGrade, message: 'Note créée avec succès' }).pipe(delay(500));
  }

  updateGrade(id: number, gradeData: any): Observable<any> {
    const index = this.mockGrades.findIndex((g) => g.id === id);
    if (index !== -1) {
      const updatedGrade = {
        ...this.mockGrades[index],
        ...gradeData,
        percentage: Math.round((gradeData.value / gradeData.max_value) * 100),
        student_name: gradeData.student_id ? this.mockStudents.find((s) => s.id === gradeData.student_id)?.first_name + ' ' + this.mockStudents.find((s) => s.id === gradeData.student_id)?.last_name : this.mockGrades[index].student_name,
        subject_name: gradeData.subject_id ? this.mockSubjects.find((s) => s.id === gradeData.subject_id)?.name : this.mockGrades[index].subject_name,
        teacher_name: gradeData.teacher_id ? this.mockTeachers.find((t) => t.id === gradeData.teacher_id)?.first_name + ' ' + this.mockTeachers.find((t) => t.id === gradeData.teacher_id)?.last_name : this.mockGrades[index].teacher_name,
      };
      this.mockGrades[index] = updatedGrade;
      return of({ data: updatedGrade, message: 'Note modifiée avec succès' }).pipe(delay(500));
    }
    return of({ error: 'Note non trouvée' }).pipe(delay(300));
  }

  deleteGrade(id: number): Observable<any> {
    const index = this.mockGrades.findIndex((g) => g.id === id);
    if (index !== -1) {
      this.mockGrades.splice(index, 1);
      return of({ message: 'Note supprimée avec succès' }).pipe(delay(500));
    }
    return of({ error: 'Note non trouvée' }).pipe(delay(300));
  }

  getGradeStatistics(studentId?: number, subjectId?: number, classId?: number): Observable<any> {
    let filtered = [...this.mockGrades];

    if (studentId) {
      filtered = filtered.filter((g) => g.student_id === studentId);
    }
    if (subjectId) {
      filtered = filtered.filter((g) => g.subject_id === subjectId);
    }
    if (classId) {
      const className = this.mockClasses.find((c) => c.id === classId)?.name;
      if (className) {
        filtered = filtered.filter((g) => g.class_name === className);
      }
    }

    const total = filtered.length;
    const average = total > 0
      ? filtered.reduce((sum, g) => sum + g.percentage, 0) / total
      : 0;
    const maxGrade = total > 0
      ? Math.max(...filtered.map((g) => g.percentage))
      : 0;
    const minGrade = total > 0
      ? Math.min(...filtered.map((g) => g.percentage))
      : 0;

    // Répartition par type
    const byType = {
      exam: filtered.filter((g) => g.type === 'exam').length,
      homework: filtered.filter((g) => g.type === 'homework').length,
      project: filtered.filter((g) => g.type === 'project').length,
      quiz: filtered.filter((g) => g.type === 'quiz').length,
    };

    // Répartition par matière
    const bySubject: any = {};
    filtered.forEach((g) => {
      if (!bySubject[g.subject_name]) {
        bySubject[g.subject_name] = {
          count: 0,
          average: 0,
          total: 0,
        };
      }
      bySubject[g.subject_name].count++;
      bySubject[g.subject_name].total += g.percentage;
    });
    Object.keys(bySubject).forEach((subject) => {
      bySubject[subject].average = Math.round(bySubject[subject].total / bySubject[subject].count);
    });

    const stats = {
      total,
      average: Math.round(average),
      max: maxGrade,
      min: minGrade,
      byType,
      bySubject,
    };

    return of({ data: stats }).pipe(delay(500));
  }

  // Méthodes pour les classes
  getClassById(id: string): Observable<any> {
    const classItem = this.mockClasses.find((c) => c.id.toString() === id.toString());
    if (classItem) {
      return of({ data: classItem }).pipe(delay(300));
    }
    return of({ data: null }).pipe(delay(300));
  }

  getStudentsByClass(classId: string): Observable<any> {
    const classItem = this.mockClasses.find((c) => c.id.toString() === classId.toString());
    if (!classItem) {
      return of({ data: [] }).pipe(delay(300));
    }

    const students = this.mockStudents.filter((s) => s.class_name === classItem.name);
    return of({ data: students }).pipe(delay(500));
  }

  getClassSchedule(classId: string): Observable<any> {
    const classItem = this.mockClasses.find((c) => c.id.toString() === classId.toString());
    if (!classItem) {
      return of({ data: [] }).pipe(delay(300));
    }

    // Créer un emploi du temps mock pour la classe
    const mockSchedule = this.generateMockSchedule(classItem.name);
    return of({ data: mockSchedule }).pipe(delay(500));
  }

  private generateMockSchedule(className: string): any[] {
    // Emploi du temps basé sur le niveau de la classe
    const schedules: any[] = [];
    
    if (className === '6ème A') {
      schedules.push(
        { id: 1, day_of_week: 1, start_time: '08:00', end_time: '09:00', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 101' },
        { id: 2, day_of_week: 1, start_time: '09:15', end_time: '10:15', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 102' },
        { id: 3, day_of_week: 1, start_time: '10:30', end_time: '11:30', subject_name: 'Sciences', teacher_name: 'Julie Laurent', classroom: 'Salle 103' },
        { id: 4, day_of_week: 1, start_time: '14:00', end_time: '15:00', subject_name: 'Histoire-Géographie', teacher_name: 'Thomas Simon', classroom: 'Salle 104' },
        { id: 5, day_of_week: 1, start_time: '15:15', end_time: '16:15', subject_name: 'Anglais', teacher_name: 'Marie Dubois', classroom: 'Salle 101' },
        { id: 6, day_of_week: 2, start_time: '08:00', end_time: '09:00', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 102' },
        { id: 7, day_of_week: 2, start_time: '09:15', end_time: '10:15', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 101' },
        { id: 8, day_of_week: 2, start_time: '10:30', end_time: '11:30', subject_name: 'EPS', teacher_name: 'Pierre Moreau', classroom: 'Gymnase' },
        { id: 9, day_of_week: 2, start_time: '14:00', end_time: '15:00', subject_name: 'Sciences', teacher_name: 'Julie Laurent', classroom: 'Salle 103' },
        { id: 10, day_of_week: 3, start_time: '08:00', end_time: '09:00', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 101' },
        { id: 11, day_of_week: 3, start_time: '09:15', end_time: '10:15', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 102' },
        { id: 12, day_of_week: 3, start_time: '14:00', end_time: '15:00', subject_name: 'Histoire-Géographie', teacher_name: 'Thomas Simon', classroom: 'Salle 104' },
        { id: 13, day_of_week: 4, start_time: '08:00', end_time: '09:00', subject_name: 'Sciences', teacher_name: 'Julie Laurent', classroom: 'Salle 103' },
        { id: 14, day_of_week: 4, start_time: '09:15', end_time: '10:15', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 101' },
        { id: 15, day_of_week: 4, start_time: '10:30', end_time: '11:30', subject_name: 'Anglais', teacher_name: 'Marie Dubois', classroom: 'Salle 101' },
        { id: 16, day_of_week: 4, start_time: '14:00', end_time: '15:00', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 102' },
        { id: 17, day_of_week: 5, start_time: '08:00', end_time: '09:00', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 102' },
        { id: 18, day_of_week: 5, start_time: '09:15', end_time: '10:15', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 101' },
        { id: 19, day_of_week: 5, start_time: '10:30', end_time: '11:30', subject_name: 'EPS', teacher_name: 'Pierre Moreau', classroom: 'Gymnase' },
      );
    } else if (className === '5ème B') {
      schedules.push(
        { id: 20, day_of_week: 1, start_time: '08:00', end_time: '09:00', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 201' },
        { id: 21, day_of_week: 1, start_time: '09:15', end_time: '10:15', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 202' },
        { id: 22, day_of_week: 1, start_time: '10:30', end_time: '11:30', subject_name: 'Sciences', teacher_name: 'Julie Laurent', classroom: 'Salle 203' },
        { id: 23, day_of_week: 2, start_time: '08:00', end_time: '09:00', subject_name: 'Sciences', teacher_name: 'Julie Laurent', classroom: 'Salle 203' },
        { id: 24, day_of_week: 2, start_time: '09:15', end_time: '10:15', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 201' },
        { id: 25, day_of_week: 3, start_time: '08:00', end_time: '09:00', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 202' },
        { id: 26, day_of_week: 4, start_time: '08:00', end_time: '09:00', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 201' },
        { id: 27, day_of_week: 5, start_time: '08:00', end_time: '09:00', subject_name: 'Sciences', teacher_name: 'Julie Laurent', classroom: 'Salle 203' },
      );
    } else if (className === '4ème A') {
      schedules.push(
        { id: 28, day_of_week: 1, start_time: '08:00', end_time: '09:00', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 301' },
        { id: 29, day_of_week: 1, start_time: '09:15', end_time: '10:15', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 302' },
        { id: 30, day_of_week: 2, start_time: '08:00', end_time: '09:00', subject_name: 'Sciences', teacher_name: 'Julie Laurent', classroom: 'Salle 303' },
        { id: 31, day_of_week: 3, start_time: '08:00', end_time: '09:00', subject_name: 'Mathématiques', teacher_name: 'Marie Dubois', classroom: 'Salle 301' },
        { id: 32, day_of_week: 4, start_time: '08:00', end_time: '09:00', subject_name: 'Français', teacher_name: 'Pierre Moreau', classroom: 'Salle 302' },
        { id: 33, day_of_week: 5, start_time: '08:00', end_time: '09:00', subject_name: 'Sciences', teacher_name: 'Julie Laurent', classroom: 'Salle 303' },
      );
    }

    return schedules;
  }
}

