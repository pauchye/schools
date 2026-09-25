import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatSuppressible } from './lib/schoolData'
import { School, SharedProps } from './types'
import './compare.css'

interface CompareRow {
  section: string
  label: string
  direction: 'high' | 'low'
  raw: (s: School) => number | null
  display: (s: School) => string
}

function buildRows(schools: School[]): CompareRow[] {
  const rows: CompareRow[] = []

  rows.push({ section: 'SHSAT ADMISSIONS', label: '8th graders', direction: 'high',
    raw: (s) => s.students8th.value, display: (s) => formatSuppressible(s.students8th) })
  rows.push({ section: 'SHSAT ADMISSIONS', label: 'Took the SHSAT', direction: 'high',
    raw: (s) => s.testers.value, display: (s) => formatSuppressible(s.testers) })
  rows.push({ section: 'SHSAT ADMISSIONS', label: 'Offers', direction: 'high',
    raw: (s) => s.offers.value, display: (s) => formatSuppressible(s.offers) })
  rows.push({ section: 'SHSAT ADMISSIONS', label: 'Offer rate', direction: 'high',
    raw: (s) => s.offerRate, display: (s) => `${Math.round(s.offerRate)}%` })

  rows.push({ section: 'INCOMING PROFICIENCY (5TH GRADE)', label: 'ELA', direction: 'high',
    raw: (s) => (typeof s.ela === 'number' ? s.ela : null), display: (s) => (typeof s.ela === 'number' ? s.ela.toFixed(1) : '—') })
  rows.push({ section: 'INCOMING PROFICIENCY (5TH GRADE)', label: 'Math', direction: 'high',
    raw: (s) => (typeof s.math === 'number' ? s.math : null), display: (s) => (typeof s.math === 'number' ? s.math.toFixed(1) : '—') })

  if (schools.some((s) => s.ratings.some((r) => r.segments > 0))) {
    schools[0].ratings.forEach((_, idx) => {
      rows.push({
        section: 'SCHOOL QUALITY REPORT',
        label: schools[0].ratings[idx].label,
        direction: 'high',
        raw: (s) => s.ratings[idx].segments || null,
        display: (s) => s.ratings[idx].ratingLabel,
      })
    })
  }

  rows.push({ section: 'STAFF & ATTENDANCE', label: "Teachers with 3+ years' experience", direction: 'high',
    raw: (s) => (s.teachersExperienced !== null ? s.teachersExperienced : null),
    display: (s) => (s.teachersExperienced !== null ? `${Math.round(s.teachersExperienced * 100)}%` : '—') })
  rows.push({ section: 'STAFF & ATTENDANCE', label: 'Chronically absent', direction: 'low',
    raw: (s) => (s.chronicallyAbsent !== null ? s.chronicallyAbsent : null),
    display: (s) => (s.chronicallyAbsent !== null ? `${Math.round(s.chronicallyAbsent * 100)}%` : '—') })

  return rows
}

function Compare({ schools, compareDbns, removeFromCompare }: SharedProps) {
  const [onlyDifferences, setOnlyDifferences] = useState(false)

  const compared = compareDbns.map((dbn) => schools.find((s) => s.dbn === dbn)).filter((s): s is School => Boolean(s))

  if (!compared.length) {
    return (
      <div className="compare-page compare-empty">
        <h2>Nothing to compare yet</h2>
        <p>Select a few schools from <Link to="/">Explore</Link> to compare them side by side.</p>
      </div>
    )
  }

  const rows = buildRows(compared)

  const sections: { name: string; rows: { row: CompareRow; rawValues: (number | null)[]; best: number | null }[] }[] = []
  rows.forEach((row) => {
    const rawValues = compared.map((s) => row.raw(s))
    const known = rawValues.filter((v): v is number => v !== null)
    const best = known.length
      ? (row.direction === 'low' ? Math.min(...known) : Math.max(...known))
      : null
    const allSame = known.length === compared.length && known.every((v) => v === known[0])
    if (onlyDifferences && allSame) return
    let section = sections[sections.length - 1]
    if (!section || section.name !== row.section) {
      section = { name: row.section, rows: [] }
      sections.push(section)
    }
    section.rows.push({ row, rawValues, best })
  })

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h2>Comparing {compared.length} school{compared.length === 1 ? '' : 's'}</h2>
        <div className="compare-header-controls">
          <span className="compare-legend"><span className="compare-legend-swatch" /> Best in group</span>
          <label className="compare-diff-toggle">
            <input type="checkbox" checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)} />
            Only show differences
          </label>
        </div>
      </div>

      <div className="compare-columns" style={{ gridTemplateColumns: `240px repeat(${compared.length}, minmax(0, 1fr))` }}>
        <span />
        {compared.map((s) => (
          <div className="compare-column-card" key={s.dbn}>
            <div className="compare-column-meta">
              <span>D{s.district} &middot; {s.borough}</span>
              <span className="compare-column-remove" onClick={() => removeFromCompare(s.dbn)}>&times;</span>
            </div>
            <span className="compare-column-name">{s.name}</span>
          </div>
        ))}
      </div>

      {sections.map((section) => (
        <div className="compare-section-card" key={section.name}>
          <div className="compare-section-label">{section.name}</div>
          {section.rows.map(({ row, rawValues, best }) => (
            <div
              className="compare-row"
              key={row.label}
              style={{ gridTemplateColumns: `240px repeat(${compared.length}, minmax(0, 1fr))` }}
            >
              <span className="compare-row-label">{row.label}</span>
              {compared.map((s, idx) => {
                const isBest = best !== null && rawValues[idx] === best
                return (
                  <span key={s.dbn} className={`compare-cell${isBest ? ' is-best' : ''}`}>
                    {row.display(s)}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Compare
