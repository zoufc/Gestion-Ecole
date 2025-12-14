export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
}

export interface Subject {
  id: number;
  name: string;
  code?: string;
  description?: string;
  hours_per_week?: number;
  teacher_id?: number;
  // Propriétés pour compatibilité avec l'ancien modèle Service
  duration?: number;
  price?: number;
  time_slots?: TimeSlot[];
}

export interface SchoolSchedule {
  id: number;
  start_time: string;
  end_time: string;
  day_of_week: number; // 0 = Dimanche, 1 = Lundi, etc.
}

export interface School {
  id: number;
  school_name: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  logo: string | null;
  website?: string;
  type: string; // primaire, secondaire, etc.
  category: string;
  director_name?: string;
  school_schedules: SchoolSchedule[];
  time_slots?: TimeSlot[];
  subjects?: Subject[];
}

// Conserver Organisation pour la compatibilité avec le backend si nécessaire
export interface Organisation extends School {
  // Propriétés anciennes pour compatibilité
  organisation_name?: string;
  organisation_email?: string;
  organisation_phone?: string;
  organisation_address?: string;
  site_web?: string;
  organisation_schedules?: SchoolSchedule[];
  authorize_payment_online_service?: boolean;
  services?: Subject[];
}

// Alias pour compatibilité avec le code existant
export type Service = Subject;
export type Slot = TimeSlot;
export type OrganisationSchedule = SchoolSchedule;

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
