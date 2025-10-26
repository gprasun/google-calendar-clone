import { RecurrenceRule } from '@/types';

/**
 * Parse RRULE string into RecurrenceRule object
 * @param rrule RRULE string (e.g., "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR")
 * @returns RecurrenceRule object
 */
export const parseRRULE = (rrule: string): RecurrenceRule => {
  const rule: Partial<RecurrenceRule> = {};
  const parts = rrule.split(';');

  for (const part of parts) {
    const [key, value] = part.split('=');
    
    switch (key) {
      case 'FREQ':
        rule.frequency = value as RecurrenceRule['frequency'];
        break;
      case 'INTERVAL':
        rule.interval = parseInt(value);
        break;
      case 'UNTIL':
        rule.endDate = value;
        break;
      case 'COUNT':
        rule.count = parseInt(value);
        break;
      case 'BYDAY':
        rule.byDay = value.split(',');
        break;
      case 'BYMONTH':
        rule.byMonth = value.split(',').map(Number);
        break;
      case 'BYMONTHDAY':
        rule.byMonthDay = value.split(',').map(Number);
        break;
      case 'BYWEEKNO':
        rule.byWeekNo = value.split(',').map(Number);
        break;
      case 'BYYEARDAY':
        rule.byYearDay = value.split(',').map(Number);
        break;
      case 'BYSETPOS':
        rule.bySetPos = value.split(',').map(Number);
        break;
      case 'WKST':
        rule.weekStart = value as RecurrenceRule['weekStart'];
        break;
    }
  }

  return rule as RecurrenceRule;
};

/**
 * Generate RRULE string from RecurrenceRule object
 * @param rule RecurrenceRule object
 * @returns RRULE string
 */
export const generateRRULE = (rule: RecurrenceRule): string => {
  const parts: string[] = [];
  
  if (rule.frequency) {
    parts.push(`FREQ=${rule.frequency}`);
  }
  
  if (rule.interval && rule.interval > 1) {
    parts.push(`INTERVAL=${rule.interval}`);
  }
  
  if (rule.endDate) {
    parts.push(`UNTIL=${rule.endDate}`);
  }
  
  if (rule.count) {
    parts.push(`COUNT=${rule.count}`);
  }
  
  if (rule.byDay && rule.byDay.length > 0) {
    parts.push(`BYDAY=${rule.byDay.join(',')}`);
  }
  
  if (rule.byMonth && rule.byMonth.length > 0) {
    parts.push(`BYMONTH=${rule.byMonth.join(',')}`);
  }
  
  if (rule.byMonthDay && rule.byMonthDay.length > 0) {
    parts.push(`BYMONTHDAY=${rule.byMonthDay.join(',')}`);
  }
  
  if (rule.byWeekNo && rule.byWeekNo.length > 0) {
    parts.push(`BYWEEKNO=${rule.byWeekNo.join(',')}`);
  }
  
  if (rule.byYearDay && rule.byYearDay.length > 0) {
    parts.push(`BYYEARDAY=${rule.byYearDay.join(',')}`);
  }
  
  if (rule.bySetPos && rule.bySetPos.length > 0) {
    parts.push(`BYSETPOS=${rule.bySetPos.join(',')}`);
  }
  
  if (rule.weekStart) {
    parts.push(`WKST=${rule.weekStart}`);
  }
  
  return parts.join(';');
};

/**
 * Generate recurring event instances based on RRULE
 * @param startDate Start date of the original event
 * @param endDate End date of the original event
 * @param rrule RRULE string
 * @param maxInstances Maximum number of instances to generate
 * @returns Array of event instances with start and end dates
 */
export const generateRecurringInstances = (
  startDate: Date,
  endDate: Date,
  rrule: string,
  maxInstances: number = 100
): Array<{ startDate: Date; endDate: Date }> => {
  const rule = parseRRULE(rrule);
  const instances: Array<{ startDate: Date; endDate: Date }> = [];
  const eventDuration = endDate.getTime() - startDate.getTime();

  const effectiveMaxInstances = rule.count || maxInstances;
  const maxDate = rule.endDate ? new Date(rule.endDate) : new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
  
  let currentDate = new Date(startDate);
  let instanceCount = 0;
  
  while (instanceCount < Math.min(effectiveMaxInstances, maxInstances)) {
    if (currentDate > maxDate) {
      break;
    }
    
    const instanceEndDate = new Date(currentDate.getTime() + eventDuration);
    instances.push({
      startDate: new Date(currentDate),
      endDate: instanceEndDate
    });
    
    instanceCount++;
    
    const nextDate = getNextOccurrence(currentDate, rule);
    
    if (nextDate <= currentDate) {
      break;
    }
    
    currentDate = nextDate;
  }
  
  return instances;
};

/**
 * Get the next occurrence date based on recurrence rule
 * @param currentDate Current date
 * @param rule Recurrence rule
 * @returns Next occurrence date
 */
const getNextOccurrence = (currentDate: Date, rule: RecurrenceRule): Date => {
  const nextDate = new Date(currentDate);
  const interval = rule.interval || 1;
  
  switch (rule.frequency) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
      
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
      
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
      
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
      
    default:
      // Default to daily if frequency is not specified
      nextDate.setDate(nextDate.getDate() + 1);
  }
  
  return nextDate;
};

/**
 * Check if a date matches the recurrence rule
 * @param date Date to check
 * @param startDate Original event start date
 * @param rule Recurrence rule
 * @returns True if date matches the rule
 */
export const isRecurringDate = (date: Date, startDate: Date, rule: RecurrenceRule): boolean => {
  // This is a simplified implementation
  // In a real application, you'd want more sophisticated logic
  
  const interval = rule.interval || 1;
  const timeDiff = date.getTime() - startDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  switch (rule.frequency) {
    case 'DAILY':
      return daysDiff % interval === 0;
      
    case 'WEEKLY':
      return daysDiff % (7 * interval) === 0;
      
    case 'MONTHLY':
      return date.getDate() === startDate.getDate() && 
             (date.getMonth() - startDate.getMonth()) % interval === 0;
      
    case 'YEARLY':
      return date.getMonth() === startDate.getMonth() && 
             date.getDate() === startDate.getDate() &&
             (date.getFullYear() - startDate.getFullYear()) % interval === 0;
      
    default:
      return false;
  }
};
