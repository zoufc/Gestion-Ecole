// Modèles spécifiques pour la gestion d'école

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  class_id?: number;
  class_name?: string;
  student_number?: string;
  enrollment_date?: string;
  status: string; // active, inactive, graduated, transferred
  photo?: string;
}

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject?: string;
  speciality?: string;
  hire_date?: string;
  status: string; // active, inactive
  photo?: string;
  classes?: Class[];
}

export interface Class {
  id: number;
  name: string;
  level: string; // CP, CE1, 6ème, etc.
  school_year: string; // 2024-2025
  teacher_id?: number;
  teacher_name?: string;
  student_count?: number;
  max_students?: number;
  classroom?: string;
  schedule?: ClassSchedule[];
}

export interface ClassSchedule {
  id: number;
  day_of_week: number; // 0 = Dimanche, 1 = Lundi, etc.
  start_time: string;
  end_time: string;
  subject_id?: number;
  subject_name?: string;
  teacher_id?: number;
  teacher_name?: string;
  classroom?: string;
}

export interface Course {
  id: number;
  title: string;
  subject_id: number;
  subject_name: string;
  class_id: number;
  class_name: string;
  teacher_id: number;
  teacher_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string; // scheduled, in_progress, completed, canceled, postponed
  classroom?: string;
  description?: string;
  notes?: string;
  attendance?: Attendance[];
}

export interface Attendance {
  id: number;
  student_id: number;
  student_name: string;
  course_id: number;
  status: string; // present, absent, late, excused
  remarks?: string;
  marked_at?: string;
}

export interface Grade {
  id: number;
  student_id: number;
  student_name: string;
  subject_id: number;
  subject_name: string;
  teacher_id: number;
  course_id?: number;
  value: number;
  max_value: number;
  type: string; // exam, homework, project, quiz
  date: string;
  comments?: string;
}

export interface Payment {
  id: number;
  student_id: number;
  student_name: string;
  student_number?: string;
  class_name?: string;
  amount: number;
  payment_date: string;
  due_date: string;
  month: string; // Format: "2024-01" pour janvier 2024
  year: number;
  status: string; // paid, pending, overdue, partial
  payment_method?: string; // cash, bank_transfer, mobile_money, check
  reference?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentStatistics {
  student_id: number;
  student_name: string;
  total_paid: number;
  total_due: number;
  total_pending: number;
  total_overdue: number;
  monthly_payments: {
    month: string;
    amount: number;
    status: string;
  }[];
  payment_rate: number; // Pourcentage de paiement
}

