import { useEffect, useRef, useState } from 'react'
import { School, SharedProps } from './types'
import './map.css'

// Leaflet is loaded via a CDN <script> tag (see index.html), not an npm
// import -- that sidesteps webpack's asset-loader config for the CSS's
// embedded image url()s. There's no @types/leaflet to match a
// CDN-pinned global, so the boundary is typed loosely on purpose.
declare global {
  interface Window {
    L: any
  }
}

const NYC_CENTER: [number, number] = [40.7128, -74.006]

function pinRadius(offers: number, maxOffers: number): number {
  const min = 5
  const max = 20
  if (maxOffers <= 0) return min
  const scale = Math.sqrt(Math.max(0, offers) / maxOffers)
  return min + (max - min) * scale
}

function popupHtml(school: School): string {
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

function MapView({ schools }: SharedProps) {
  const [search, setSearch] = useState('')
  const [leafletReady, setLeafletReady] = useState(!!window.L)
  const mapNodeRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markersByDbnRef = useRef<Record<string, any>>({})

  // Map creation/teardown -- waits for the Leaflet CDN script if it hasn't
  // loaded yet, since componentDidMount-equivalent timing can beat the
  // <script> tag's onload.
  useEffect(() => {
    let pollHandle: ReturnType<typeof setInterval> | null = null
    let pollTimeout: ReturnType<typeof setTimeout> | null = null

    function initMap() {
      if (!mapNodeRef.current || mapRef.current) return
      const L = window.L
      const map = L.map(mapNodeRef.current, { scrollWheelZoom: true }).setView(NYC_CENTER, 11)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)
      mapRef.current = map
      setLeafletReady(true)
    }

    if (!window.L) {
      // The Leaflet CDN script tag is still loading (or failed) -- poll
      // briefly rather than assume it's unavailable.
      pollHandle = setInterval(() => {
        if (window.L) {
          if (pollHandle) clearInterval(pollHandle)
          initMap()
        }
      }, 150)
      pollTimeout = setTimeout(() => { if (pollHandle) clearInterval(pollHandle) }, 8000)
    } else {
      initMap()
    }

    return () => {
      if (pollHandle) clearInterval(pollHandle)
      if (pollTimeout) clearTimeout(pollTimeout)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Leaflet caches its container's pixel size at init time and only
  // recalculates it via invalidateSize(). If that drifts from the real
  // on-screen size afterward -- a window resize, devtools opening/closing,
  // or any late layout shift -- pan/zoom targets computed from the stale
  // size land visually offset, even though markers (plain DOM/SVG
  // positioning) still render in the right spot. Re-sync on resize, plus
  // once shortly after mount to catch any layout settling from the async
  // Google Fonts/FontAwesome CSS.
  useEffect(() => {
    const handleResize = () => { if (mapRef.current) mapRef.current.invalidateSize() }
    window.addEventListener('resize', handleResize)
    const settleTimeout = setTimeout(handleResize, 300)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(settleTimeout)
    }
  }, [])

  // Redraw markers whenever the map becomes ready or the schools data
  // changes (new fetch, compare toggling recomputing the schools array, ...).
  useEffect(() => {
    const L = window.L
    const map = mapRef.current
    if (!L || !map) return

    Object.values(markersByDbnRef.current).forEach((m: any) => map.removeLayer(m))
    markersByDbnRef.current = {}

    const geocoded = schools.filter((s) => s.geo)
    const maxOffers = Math.max(1, ...geocoded.map((s) => s.offers.value))

    geocoded.forEach((school) => {
      const marker = L.circleMarker([school.geo!.lat, school.geo!.lng], {
        radius: pinRadius(school.offers.value, maxOffers),
        color: '#fff',
        weight: 2,
        fillColor: '#c2410c',
        fillOpacity: 0.85,
      }).addTo(map)
      marker.bindPopup(popupHtml(school))
      markersByDbnRef.current[school.dbn] = marker
    })
  }, [schools, leafletReady])

  function focusSchool(school: School) {
    const map = mapRef.current
    if (!map || !school.geo) return
    map.setView([school.geo.lat, school.geo.lng], 14)
    const marker = markersByDbnRef.current[school.dbn]
    if (marker) marker.openPopup()
  }

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
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="map-sidebar-hint">
          {geocodedCount} of {schools.length} schools located &middot; circle size = offers
        </span>
        <div className="map-list">
          {list.map((s) => (
            <div key={s.dbn} className="map-list-item" onClick={() => focusSchool(s)}>
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
        {!leafletReady && (
          <div className="map-loading">Loading map…</div>
        )}
        <div className="map-leaflet-root" ref={mapNodeRef} />
      </div>
    </div>
  )
}

export default MapView
