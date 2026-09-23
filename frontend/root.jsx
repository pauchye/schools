import React from 'react'
import { Route, HashRouter, Switch } from 'react-router-dom';
import Header from './header'
import Footer from './footer'
import Explore from './explore'
import SchoolDetail from './schoolDetail'
import Compare from './compare'
import Saved from './saved'
import MapView from './map'
import { mergeSchools } from './lib/schoolData'
import './theme.css'

const allSchoolQuality = require('./reports/schoolqrep2018.json');
const feederSeed = require('./reports/feederSeed.json')

// Socrata defaults to a 1000-row cap with an unspecified order when
// $limit/$order aren't given. This dataset now has multiple rows per
// school (one per year), so an unpaginated request can silently truncate
// whole years -- order newest-first so the current year survives even if
// something still gets cut off, and set $limit comfortably above the
// full dataset's size (~700 schools x ~8 years).
const FEEDER_API_URL = "https://data.cityofnewyork.us/resource/k8ah-28f4.json?$order=year%20DESC&$limit=50000"
const SOCRATA_APP_TOKEN = ""

function normalizeFeederRecord(record) {
  return {
    feeder_school_dbn: record.feeder_school_dbn || record.dbn,
    feeder_school_name: record.feeder_school_name || record.school_name,
    count_of_students_in_hs: record.count_of_students_in_hs || record.count_of_students_in_hs_admissions,
    count_of_testers: record.count_of_testers,
    number_of_offers: record.number_of_offers,
    year: record.year,
  }
}

// The live dataset now carries one row per school PER YEAR (it was
// consolidated from separate yearly datasets). Without this, every school
// appears several times, which both inflates the list and gives duplicate
// React keys -- breaking re-renders on sort/filter. Keep just the latest
// year's row per DBN.
function dedupeByLatestYear(records) {
  const latestByDbn = {}
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

function loadSet(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key))
    return Array.isArray(raw) ? raw : []
  } catch (error) {
    return []
  }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      schools: [],
      feederDataSource: null,
      compareDbns: loadSet('compareDbns'),
      savedDbns: loadSet('savedDbns'),
    }
    this.toggleCompare = this.toggleCompare.bind(this)
    this.toggleSaved = this.toggleSaved.bind(this)
    this.removeFromCompare = this.removeFromCompare.bind(this)
    this.clearCompare = this.clearCompare.bind(this)
  }

  componentDidMount() {
    this.loadFeederData()
  }

  setSchools(feederData, feederDataSource) {
    const schools = mergeSchools(dedupeByLatestYear(feederData), allSchoolQuality)
    const { compareDbns } = this.state
    schools.forEach((s) => { s.isChecked = compareDbns.indexOf(s.dbn) >= 0 })
    this.setState({ schools, feederDataSource })
  }

  loadFeederData() {
    const headers = SOCRATA_APP_TOKEN ? { 'X-App-Token': SOCRATA_APP_TOKEN } : {}
    fetch(FEEDER_API_URL, { headers }).then((response) => {
      if (!response.ok) throw new Error(`Feeder data request failed with status ${response.status}`)
      return response.json()
    }).then((response) => {
      const feederData = dedupeByLatestYear(response.map(normalizeFeederRecord))
      localStorage.setItem('storeData', JSON.stringify(feederData))
      this.setSchools(feederData, 'live')
    }).catch((error) => {
      console.error('Live feeder data fetch failed, falling back to cached data', error)
      this.loadFallbackFeederData()
    })
  }

  loadFallbackFeederData() {
    let cached = null
    try {
      cached = JSON.parse(localStorage.getItem('storeData'))
    } catch (error) {
      cached = null
    }
    const feederData = (Array.isArray(cached) && cached.length) ? cached : feederSeed
    localStorage.setItem('storeData', JSON.stringify(feederData))
    this.setSchools(feederData, (feederData === cached) ? 'cached' : 'seed')
  }

  toggleCompare(dbn) {
    this.setState((state) => {
      const has = state.compareDbns.indexOf(dbn) >= 0
      const compareDbns = has
        ? state.compareDbns.filter((d) => d !== dbn)
        : state.compareDbns.concat(dbn)
      const schools = state.schools.map((s) => (s.dbn === dbn ? { ...s, isChecked: !has } : s))
      localStorage.setItem('compareDbns', JSON.stringify(compareDbns))
      return { compareDbns, schools }
    })
  }

  removeFromCompare(dbn) {
    this.toggleCompare(dbn)
  }

  clearCompare() {
    this.setState((state) => {
      const schools = state.schools.map((s) => ({ ...s, isChecked: false }))
      localStorage.setItem('compareDbns', JSON.stringify([]))
      return { compareDbns: [], schools }
    })
  }

  toggleSaved(dbn) {
    this.setState((state) => {
      const has = state.savedDbns.indexOf(dbn) >= 0
      const savedDbns = has
        ? state.savedDbns.filter((d) => d !== dbn)
        : state.savedDbns.concat(dbn)
      localStorage.setItem('savedDbns', JSON.stringify(savedDbns))
      return { savedDbns }
    })
  }

  render() {
    const { schools, feederDataSource, compareDbns, savedDbns } = this.state
    const shared = {
      schools,
      feederDataSource,
      compareDbns,
      savedDbns,
      toggleCompare: this.toggleCompare,
      removeFromCompare: this.removeFromCompare,
      clearCompare: this.clearCompare,
      toggleSaved: this.toggleSaved,
    }
    return (
      <HashRouter>
        <div className="app-shell">
          <Header compareCount={compareDbns.length} savedCount={savedDbns.length} />
          <Switch>
            <Route exact path="/" render={(props) => <Explore {...props} {...shared} />} />
            <Route exact path="/school/:dbn" render={(props) => <SchoolDetail {...props} {...shared} />} />
            <Route exact path="/compare" render={(props) => <Compare {...props} {...shared} />} />
            <Route exact path="/saved" render={(props) => <Saved {...props} {...shared} />} />
            <Route exact path="/map" render={(props) => <MapView {...props} {...shared} />} />
          </Switch>
          <Footer />
        </div>
      </HashRouter>
    );
  }
}

export default App
