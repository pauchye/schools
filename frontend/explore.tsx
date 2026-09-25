import React, { useMemo, useRef, useState } from 'react'
import SchoolRow from './schoolRow'
import { BOROUGHS } from './lib/geo'
import { School, SharedProps } from './types'
import './explore.css'

const DISTRICTS = [...Array(32).keys()].map((n) => n + 1).concat([79, 84])
const HISTOGRAM_BARS = [10, 25, 45, 70, 100, 88, 65, 48, 35, 25, 20, 15, 10, 5]

function debounce<Args extends unknown[]>(fn: (...args: Args) => void, time: number) {
  let handle: ReturnType<typeof setTimeout> | null = null
  return function debounced(...args: Args) {
    if (handle) clearTimeout(handle)
    handle = setTimeout(() => fn(...args), time)
  }
}

type SortBy = 'offerRate' | 'name' | 'tested' | 'offers'

function Explore({ schools, feederDataSource, compareDbns, savedDbns, toggleCompare, toggleSaved, removeFromCompare }: SharedProps) {
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('All')
  const [boroughs, setBoroughs] = useState<string[]>([])
  const [minOfferRate, setMinOfferRate] = useState(0)
  const [maxOfferRate, setMaxOfferRate] = useState(100)
  const [mathMin, setMathMin] = useState(0)
  const [schoolTypes, setSchoolTypes] = useState<string[]>(['Middle', 'K-8'])
  const [hideLowOffers, setHideLowOffers] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('offerRate')

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [debouncedSetSearch] = useState(() => debounce((value: string) => setSearch(value), 250))

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(event.target.value)
  }

  const toggleBorough = (borough: string) => {
    setBoroughs((prev) => {
      const has = prev.indexOf(borough) >= 0
      return has ? prev.filter((b) => b !== borough) : prev.concat(borough)
    })
  }

  const toggleSchoolType = (type: string) => {
    setSchoolTypes((prev) => {
      const has = prev.indexOf(type) >= 0
      return has ? prev.filter((t) => t !== type) : prev.concat(type)
    })
  }

  const resetFilters = () => {
    setSearch('')
    setDistrict('All')
    setBoroughs([])
    setMinOfferRate(0)
    setMaxOfferRate(100)
    setMathMin(0)
    setSchoolTypes(['Middle', 'K-8'])
    setHideLowOffers(false)
    if (searchInputRef.current) searchInputRef.current.value = ''
  }

  const list = useMemo(() => {
    let filtered = schools.filter((s: School) => {
      if (search && s.name.toUpperCase().indexOf(search.toUpperCase()) < 0) return false
      if (district !== 'All' && s.district !== parseInt(district, 10)) return false
      if (boroughs.length && boroughs.indexOf(s.borough) < 0) return false
      if (s.offerRate < minOfferRate || s.offerRate > maxOfferRate) return false
      if (mathMin > 0 && (typeof s.math !== 'number' || s.math < mathMin)) return false
      if (s.schoolType && schoolTypes.length && schoolTypes.indexOf(s.schoolType) < 0) return false
      if (hideLowOffers && s.offers.suppressed) return false
      return true
    })
    filtered = filtered.slice().sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'tested') return b.testers.value - a.testers.value
      if (sortBy === 'offers') return b.offers.value - a.offers.value
      return b.offerRate - a.offerRate
    })
    return filtered
  }, [schools, search, district, boroughs, minOfferRate, maxOfferRate, mathMin, schoolTypes, hideLowOffers, sortBy])

  const maxTesters = Math.max(1, ...list.map((s) => s.testers.value))
  const compareSchools = compareDbns.map((dbn) => schools.find((s) => s.dbn === dbn)).filter((s): s is School => Boolean(s))

  return (
    <div className="explore-page">
      {feederDataSource === 'cached' && (
        <div className="data-source-banner">Live admissions data is unavailable right now &mdash; showing the last data loaded in this browser.</div>
      )}
      {feederDataSource === 'seed' && (
        <div className="data-source-banner">
          Live admissions data is unavailable right now, and no data has been cached in this browser yet
          {schools.length === 0 ? ' — there is no fallback data to show.' : ' — showing a small bundled snapshot, which may be out of date.'}
        </div>
      )}
      <section className="explore-hero">
        <div className="explore-hero-copy">
          <span className="kicker">SHSAT OFFERS BY SENDING MIDDLE SCHOOL</span>
          <h2>Where do NYC's specialized high schools <em>get their students?</em></h2>
        </div>
        <div className="explore-search">
          <div className="explore-search-bar">
            <input
              className="explore-search-input"
              placeholder="Search a middle school…"
              defaultValue={search}
              ref={searchInputRef}
              onChange={handleSearchInput}
            />
            <select
              className="explore-search-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="All">All districts</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>District {d}</option>)}
            </select>
          </div>
          <span className="explore-search-hint">Try &ldquo;Mark Twain&rdquo;, &ldquo;District 26&rdquo;, or a borough filter below</span>
        </div>
      </section>

      <div className="explore-body">
        <aside className="explore-filters">
          <div className="explore-filters-head">
            <span style={{ fontWeight: 600, fontSize: 15 }}>Filters</span>
            <span className="explore-filters-reset" onClick={resetFilters}>Reset</span>
          </div>

          <div className="filter-group">
            <span className="mono-label">BOROUGH</span>
            <div className="chip-row">
              {BOROUGHS.map((b) => (
                <span
                  key={b}
                  className={`chip${boroughs.indexOf(b) >= 0 ? ' is-selected' : ''}`}
                  onClick={() => toggleBorough(b)}
                >
                  {b === 'Staten Island' ? 'Staten Is.' : b}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="mono-label">DISTRICT</span>
            <select
              className="filter-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="All">All districts (1&ndash;32, 79, 84)</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>District {d}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <div className="filter-group-head">
              <span className="mono-label">OFFER RATE</span>
              <span className="mono-value">{minOfferRate}&ndash;{maxOfferRate}%</span>
            </div>
            <div className="histogram">
              {HISTOGRAM_BARS.map((h, i) => (
                <div
                  key={i}
                  className="histogram-bar"
                  style={{
                    height: `${h}%`,
                    background: (i / HISTOGRAM_BARS.length) * 100 >= minOfferRate && (i / HISTOGRAM_BARS.length) * 100 <= maxOfferRate
                      ? 'var(--accent-label)' : 'var(--ink-15)',
                  }}
                />
              ))}
            </div>
            <div className="range-pair">
              <input type="range" min="0" max="100" value={minOfferRate}
                onChange={(e) => setMinOfferRate(Math.min(Number(e.target.value), maxOfferRate))} />
              <input type="range" min="0" max="100" value={maxOfferRate}
                onChange={(e) => setMaxOfferRate(Math.max(Number(e.target.value), minOfferRate))} />
            </div>
          </div>

          <div className="filter-group">
            <span className="mono-label">INCOMING MATH PROFICIENCY</span>
            <div className="segmented">
              {[{ v: 0, l: 'Any' }, { v: 3.0, l: '3.0+' }, { v: 3.5, l: '3.5+' }].map((opt) => (
                <span
                  key={opt.v}
                  className={`segmented-option${mathMin === opt.v ? ' is-active' : ''}`}
                  onClick={() => setMathMin(opt.v)}
                >
                  {opt.l}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="mono-label">SCHOOL TYPE</span>
            <div className="checkbox-list">
              {['Middle', 'K-8'].map((type) => (
                <label key={type} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={schoolTypes.indexOf(type) >= 0}
                    onChange={() => toggleSchoolType(type)}
                  />
                  {type === 'Middle' ? 'Middle school (6–8)' : 'K–8'}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-toggle-row">
            <span>Hide schools with ≤5 offers</span>
            <div
              className={`toggle${hideLowOffers ? ' is-on' : ''}`}
              onClick={() => setHideLowOffers(!hideLowOffers)}
            >
              <div className="toggle-knob" />
            </div>
          </div>
        </aside>

        <main className="explore-results">
          <div className="explore-results-head">
            <span className="results-count">{list.length} middle school{list.length === 1 ? '' : 's'}</span>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              <option value="offerRate">Sort: Offer rate</option>
              <option value="name">Sort: Name</option>
              <option value="tested">Sort: Most tested</option>
              <option value="offers">Sort: Most offers</option>
            </select>
          </div>
          <div className="results-column-labels">
            <span />
            <span>SCHOOL</span>
            <span>TESTED &rarr; OFFERS</span>
            <span style={{ textAlign: 'right' }}>OFFER RATE</span>
            <span style={{ textAlign: 'right' }}>ELA / MATH</span>
            <span />
          </div>
          <div className="results-list">
            {list.length === 0 && schools.length === 0 && (
              <div className="results-empty">No admissions data has loaded yet. Try again in a bit.</div>
            )}
            {list.length === 0 && schools.length > 0 && (
              <div className="results-empty">No schools match these filters. <span className="explore-filters-reset" onClick={resetFilters}>Reset filters</span></div>
            )}
            {list.map((school) => (
              <SchoolRow
                key={school.dbn}
                school={school}
                maxTesters={maxTesters}
                isSaved={savedDbns.indexOf(school.dbn) >= 0}
                onToggleCompare={toggleCompare}
                onToggleSaved={toggleSaved}
              />
            ))}
          </div>
        </main>
      </div>

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

export default Explore
