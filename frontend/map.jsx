import React from 'react'
import { Link } from 'react-router-dom'
import './map.css'

function pinSize(offers, maxOffers) {
  const min = 14
  const max = 44
  if (maxOffers <= 0) return min
  const scale = Math.sqrt(Math.max(0, offers) / maxOffers)
  return Math.round(min + (max - min) * scale)
}

class MapView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { search: '', activeDbn: null }
  }

  render() {
    const { schools, feederDataSource } = this.props
    const { search, activeDbn } = this.state
    const list = schools
      .filter((s) => !search || s.name.toUpperCase().indexOf(search.toUpperCase()) >= 0)
      .slice()
      .sort((a, b) => b.offers.value - a.offers.value)
      .slice(0, 60)
    const maxOffers = Math.max(1, ...list.map((s) => s.offers.value))
    const active = list.find((s) => s.dbn === activeDbn) || list[0]

    if (feederDataSource === 'seed' && schools.length === 0) {
      return (
        <div className="data-source-banner" style={{ margin: '16px 40px' }}>
          Live admissions data is unavailable right now, and there is no fallback data to show.
        </div>
      )
    }

    return (
      <div className="map-page">
        <aside className="map-sidebar">
          <input
            className="map-search"
            placeholder="Search this list…"
            value={search}
            onChange={(e) => this.setState({ search: e.target.value })}
          />
          <span className="map-sidebar-hint">{list.length} schools shown &middot; circle size = offers</span>
          <div className="map-list">
            {list.map((s) => (
              <div
                key={s.dbn}
                className={`map-list-item${active && s.dbn === active.dbn ? ' is-active' : ''}`}
                onClick={() => this.setState({ activeDbn: s.dbn })}
              >
                <div className="map-list-item-meta">
                  <span className="map-list-item-name">{s.name}</span>
                  <span className="map-list-item-sub">D{s.district} &middot; {formatOffers(s)} offers</span>
                </div>
                <span className="map-list-item-rate">{Math.round(s.offerRate)}%</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="map-canvas">
          <span className="map-caption">Schematic district-based positions &mdash; not exact addresses</span>
          <div className="map-zoom">
            <span>+</span>
            <span>&minus;</span>
          </div>
          {list.map((s) => (
            <div
              key={s.dbn}
              className={`map-pin${active && s.dbn === active.dbn ? ' is-active' : ''}`}
              style={{
                left: `${s.mapPos.x * 100}%`,
                top: `${s.mapPos.y * 100}%`,
                width: pinSize(s.offers.value, maxOffers),
                height: pinSize(s.offers.value, maxOffers),
              }}
              onClick={() => this.setState({ activeDbn: s.dbn })}
            />
          ))}
          {active && (
            <div
              className="map-popup"
              style={{ left: `${active.mapPos.x * 100}%`, top: `${active.mapPos.y * 100}%` }}
            >
              <div className="map-popup-head">
                <span className="map-popup-name">{active.name}</span>
                <span className="map-popup-rate">{Math.round(active.offerRate)}%</span>
              </div>
              <div className="map-popup-bar">
                <div style={{ width: `${Math.min(100, active.offerRate)}%` }} />
              </div>
              <span className="map-popup-meta">{formatTested(active)} tested &middot; {formatOffers(active)} offers &middot; D{active.district}</span>
              <Link to={`/school/${active.dbn}`} className="map-popup-link">View school &rarr;</Link>
            </div>
          )}
        </div>
      </div>
    )
  }
}

function formatOffers(s) {
  return s.offers.suppressed ? '≤5' : s.offers.value
}

function formatTested(s) {
  return s.testers.suppressed ? '≤5' : s.testers.value
}

export default MapView
