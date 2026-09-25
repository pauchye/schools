import { useCallback, useEffect, useMemo, useState } from 'react'
import { Route, HashRouter, Routes } from 'react-router-dom'
import Header from './header'
import Footer from './footer'
import Explore from './explore'
import SchoolDetail from './schoolDetail'
import Compare from './compare'
import Saved from './saved'
import MapView from './map'
import { mergeSchools, buildHistoryByDbn } from './lib/schoolData'
import { buildGeoLookup, SchoolGeoJson } from './lib/geocode'
import { FeederRecord, HistoryByDbn, QualityReport, SharedProps } from './types'
import allSchoolQualityJson from './reports/schoolqrep2018.json'
import feederSeedJson from './reports/feederSeed.json'
// DBN -> [lat, lng] for open DOE schools, compiled from NYC Public Schools /
// NYC OpenData directory data by schools.publicworks.nyc (credited per its
// data license) and vendored here since every live NYC Open Data school-
// location dataset we tried fetching at runtime turned out to be 403'd.
import schoolGeoJson from './reports/schoolGeo.json'
import './theme.css'

const allSchoolQuality = allSchoolQualityJson as unknown as QualityReport[]
const feederSeed = feederSeedJson as unknown as FeederRecord[]
const schoolGeo = schoolGeoJson as unknown as SchoolGeoJson

// Computed once -- the bundled lookup never changes at runtime, so there's
// no reason for it to live in component state.
const geoByDbn = buildGeoLookup(schoolGeo)

// Socrata defaults to a 1000-row cap with an unspecified order when
// $limit/$order aren't given. This dataset now has multiple rows per
// school (one per year), so an unpaginated request can silently truncate
// whole years -- order newest-first so the current year survives even if
// something still gets cut off, and set $limit comfortably above the
// full dataset's size (~700 schools x ~8 years).
const FEEDER_API_URL = "https://data.cityofnewyork.us/resource/k8ah-28f4.json?$order=year%20DESC&$limit=50000"
const SOCRATA_APP_TOKEN = ""

function normalizeFeederRecord(record: any): FeederRecord {
  return {
    feeder_school_dbn: record.feeder_school_dbn || record.dbn,
    feeder_school_name: record.feeder_school_name || record.school_name,
    count_of_students_in_hs: record.count_of_students_in_hs || record.count_of_students_in_hs_admissions,
    count_of_testers: record.count_of_testers,
    number_of_offers: record.number_of_offers,
    year: record.year,
  }
}

type FeederRecordWithYear = FeederRecord & { __year: number }

// The live dataset now carries one row per school PER YEAR (it was
// consolidated from separate yearly datasets). Without this, every school
// appears several times, which both inflates the list and gives duplicate
// React keys -- breaking re-renders on sort/filter. Keep just the latest
// year's row per DBN.
function dedupeByLatestYear(records: FeederRecord[]): FeederRecord[] {
  const latestByDbn: Record<string, FeederRecordWithYear> = {}
  records.forEach((record) => {
    const dbn = record.feeder_school_dbn
    if (!dbn) return
    const year = parseInt(record.year, 10) || 0
    const existing = latestByDbn[dbn]
    if (!existing || year >= existing.__year) {
      latestByDbn[dbn] = Object.assign({}, record, { __year: year })
    }
  })
  return Object.keys(latestByDbn).map((dbn) => {
    const { __year, ...rest } = latestByDbn[dbn]
    return rest
  })
}

function loadSet(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null')
    return Array.isArray(raw) ? raw : []
  } catch (error) {
    return []
  }
}

