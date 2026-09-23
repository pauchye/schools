import React from 'react'
import './map.css'

const NYC_CENTER = [40.7128, -74.006]

function pinRadius(offers, maxOffers) {
  const min = 5
  const max = 20
  if (maxOffers <= 0) return min
  const scale = Math.sqrt(Math.max(0, offers) / maxOffers)
  return min + (max - min) * scale
}

function popupHtml(school) {
  const tested = school.testers.suppressed ? '≤5' : school.testers.value
  const offers = school.offers.suppressed ? '≤5' : school.offers.value
  return `
    <div class="map-popup-inner">
      <div class="map-popup-head">
        <span class="map-popup-name">${school.name}</span>
        <span class="map-popup-rate">${Math.round(school.offerRate)}%</span>
      </div>
      <div class="map-popup-bar"><div style="width:${Math.min(100, school.offerRate)}%"></div></div>
      <span class="map-popup-meta">${tested} tested &middot; ${offers} offers &middot; D${school.district}</span>
      <a href="#/school/${school.dbn}" class="map-popup-link">View school &rarr;</a>
    </div>
  `
}

class MapView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { search: '', leafletReady: !!window.L }
    this.mapNode = null
    this.map = null
    this.markersByDbn = {}
  }

  componentDidMount() {
    if (!window.L) {
      // The Leaflet CDN script tag is still loading (or failed) -- poll
      // briefly rather than assume it's unavailable.
      this.leafletPoll = setInterval(() => {
        if (window.L) {
          clearInterval(this.leafletPoll)
          this.setState({ leafletReady: true }, this.initMap)
        }
      }, 150)
      setTimeout(() => clearInterval(this.leafletPoll), 8000)
      return
    }
    this.initMap()
  }

  componentDidUpdate(prevProps) {
    if (this.map && prevProps.schools !== this.props.schools) {
      this.renderMarkers()
    }
  }

  componentWillUnmount() {
    if (this.leafletPoll) clearInterval(this.leafletPoll)
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  }

  initMap() {
    if (!this.mapNode || this.map) return
    const L = window.L
    this.map = L.map(this.mapNode, { scrollWheelZoom: true }).setView(NYC_CENTER, 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map)
    this.renderMarkers()
  }

  renderMarkers() {
    const L = window.L
    if (!L || !this.map) return
    Object.values(this.markersByDbn).forEach((m) => this.map.removeLayer(m))
    this.markersByDbn = {}

    const geocoded = this.props.schools.filter((s) => s.geo)
    const maxOffers = Math.max(1, ...geocoded.map((s) => s.offers.value))

    geocoded.forEach((school) => {
      const marker = L.circleMarker([school.geo.lat, school.geo.lng], {
        radius: pinRadius(school.offers.value, maxOffers),
        color: '#fff',
        weight: 2,
        fillColor: '#c2410c',
        fillOpacity: 0.85,
      }).addTo(this.map)
      marker.bindPopup(popupHtml(school))
      this.markersByDbn[school.dbn] = marker
    })
  }

  focusSchool(school) {
    if (!this.map || !school.geo) return
    this.map.setView([school.geo.lat, school.geo.lng], 14)
    const marker = this.markersByDbn[school.dbn]
    if (marker) marker.openPopup()
  }

  render() {
    const { schools } = this.props
    const { search } = this.state

    if (!schools.length) {
      return <div className="data-source-banner" style={{ margin: '16px 40px' }}>No admissions data has loaded yet.</div>
    }

    const geocodedCount = schools.filter((s) => s.geo).length
    const list = schools
      .filter((s) => s.geo)
      .filter((s) => !search || s.name.toUpperCase().indexOf(search.toUpperCase()) >= 0)
      .slice()
      .sort((a, b) => b.offers.value - a.offers.value)
      .slice(0, 150)

    return (
      <div className="map-page">
        <aside className="map-sidebar">
          <input
            className="map-search"
            placeholder="Search this list…"
            value={search}
            onChange={(e) => this.setState({ search: e.target.value })}
          />
          <span className="map-sidebar-hint">
            {geocodedCount} of {schools.length} schools located &middot; circle size = offers
          </span>
          <div className="map-list">
            {list.map((s) => (
              <div key={s.dbn} className="map-list-item" onClick={() => this.focusSchool(s)}>
                <div className="map-list-item-meta">
                  <span className="map-list-item-name">{s.name}</span>
                  <span className="map-list-item-sub">D{s.district} &middot; {s.offers.suppressed ? '≤5' : s.offers.value} offers</span>
                </div>
                <span className="map-list-item-rate">{Math.round(s.offerRate)}%</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="map-canvas">
          {!this.state.leafletReady && (
            <div className="map-loading">Loading map…</div>
          )}
          <div className="map-leaflet-root" ref={(el) => { this.mapNode = el }} />
        </div>
      </div>
    )
  }
}

export default MapView
