import { UserRoles } from './enums';

export function convertTimeInMinutes(time: string) {
  let [hour, minutes] = time.split(':');
  let minutesOfHour = parseInt(hour) * 60;
  return minutesOfHour + parseInt(minutes);
}

export function formatHour(hour: string): string {
  const totalHours = parseInt(hour, 10);

  if (isNaN(totalHours)) return '00:00';

  const hours = Math.floor(totalHours);
  const minutes = (totalHours - hours) * 60;

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = Math.round(minutes).toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}

export function getNumberOfHour(time: string): number {
  let [hour, minutes] = time.split(':');
  let minutesOfHour = parseInt(hour) * 60;
  let totalMinutes = minutesOfHour + parseInt(minutes);
  return totalMinutes / 60;
}

export function getTimeFromDateTime(dateTime: string) {
  let time = dateTime.split('T')[1].substring(0, 5);
  return time;
}

export function getFormatedUserRole(role: string) {
  switch (role) {
    case UserRoles.consultant:
      return 'Consultant';

    case UserRoles.owner:
      return 'Propriétaire';
    default:
      return '';
  }
}
