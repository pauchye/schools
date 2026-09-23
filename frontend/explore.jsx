import React from 'react'
import SchoolRow from './schoolRow'
import { BOROUGHS } from './lib/geo'
import './explore.css'

const DISTRICTS = [...Array(32).keys()].map((n) => n + 1).concat([79, 84])
const HISTOGRAM_BARS = [10, 25, 45, 70, 100, 88, 65, 48, 35, 25, 20, 15, 10, 5]

function debounce(fn, time) {
  let handle = null
  return function debounced(...args) {
    if (handle) clearTimeout(handle)
    handle = setTimeout(() => fn.apply(this, args), time)
  }
}

class Explore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      district: 'All',
      boroughs: [],
      minOfferRate: 0,
      maxOfferRate: 100,
      mathMin: 0,
      schoolTypes: ['Middle', 'K-8'],
      hideLowOffers: false,
      sortBy: 'offerRate',
    }
    this.debouncedSetSearch = debounce((value) => this.setState({ search: value }), 250)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.toggleBorough = this.toggleBorough.bind(this)
    this.toggleSchoolType = this.toggleSchoolType.bind(this)
    this.resetFilters = this.resetFilters.bind(this)
  }

  handleSearchInput(event) {
    this.debouncedSetSearch(event.target.value)
  }

  toggleBorough(borough) {
    this.setState((state) => {
      const has = state.boroughs.indexOf(borough) >= 0
      return { boroughs: has ? state.boroughs.filter((b) => b !== borough) : state.boroughs.concat(borough) }
    })
  }

  toggleSchoolType(type) {
    this.setState((state) => {
      const has = state.schoolTypes.indexOf(type) >= 0
      return { schoolTypes: has ? state.schoolTypes.filter((t) => t !== type) : state.schoolTypes.concat(type) }
    })
  }

  resetFilters() {
    this.setState({
      search: '', district: 'All', boroughs: [], minOfferRate: 0, maxOfferRate: 100,
      mathMin: 0, schoolTypes: ['Middle', 'K-8'], hideLowOffers: false,
    })
    if (this.searchInputRef) this.searchInputRef.value = ''
  }

  filteredSchools() {
    const { schools } = this.props
    const { search, district, boroughs, minOfferRate, maxOfferRate, mathMin, schoolTypes, hideLowOffers, sortBy } = this.state
    let list = schools.filter((s) => {
      if (search && s.name.toUpperCase().indexOf(search.toUpperCase()) < 0) return false
      if (district !== 'All' && s.district !== parseInt(district, 10)) return false
      if (boroughs.length && boroughs.indexOf(s.borough) < 0) return false
      if (s.offerRate < minOfferRate || s.offerRate > maxOfferRate) return false
      if (mathMin > 0 && (typeof s.math !== 'number' || s.math < mathMin)) return false
      if (s.schoolType && schoolTypes.length && schoolTypes.indexOf(s.schoolType) < 0) return false
      if (hideLowOffers && s.offers.suppressed) return false
      return true
    })
    list = list.slice().sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'tested') return b.testers.value - a.testers.value
      if (sortBy === 'offers') return b.offers.value - a.offers.value
      return b.offerRate - a.offerRate
    })
    return list
  }

  render() {
    const { schools, feederDataSource, compareDbns, savedDbns, toggleCompare, toggleSaved, removeFromCompare } = this.props
    const { district, boroughs, minOfferRate, maxOfferRate, mathMin, schoolTypes, hideLowOffers, sortBy } = this.state
    const list = this.filteredSchools()
    const maxTesters = Math.max(1, ...list.map((s) => s.testers.value))
    const compareSchools = compareDbns.map((dbn) => this.props.schools.find((s) => s.dbn === dbn)).filter(Boolean)

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
                defaultValue={this.state.search}
                ref={(el) => { this.searchInputRef = el }}
                onChange={this.handleSearchInput}
              />
              <select
                className="explore-search-district"
                value={district}
                onChange={(e) => this.setState({ district: e.target.value })}
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
              <span className="explore-filters-reset" onClick={this.resetFilters}>Reset</span>
            </div>

            <div className="filter-group">
              <span className="mono-label">BOROUGH</span>
              <div className="chip-row">
                {BOROUGHS.map((b) => (
                  <span
                    key={b}
                    className={`chip${boroughs.indexOf(b) >= 0 ? ' is-selected' : ''}`}
                    onClick={() => this.toggleBorough(b)}
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
                onChange={(e) => this.setState({ district: e.target.value })}
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
                  onChange={(e) => this.setState({ minOfferRate: Math.min(Number(e.target.value), maxOfferRate) })} />
                <input type="range" min="0" max="100" value={maxOfferRate}
                  onChange={(e) => this.setState({ maxOfferRate: Math.max(Number(e.target.value), minOfferRate) })} />
              </div>
            </div>

            <div className="filter-group">
              <span className="mono-label">INCOMING MATH PROFICIENCY</span>
              <div className="segmented">
                {[{ v: 0, l: 'Any' }, { v: 3.0, l: '3.0+' }, { v: 3.5, l: '3.5+' }].map((opt) => (
                  <span
                    key={opt.v}
                    className={`segmented-option${mathMin === opt.v ? ' is-active' : ''}`}
                    onClick={() => this.setState({ mathMin: opt.v })}
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
                      onChange={() => this.toggleSchoolType(type)}
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
                onClick={() => this.setState({ hideLowOffers: !hideLowOffers })}
              >
                <div className="toggle-knob" />
              </div>
            </div>
          </aside>

          <main className="explore-results">
            <div className="explore-results-head">
              <span className="results-count">{list.length} middle school{list.length === 1 ? '' : 's'}</span>
              <select className="sort-select" value={sortBy} onChange={(e) => this.setState({ sortBy: e.target.value })}>
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
                <div className="results-empty">No schools match these filters. <span className="explore-filters-reset" onClick={this.resetFilters}>Reset filters</span></div>
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
}

export default Explore
