import React from 'react'
import { Link } from 'react-router-dom'
import { formatSuppressible } from './lib/schoolData'
import { School } from './types'
import './schoolRow.css'

interface SchoolRowProps {
  school: School
  maxTesters: number
  isSaved: boolean
  onToggleCompare: (dbn: string) => void
  onToggleSaved: (dbn: string) => void
}

function SchoolRow({ school, maxTesters, isSaved, onToggleCompare, onToggleSaved }: SchoolRowProps) {
  const testedWidth = maxTesters > 0 ? (school.testers.value / maxTesters) * 100 : 0
  const offerRateLabel = `${Math.round(school.offerRate)}%`
  const ela = typeof school.ela === 'number' ? school.ela.toFixed(1) : '—'
  const math = typeof school.math === 'number' ? school.math.toFixed(1) : '—'

  return (
    <div className={`school-row${school.isChecked ? ' is-selected' : ''}`}>
      <div
        className={`school-row-check${school.isChecked ? ' is-checked' : ''}`}
        onClick={() => onToggleCompare(school.dbn)}
        role="checkbox"
        aria-checked={school.isChecked}
      >
        {school.isChecked ? '✓' : ''}
      </div>
      <Link to={`/school/${school.dbn}`} className="school-row-name">
        <span className="school-row-title">{school.name}</span>
        <span className="school-row-meta">D{school.district} &middot; {school.borough} &middot; {school.dbn}</span>
      </Link>
      <div className="school-row-bar">
        <div className="school-row-bar-track">
          <div className="school-row-bar-tested" style={{ width: `${testedWidth}%` }}>
            <div className="school-row-bar-offers" style={{ width: `${Math.min(100, school.offerRate)}%` }} />
          </div>
        </div>
        <div className="school-row-bar-labels">
          <span>{formatSuppressible(school.testers)} tested</span>
          <span>{formatSuppressible(school.offers)} offers</span>
        </div>
      </div>
      <span className="school-row-rate">{offerRateLabel}</span>
      <span className="school-row-scores">{ela} / {math}</span>
      <span className="school-row-save" onClick={() => onToggleSaved(school.dbn)}>
        {isSaved ? 'Saved' : 'Save'}
      </span>
    </div>
  )
}

export default SchoolRow
