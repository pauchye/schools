import { districtOf, boroughOf, approxMapPosition } from './geo'
import {
  Demographics,
  FeederRecord,
  GeoByDbn,
  GeoRecord,
  HistoryByDbn,
  HistoryEntry,
  ParsedSuppressible,
  QualityReport,
  Rating,
  School,
} from '../types'

const RATING_SCALE: Record<string, { segments: number; label: string }> = {
  'Not Meeting Target': { segments: 1, label: 'Needs improvement' },
  'Approaching Target': { segments: 2, label: 'Fair' },
  'Meeting Target': { segments: 3, label: 'Good' },
  'Exceeding Target': { segments: 4, label: 'Excellent' },
}

const RATING_FIELDS: [string, keyof QualityReport][] = [
  ['Rigorous instruction', 'Rigorous Instruction Rating'],
  ['Collaborative teachers', 'Collaborative Teachers Rating'],
  ['Supportive environment', 'Supportive Environment Rating'],
  ['Effective school leadership', 'Effective School Leadership Rating'],
  ['Strong family–community ties', 'Strong Family-Community Ties Rating'],
  ['Student achievement', 'Student Achievement Rating'],
]

// NYC Open Data suppresses small counts as the string "0-5" for privacy.
// We show that as "≤5" and treat it as its midpoint for math/sorting.
export function parseSuppressible(value: string | number | undefined): ParsedSuppressible {
  if (typeof value === 'string' && /^0-5$/.test(value.trim())) {
    return { value: 3, suppressed: true }
  }
  const n = typeof value === 'number' ? value : parseFloat(value as string)
  return { value: Number.isFinite(n) ? n : 0, suppressed: false }
}

export function formatSuppressible(parsed: ParsedSuppressible): string {
  return parsed.suppressed ? '≤5' : String(parsed.value)
}

function pct(value: number | string | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

// Merge one feeder-data (admissions) row with its matching school-quality
// report row (by DBN) into a single normalized school the rest of the app
// consumes. `quality` may be undefined for a DBN with no quality report.
// `geo`, when given a match, provides a real lat/lng; otherwise the school
// falls back to the schematic (non-geocoded) map position.
export function normalizeSchool(
  feederRecord: FeederRecord,
  quality: QualityReport | undefined,
  geo: GeoRecord | undefined,
): School {
  const dbn = feederRecord.feeder_school_dbn
  const district = districtOf(dbn)
  const borough = boroughOf(district)

  const students8th = parseSuppressible(feederRecord.count_of_students_in_hs)
  const testers = parseSuppressible(feederRecord.count_of_testers)
  const offers = parseSuppressible(feederRecord.number_of_offers)
  const offerRate = testers.value > 0 ? (offers.value / testers.value) * 100 : 0

  const ratings: Rating[] = RATING_FIELDS.map(([label, field]) => {
    const raw = quality && (quality[field] as string)
    const scale = (raw && RATING_SCALE[raw]) || { segments: 0, label: '—' }
    return { label, segments: scale.segments, ratingLabel: scale.label }
  })

  const asian = quality ? pct(quality['Percent Asian']) : null
  const white = quality ? pct(quality['Percent White']) : null
  const hispanic = quality ? pct(quality['Percent Hispanic']) : null
  const black = quality ? pct(quality['Percent Black']) : null
  const knownDemo = [asian, white, hispanic, black].every((v) => v !== null)
  const demographics: Demographics | null = knownDemo
    ? {
        asian: asian as number,
        white: white as number,
        hispanic: hispanic as number,
        black: black as number,
        other: Math.max(0, 1 - (asian as number) - (white as number) - (hispanic as number) - (black as number)),
      }
    : null

  return {
    dbn,
    name: feederRecord.feeder_school_name,
    district,
    borough,
    year: feederRecord.year || null,
    students8th,
    testers,
    offers,
    offerRate,
    ela: (quality && Number(quality['Average Incoming ELA Proficiency (Based on 5th Grade)'])) || null,
    math: (quality && Number(quality['Average Incoming Math Proficiency (Based on 5th Grade)'])) || null,
    ratings,
    demographics,
    schoolType: quality ? quality['School Type'] : null,
    enrollment: quality ? quality['Enrollment'] : null,
    teachersExperienced: quality ? pct(quality['Percent of teachers with 3 or more years of experience']) : null,
    chronicallyAbsent: quality ? pct(quality['Percent of Students Chronically Absent']) : null,
    principalYears: (quality && Number(quality['Years of principal experience at this school'])) || null,
    ell: quality ? pct(quality['Percent English Language Learners']) : null,
    studentsWithDisabilities: quality ? pct(quality['Percent Students with Disabilities']) : null,
    hraEligible: quality ? pct(quality['Percent HRA Eligible']) : null,
    mapPos: approxMapPosition(dbn),
    geo: geo || null,
    isChecked: false,
  }
}

export function mergeSchools(
  feederData: FeederRecord[],
  qualityReports: QualityReport[],
  geoByDbn?: GeoByDbn,
): School[] {
  const byDbn: Record<string, QualityReport> = {}
  qualityReports.forEach((q) => { byDbn[q.DBN] = q })
  return feederData.map((rec) => normalizeSchool(rec, byDbn[rec.feeder_school_dbn], geoByDbn?.[rec.feeder_school_dbn]))
}

// One year's admissions row, normalized the same way as the "current"
// snapshot (suppressed-count handling, offer rate), for a school's history.
function normalizeYearlyAdmissions(record: FeederRecord): HistoryEntry {
  const students8th = parseSuppressible(record.count_of_students_in_hs)
  const testers = parseSuppressible(record.count_of_testers)
  const offers = parseSuppressible(record.number_of_offers)
  const offerRate = testers.value > 0 ? (offers.value / testers.value) * 100 : 0
  return { year: record.year || null, students8th, testers, offers, offerRate }
}

// The live feeder dataset carries one row per school per year; the "current"
// schools list only keeps the latest year (see dedupeByLatestYear in
// root.tsx). This builds the full history per DBN, oldest year first, for
// anything that wants to show a school's admissions over time.
export function buildHistoryByDbn(allYearsFeederData: FeederRecord[]): HistoryByDbn {
  const byDbn: HistoryByDbn = {}
  allYearsFeederData.forEach((record) => {
    const dbn = record.feeder_school_dbn
    if (!dbn) return
    if (!byDbn[dbn]) byDbn[dbn] = []
    byDbn[dbn].push(normalizeYearlyAdmissions(record))
  })
  Object.keys(byDbn).forEach((dbn) => {
    byDbn[dbn].sort((a, b) => (parseInt(a.year || '0', 10) || 0) - (parseInt(b.year || '0', 10) || 0))
  })
  return byDbn
}
