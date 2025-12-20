export enum SchoolCategory {
  primary = 'primary',
  secondary = 'secondary',
  high_school = 'high_school',
  university = 'university',
}

export enum CourseStatus {
  scheduled = 'scheduled',
  in_progress = 'in_progress',
  completed = 'completed',
  canceled = 'canceled',
  postponed = 'postponed',
}

export enum StudentStatus {
  active = 'active',
  inactive = 'inactive',
  graduated = 'graduated',
  transferred = 'transferred',
}

export enum TransactionStatus {
  pending = 'pending',
  finished = 'success',
  canceled = 'failed',
}

export enum UserRoles {
  teacher = 'teacher',
  administrator = 'administrator',
  director = 'director',
  secretary = 'secretary',
  owner = 'company_owner',
}

export enum SubscriptionFrequency {
  month = 'monthly',
  year = 'yearly',
}

export enum InvoiceStatus {
  success = 'success',
  pending = 'pending',
}

export enum AttendanceStatus {
  present = 'present',
  absent = 'absent',
  late = 'late',
  excused = 'excused',
}

// Garder les anciens enums pour compatibilité si nécessaire
export enum OrganisationCategory {
  administrative = 'administrative',
  provider = 'provider',
}

export enum RdvStatus {
  pending = 'pending',
  inprogress = 'in_progress',
  finished = 'terminated',
  canceled = 'canceled',
  rescheduled = 'rescheduled',
}

