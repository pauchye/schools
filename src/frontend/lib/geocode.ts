import { GeoByDbn, GeoRecord } from '../types'

export type SchoolGeoJson = Record<string, [number, number]>

// schoolGeo.json is a bundled { dbn: [lat, lng] } lookup (see reports/README
// for provenance) -- every NYC Open Data school-location dataset we tried
// fetching live turned out to be 403'd (jfju-ynrr, then 3bkj-34v2), so
// geocoding is baked in at build time instead of fetched at runtime.
export function buildGeoLookup(schoolGeo: SchoolGeoJson): GeoByDbn {
  const byDbn: GeoByDbn = {}
  Object.keys(schoolGeo).forEach((dbn) => {
    const [lat, lng] = schoolGeo[dbn]
    byDbn[dbn] = { dbn, lat, lng } as GeoRecord
  })
  return byDbn
}
