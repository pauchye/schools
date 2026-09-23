// NYC Open Data's school-location datasets don't share one fixed field-name
// schema across revisions, so accept the field-name variants that have shown
// up across NYC DOE location datasets (ats_code/DBN, Latitude/latitude, ...).
export function normalizeGeoRecord(record) {
  const dbn = record.ats_system_code || record.ats_code || record.atssystemcode
    || record.DBN || record.dbn || record.location_code
  const lat = parseFloat(record.latitude || record.Latitude || record.lat)
  const lng = parseFloat(record.longitude || record.Longitude || record.lng || record.long)
  if (!dbn || !Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { dbn: String(dbn).trim(), lat, lng }
}

export function buildGeoLookup(records) {
  const byDbn = {}
  records.forEach((record) => {
    const geo = normalizeGeoRecord(record)
    if (geo) byDbn[geo.dbn] = geo
  })
  return byDbn
}
