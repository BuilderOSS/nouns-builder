export const FIELD_TYPES = {
  DATE: 'date',
  DAYS_HOURS_MINS: 'daysHoursMins',
  DAYS_HOURS_MINS_SECS: 'daysHoursMinsSecs',
  NUMBER: 'number',
  SELECT: 'select',
  TEXT: 'text',
  TEXTAREA: 'textarea',
  MINS_SECS: 'timeBuffer',
} as const

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES]
