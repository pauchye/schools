import { districtOf, boroughOf, approxMapPosition } from './geo'

const RATING_SCALE = {
  'Not Meeting Target': { segments: 1, label: 'Needs improvement' },
  'Approaching Target': { segments: 2, label: 'Fair' },
  'Meeting Target': { segments: 3, label: 'Good' },
  'Exceeding Target': { segments: 4, label: 'Excellent' },
}

const RATING_FIELDS = [
  ['Rigorous instruction', 'Rigorous Instruction Rating'],
  ['Collaborative teachers', 'Collaborative Teachers Rating'],
  ['Supportive environment', 'Supportive Environment Rating'],
  ['Effective school leadership', 'Effective School Leadership Rating'],
  ['Strong family–community ties', 'Strong Family-Community Ties Rating'],
  ['Student achievement', 'Student Achievement Rating'],
]

// NYC Open Data suppresses small counts as the string "0-5" for privacy.
// We show that as "≤5" and treat it as its midpoint for math/sorting.
export function parseSuppressible(value) {
  if (typeof value === 'string' && /^0-5$/.test(value.trim())) {
    return { value: 3, suppressed: true }
  }
  const n = typeof value === 'number' ? value : parseFloat(value)
  return { value: Number.isFinite(n) ? n : 0, suppressed: false }
}

export function formatSuppressible(parsed) {
  return parsed.suppressed ? '≤5' : String(parsed.value)
}

function pct(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

// Merge one feeder-data (admissions) row with its matching school-quality
// report row (by DBN) into a single normalized school the rest of the app
// consumes. `quality` may be undefined for a DBN with no quality report.
export function normalizeSchool(feederRecord, quality) {
  const dbn = feederRecord.feeder_school_dbn
  const district = districtOf(dbn)
  const borough = boroughOf(district)

  const students8th = parseSuppressible(feederRecord.count_of_students_in_hs)
  const testers = parseSuppressible(feederRecord.count_of_testers)
  const offers = parseSuppressible(feederRecord.number_of_offers)
  const offerRate = testers.value > 0 ? (offers.value / testers.value) * 100 : 0

  const ratings = RATING_FIELDS.map(([label, field]) => {
    const raw = quality && quality[field]
    const scale = RATING_SCALE[raw] || { segments: 0, label: '—' }
    return { label, segments: scale.segments, ratingLabel: scale.label }
  })

  const asian = quality ? pct(quality['Percent Asian']) : null
  const white = quality ? pct(quality['Percent White']) : null
  const hispanic = quality ? pct(quality['Percent Hispanic']) : null
  const black = quality ? pct(quality['Percent Black']) : null
  const knownDemo = [asian, white, hispanic, black].every((v) => v !== null)
  const other = knownDemo ? Math.max(0, 1 - asian - white - hispanic - black) : null

  return {
    dbn,
    name: feederRecord.feeder_school_name,
    district,
    borough,
    students8th,
    testers,
    offers,
    offerRate,
    ela: quality ? quality['Average Incoming ELA Proficiency (Based on 5th Grade)'] || null : null,
    math: quality ? quality['Average Incoming Math Proficiency (Based on 5th Grade)'] || null : null,
    ratings,
    demographics: knownDemo ? { asian, white, hispanic, black, other } : null,
    schoolType: quality ? quality['School Type'] : null,
    enrollment: quality ? quality['Enrollment'] : null,
    teachersExperienced: quality ? pct(quality['Percent of teachers with 3 or more years of experience']) : null,
    chronicallyAbsent: quality ? pct(quality['Percent of Students Chronically Absent']) : null,
    principalYears: quality ? quality['Years of principal experience at this school'] : null,
    ell: quality ? pct(quality['Percent English Language Learners']) : null,
    studentsWithDisabilities: quality ? pct(quality['Percent Students with Disabilities']) : null,
    hraEligible: quality ? pct(quality['Percent HRA Eligible']) : null,
    mapPos: approxMapPosition(dbn),
    isChecked: false,
  }
}

export function mergeSchools(feederData, qualityReports) {
  const byDbn = {}
  qualityReports.forEach((q) => { byDbn[q.DBN] = q })
  return feederData.map((rec) => normalizeSchool(rec, byDbn[rec.feeder_school_dbn]))
}