function App() {
  const [rawFeederData, setRawFeederData] = useState<FeederRecord[]>([])
  const [historyByDbn, setHistoryByDbn] = useState<HistoryByDbn>({})
  const [feederDataSource, setFeederDataSource] = useState<SharedProps['feederDataSource']>(null)
  const [compareDbns, setCompareDbns] = useState<string[]>(() => loadSet('compareDbns'))
  const [savedDbns, setSavedDbns] = useState<string[]>(() => loadSet('savedDbns'))

  const schools = useMemo(() => {
    const merged = mergeSchools(rawFeederData, allSchoolQuality, geoByDbn)
    merged.forEach((s) => { s.isChecked = compareDbns.indexOf(s.dbn) >= 0 })
    return merged
  }, [rawFeederData, compareDbns])

  const setSchools = useCallback((feederData: FeederRecord[], source: SharedProps['feederDataSource'], allYearsData?: FeederRecord[]) => {
    setRawFeederData(dedupeByLatestYear(feederData))
    setHistoryByDbn(buildHistoryByDbn(allYearsData || feederData))
    setFeederDataSource(source)
  }, [])

  const loadFallbackFeederData = useCallback(() => {
    let cached: FeederRecord[] | null = null
    try {
      cached = JSON.parse(localStorage.getItem('storeData') || 'null')
    } catch (error) {
      cached = null
    }
    let cachedHistory: FeederRecord[] | null = null
    try {
      cachedHistory = JSON.parse(localStorage.getItem('storeDataHistory') || 'null')
    } catch (error) {
      cachedHistory = null
    }
    const feederData = (Array.isArray(cached) && cached.length) ? cached : feederSeed
    localStorage.setItem('storeData', JSON.stringify(feederData))
    setSchools(
      feederData,
      (feederData === cached) ? 'cached' : 'seed',
      (Array.isArray(cachedHistory) && cachedHistory.length) ? cachedHistory : feederData,
    )
  }, [setSchools])

  const loadFeederData = useCallback(() => {
    const headers: Record<string, string> = SOCRATA_APP_TOKEN ? { 'X-App-Token': SOCRATA_APP_TOKEN } : {}
    fetch(FEEDER_API_URL, { headers }).then((response) => {
      if (!response.ok) throw new Error(`Feeder data request failed with status ${response.status}`)
      return response.json()
    }).then((response) => {
      const allYearsData = response.map(normalizeFeederRecord)
      const feederData = dedupeByLatestYear(allYearsData)
      localStorage.setItem('storeData', JSON.stringify(feederData))
      // Cached separately from storeData (which the compare-duplicate and
      // sort/filter fixes rely on staying one-row-per-school) so a school's
      // year-over-year history survives into the cached/fallback path too.
      localStorage.setItem('storeDataHistory', JSON.stringify(allYearsData))
      setSchools(feederData, 'live', allYearsData)
    }).catch((error) => {
      console.error('Live feeder data fetch failed, falling back to cached data', error)
      loadFallbackFeederData()
    })
  }, [setSchools, loadFallbackFeederData])

  useEffect(() => {
    loadFeederData()
    // Only ever needs to run once on mount -- loadFeederData's identity can
    // change across renders (it closes over loadFallbackFeederData), but
    // re-fetching on every such change isn't the intent here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleCompare = useCallback((dbn: string) => {
    setCompareDbns((prev) => {
      const has = prev.indexOf(dbn) >= 0
      const next = has ? prev.filter((d) => d !== dbn) : prev.concat(dbn)
      localStorage.setItem('compareDbns', JSON.stringify(next))
      return next
    })
  }, [])

  const removeFromCompare = toggleCompare

  const clearCompare = useCallback(() => {
    setCompareDbns([])
    localStorage.setItem('compareDbns', JSON.stringify([]))
  }, [])

  const toggleSaved = useCallback((dbn: string) => {
    setSavedDbns((prev) => {
      const has = prev.indexOf(dbn) >= 0
      const next = has ? prev.filter((d) => d !== dbn) : prev.concat(dbn)
      localStorage.setItem('savedDbns', JSON.stringify(next))
      return next
    })
  }, [])

  const shared: SharedProps = {
    schools,
    historyByDbn,
    feederDataSource,
    compareDbns,
    savedDbns,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    toggleSaved,
  }

  return (
    <HashRouter>
      <div className="app-shell">
        <Header compareCount={compareDbns.length} savedCount={savedDbns.length} />
        <Routes>
          <Route path="/" element={<Explore {...shared} />} />
          <Route path="/school/:dbn" element={<SchoolDetail {...shared} />} />
          <Route path="/compare" element={<Compare {...shared} />} />
          <Route path="/saved" element={<Saved {...shared} />} />
          <Route path="/map" element={<MapView {...shared} />} />
        </Routes>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App
