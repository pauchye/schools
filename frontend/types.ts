// Shared data shapes used across the app. Kept pragmatic rather than
// exhaustive: fields the code actually reads are typed precisely, the raw
// quality-report JSON's many untouched columns stay loose.

export interface ParsedSuppressible {
  value: number
  suppressed: boolean
}

export interface Rating {
  label: string
  segments: number
  ratingLabel: string
}

export interface Demographics {
  asian: number
  white: number
  hispanic: number
  black: number
  other: number
}

export interface GeoRecord {
  dbn: string
  lat: number
  lng: number
}

export interface MapPosition {
  x: number
  y: number
}

export interface School {
  dbn: string
  name: string
  district: number
  borough: string
  year: string | null
  students8th: ParsedSuppressible
  testers: ParsedSuppressible
  offers: ParsedSuppressible
  offerRate: number
  ela: number | null
  math: number | null
  ratings: Rating[]
  demographics: Demographics | null
  schoolType: string | null
  enrollment: number | null
  teachersExperienced: number | null
  chronicallyAbsent: number | null
  principalYears: number | null
  ell: number | null
  studentsWithDisabilities: number | null
  hraEligible: number | null
  mapPos: MapPosition
  geo: GeoRecord | null
  isChecked: boolean
}

export interface HistoryEntry {
  year: string | null
  students8th: ParsedSuppressible
  testers: ParsedSuppressible
  offers: ParsedSuppressible
  offerRate: number
}

export type HistoryByDbn = Record<string, HistoryEntry[]>
export type GeoByDbn = Record<string, GeoRecord>

// Raw admissions row, straight off the feeder-data API (one row per
// school per year) after normalizeFeederRecord's field-name coercion.
export interface FeederRecord {
  feeder_school_dbn: string
  feeder_school_name: string
  count_of_students_in_hs: string | number
  count_of_testers: string | number
  number_of_offers: string | number
  year: string
}

// The bundled school-quality-report JSON. Only the fields schoolData.js
// actually reads are named; the report has ~40 columns total.
export interface QualityReport {
  DBN: string
  'School Name': string
  'School Type': string
  'Enrollment': number
  'Rigorous Instruction Rating': string
  'Collaborative Teachers Rating': string
  'Supportive Environment Rating': string
  'Effective School Leadership Rating': string
  'Strong Family-Community Ties Rating': string
  'Student Achievement Rating': string
  'Average Incoming ELA Proficiency (Based on 5th Grade)': number | string
  'Average Incoming Math Proficiency (Based on 5th Grade)': number | string
  'Percent English Language Learners': number | string
  'Percent Students with Disabilities': number | string
  'Percent in Temp Housing': number | string
  'Percent HRA Eligible': number | string
  'Percent Asian': number | string
  'Percent Black': number | string
  'Percent Hispanic': number | string
  'Percent White': number | string
  'Years of principal experience at this school': number | string
  'Percent of teachers with 3 or more years of experience': number | string
  'Percent of Students Chronically Absent': number | string
  [otherColumn: string]: unknown
}

// The shared prop bundle every route receives from root.tsx.
export interface SharedProps {
  schools: School[]
  historyByDbn: HistoryByDbn
  feederDataSource: 'live' | 'cached' | 'seed' | null
  compareDbns: string[]
  savedDbns: string[]
  toggleCompare: (dbn: string) => void
  removeFromCompare: (dbn: string) => void
  clearCompare: () => void
  toggleSaved: (dbn: string) => void
}
