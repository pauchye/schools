import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatSuppressible } from './lib/schoolData'
import { SharedProps } from './types'
import './schoolDetail.css'

const SCHOOL_TYPE_LABEL: Record<string, string> = {
  Middle: 'Middle school',
  'K-8': 'K–8 school',
  Elementary: 'Elementary school',
}

function proficiencyBar(value: number | null): number {
  const pct = typeof value === 'number' ? Math.min(100, (value / 4.5) * 100) : 0
  return pct
}

function SchoolDetail({ schools, historyByDbn, compareDbns, savedDbns, toggleCompare, toggleSaved }: SharedProps) {
  const { dbn } = useParams<{ dbn: string }>()
  const school = schools.find((s) => s.dbn === dbn)
  const history = (dbn && historyByDbn[dbn]) || []

  if (!schools.length) return <div className="detail-page detail-loading">Loading…</div>
  if (!school) {
    return (
      <div className="detail-page detail-loading">
        School not found. <Link to="/">Back to Explore</Link>
      </div>
    )
  }

  const isCompared = compareDbns.indexOf(school.dbn) >= 0
  const isSaved = savedDbns.indexOf(school.dbn) >= 0
  const testedShare = school.students8th.value > 0 ? (school.testers.value / school.students8th.value) * 100 : 0

  return (
    <div className="detail-page">
      <div className="detail-breadcrumb">
        <Link to="/">&larr; Explore</Link> &nbsp;/&nbsp; {school.borough} &nbsp;/&nbsp; District {school.district}
      </div>
      <div className="detail-heading">
        <div>
          <h2>{school.name}</h2>
          <span className="detail-subline">
            {SCHOOL_TYPE_LABEL[school.schoolType || ''] || 'Middle school'} &middot; {school.borough} &middot; DBN {school.dbn}
            {school.enrollment ? ` · ${school.enrollment.toLocaleString()} students enrolled` : ''}
          </span>
        </div>
        <div className="detail-actions">
          <span className="btn" onClick={() => toggleSaved(school.dbn)}>{isSaved ? 'Saved' : 'Save'}</span>
          <span className={`btn btn-dark${isCompared ? ' is-active' : ''}`} onClick={() => toggleCompare(school.dbn)}>
            {isCompared ? '✓ In compare' : 'Add to compare'}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-col">
          <div className="card detail-admissions">
            <div className="detail-admissions-head">
              <span className="mono-label">FROM 8TH GRADE TO SPECIALIZED HIGH SCHOOL</span>
              {school.year && <span className="mono-value detail-admissions-year">as of {school.year}</span>}
            </div>
            <div className="detail-stat-row">
              <div className="detail-stat">
                <span className="detail-stat-value">{formatSuppressible(school.students8th)}</span>
                <span className="detail-stat-label">8th graders</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-value" style={{ color: 'var(--blue)' }}>{formatSuppressible(school.testers)}</span>
                <span className="detail-stat-label">took the SHSAT</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-value" style={{ color: 'var(--accent)' }}>{formatSuppressible(school.offers)}</span>
                <span className="detail-stat-label">received offers</span>
              </div>
              <div className="detail-stat detail-stat-divider">
                <span className="detail-stat-value">{Math.round(school.offerRate)}%</span>
                <span className="detail-stat-label">offer rate</span>
              </div>
            </div>
            <div className="detail-admissions-bar">
              <div className="detail-admissions-track">
                <div className="detail-admissions-tested" style={{ width: `${Math.min(100, testedShare)}%` }}>
                  <div className="detail-admissions-offers" style={{ width: `${Math.min(100, school.offerRate)}%` }} />
                </div>
              </div>
              <span className="detail-admissions-note">
                {Math.round(testedShare)}% of 8th graders took the test
                {school.offerRate > 0 ? `; about ${Math.round(school.offerRate)}% of them got an offer.` : '.'}
              </span>
            </div>
          </div>

          {history.length > 1 && (
            <div className="card detail-history">
              <span className="mono-label">ADMISSIONS HISTORY</span>
              <div className="detail-history-table">
                <div className="detail-history-row detail-history-head">
                  <span>Year</span>
                  <span>8th graders</span>
                  <span>Tested</span>
                  <span>Offers</span>
                  <span>Offer rate</span>
                </div>
                {history.slice().reverse().map((h) => (
                  <div className="detail-history-row" key={h.year}>
                    <span className="mono-value">{h.year}</span>
                    <span className="mono-value">{formatSuppressible(h.students8th)}</span>
                    <span className="mono-value">{formatSuppressible(h.testers)}</span>
                    <span className="mono-value">{formatSuppressible(h.offers)}</span>
                    <span className="mono-value detail-history-rate">{Math.round(h.offerRate)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card detail-quality">
            <div className="detail-quality-head">
              <span className="mono-label">SCHOOL QUALITY REPORT</span>
              <span className="detail-quality-scale">Needs improvement &rarr; Excellent</span>
            </div>
            {school.ratings.map((r) => (
              <div className="detail-quality-row" key={r.label}>
                <span>{r.label}</span>
                <div className="detail-quality-segments">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`detail-quality-segment${i < r.segments ? ' is-filled' : ''}`} />
                  ))}
                </div>
                <span className="detail-quality-label">{r.ratingLabel}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-col">
          <div className="card detail-proficiency">
            <span className="mono-label">INCOMING PROFICIENCY &middot; 5TH GRADE, OUT OF 4.5</span>
            <div className="detail-proficiency-row">
              <div className="detail-proficiency-top"><span>ELA</span><span className="mono-value">{typeof school.ela === 'number' ? school.ela.toFixed(2) : '—'}</span></div>
              <div className="detail-proficiency-track"><div className="detail-proficiency-fill" style={{ width: `${proficiencyBar(school.ela)}%` }} /></div>
            </div>
            <div className="detail-proficiency-row">
              <div className="detail-proficiency-top"><span>Math</span><span className="mono-value">{typeof school.math === 'number' ? school.math.toFixed(2) : '—'}</span></div>
              <div className="detail-proficiency-track"><div className="detail-proficiency-fill" style={{ width: `${proficiencyBar(school.math)}%` }} /></div>
            </div>
          </div>

          {school.demographics && (
            <div className="card detail-demographics">
              <span className="mono-label">STUDENT BODY</span>
              <div className="detail-demo-bar">
                <div style={{ width: `${school.demographics.asian * 100}%`, background: 'var(--accent-label)' }} />
                <div style={{ width: `${school.demographics.white * 100}%`, background: 'var(--blue)' }} />
                <div style={{ width: `${school.demographics.hispanic * 100}%`, background: 'var(--tan)' }} />
                <div style={{ width: `${school.demographics.black * 100}%`, background: 'var(--green)' }} />
                <div style={{ width: `${school.demographics.other * 100}%`, background: 'var(--ink-25)' }} />
              </div>
              <div className="detail-demo-legend">
                {([
                  ['Asian', school.demographics.asian, 'var(--accent-label)'],
                  ['White', school.demographics.white, 'var(--blue)'],
                  ['Hispanic', school.demographics.hispanic, 'var(--tan)'],
                  ['Black', school.demographics.black, 'var(--green)'],
                  ['Other', school.demographics.other, 'var(--ink-25)'],
                ] as [string, number, string][]).map(([label, value, color]) => (
                  <div className="detail-demo-legend-item" key={label}>
                    <span className="detail-demo-swatch" style={{ background: color }} />
                    <span style={{ flex: 1 }}>{label}</span>
                    <span className="mono-value">{Math.round(value * 100)}%</span>
                  </div>
                ))}
              </div>
              <div className="detail-demo-extra">
                {school.ell !== null && <div><span className="detail-demo-extra-value">{(school.ell * 100).toFixed(1)}%</span><span>English learners</span></div>}
                {school.studentsWithDisabilities !== null && <div><span className="detail-demo-extra-value">{(school.studentsWithDisabilities * 100).toFixed(1)}%</span><span>Students w/ disabilities</span></div>}
                {school.hraEligible !== null && <div><span className="detail-demo-extra-value">{Math.round(school.hraEligible * 100)}%</span><span>HRA eligible</span></div>}
              </div>
            </div>
          )}

          {(school.teachersExperienced !== null || school.chronicallyAbsent !== null || school.principalYears) && (
            <div className="card detail-staff">
              <span className="mono-label">STAFF &amp; ATTENDANCE</span>
              {school.teachersExperienced !== null && (
                <div className="detail-staff-row"><span>Teachers with 3+ years&rsquo; experience</span><span className="mono-value">{(school.teachersExperienced * 100).toFixed(1)}%</span></div>
              )}
              {school.chronicallyAbsent !== null && (
                <div className="detail-staff-row"><span>Students chronically absent</span><span className="mono-value">{(school.chronicallyAbsent * 100).toFixed(1)}%</span></div>
              )}
              {school.principalYears != null && (
                <div className="detail-staff-row"><span>Principal&rsquo;s years at this school</span><span className="mono-value">{school.principalYears}</span></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SchoolDetail
