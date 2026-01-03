import { format, formatDistanceToNow, differenceInDays, addYears } from 'date-fns';

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function daysUntilBirthday(month: number, day: number): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  let birthdayThisYear = new Date(currentYear, month - 1, day);
  
  if (birthdayThisYear < today) {
    birthdayThisYear = addYears(birthdayThisYear, 1);
  }
  
  return differenceInDays(birthdayThisYear, today);
}

export function isBirthdayToday(month: number, day: number): boolean {
  const today = new Date();
  return today.getMonth() + 1 === month && today.getDate() === day;
}

export function getTribeId(date: Date | string): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * Check if user can create a birthday wall (within 24 hours before birthday)
 * Matches backend logic: opens 24 hours before birthday (1 day before at midnight)
 */
export function canCreateBirthdayWall(month: number, day: number): { canCreate: boolean; hoursUntil: number | null; message: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at midnight (no time)
  const currentYear = today.getFullYear();
  
  // Create birthday date for this year (at midnight, no time)
  let birthdayThisYear = new Date(currentYear, month - 1, day);
  
  // Check if birthday is today
  const isBirthdayToday = today.getTime() === birthdayThisYear.getTime();
  
  // If birthday has passed this year, use next year
  if (birthdayThisYear < today) {
    birthdayThisYear = new Date(currentYear + 1, month - 1, day);
  }
  
  // Wall opens 24 hours before birthday (1 day before at midnight)
  const opensAt = new Date(birthdayThisYear);
  opensAt.setDate(opensAt.getDate() - 1);
  opensAt.setHours(0, 0, 0, 0);
  
  // If birthday is today, the wall should already be open (opened yesterday)
  // So allow creation
  if (isBirthdayToday) {
    return {
      canCreate: true,
      hoursUntil: null,
      message: ''
    };
  }
  
  // Calculate hours until wall opens
  const hoursUntilOpen = (opensAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // If opens_at is in the past or within 24 hours, allow creation
  if (hoursUntilOpen <= 24) {
    return {
      canCreate: true,
      hoursUntil: null,
      message: ''
    };
  }
  
  // Otherwise, show countdown
  return {
    canCreate: false,
    hoursUntil: Math.ceil(hoursUntilOpen),
    message: `Your birthday wall will open in ${Math.ceil(hoursUntilOpen)} hours (24 hours before your birthday)`
  };
}

