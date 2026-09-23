import React from 'react'
import { Link } from 'react-router-dom'
import SchoolRow from './schoolRow'
import { formatSuppressible } from './lib/schoolData'
import './saved.css'

function exportCsv(schools) {
  const header = ['Name', 'DBN', 'District', 'Borough', '8th graders', 'Tested', 'Offers', 'Offer rate', 'ELA', 'Math']
  const rows = schools.map((s) => [
    s.name, s.dbn, s.district, s.borough,
    formatSuppressible(s.students8th), formatSuppressible(s.testers), formatSuppressible(s.offers),
    `${Math.round(s.offerRate)}%`, s.ela || '', s.math || '',
  ])
  const csv = [header].concat(rows).map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'saved-schools.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function Saved({ schools, savedDbns, compareDbns, toggleCompare, toggleSaved, removeFromCompare }) {
  const saved = savedDbns.map((dbn) => schools.find((s) => s.dbn === dbn)).filter(Boolean)
  const maxTesters = Math.max(1, ...saved.map((s) => s.testers.value))
  const compareSchools = compareDbns.map((dbn) => schools.find((s) => s.dbn === dbn)).filter(Boolean)

  return (
    <div className="saved-page">
      <div className="saved-header">
        <h2>Saved schools</h2>
        {saved.length > 0 && (
          <span className="saved-export" onClick={() => exportCsv(saved)}>Export CSV</span>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="saved-empty">
          Nothing saved yet. Tap <strong>Save</strong> on a school in <Link to="/">Explore</Link> to add it here.
        </div>
      ) : (
        <div className="results-list">
          {saved.map((school) => (
            <SchoolRow
              key={school.dbn}
              school={school}
              maxTesters={maxTesters}
              isSaved
              onToggleCompare={toggleCompare}
              onToggleSaved={toggleSaved}
            />
          ))}
        </div>
      )}

      {compareSchools.length > 0 && (
        <div className="compare-bar">
          <span className="compare-bar-count">{compareSchools.length} selected</span>
          <div className="compare-bar-chips">
            {compareSchools.map((s) => (
              <span key={s.dbn} className="compare-bar-chip" onClick={() => removeFromCompare(s.dbn)}>
                {s.name} &times;
              </span>
            ))}
          </div>
          <a href="#/compare" className="compare-bar-cta">Compare &rarr;</a>
        </div>
      )}
    </div>
  )
}

export default Saved
