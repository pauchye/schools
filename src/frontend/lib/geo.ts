import { MapPosition } from '../types'

// NYC's 32 community school districts (plus the citywide 75/79/84 program
// codes) have fixed, well-known borough assignments -- this needs no
// external geodata.
const DISTRICT_BOROUGH: Record<number, string> = {
  1: 'Manhattan', 2: 'Manhattan', 3: 'Manhattan', 4: 'Manhattan', 5: 'Manhattan', 6: 'Manhattan',
  7: 'Bronx', 8: 'Bronx', 9: 'Bronx', 10: 'Bronx', 11: 'Bronx', 12: 'Bronx',
  13: 'Brooklyn', 14: 'Brooklyn', 15: 'Brooklyn', 16: 'Brooklyn', 17: 'Brooklyn', 18: 'Brooklyn',
  19: 'Brooklyn', 20: 'Brooklyn', 21: 'Brooklyn', 22: 'Brooklyn', 23: 'Brooklyn', 32: 'Brooklyn',
  24: 'Queens', 25: 'Queens', 26: 'Queens', 27: 'Queens', 28: 'Queens', 29: 'Queens', 30: 'Queens',
  31: 'Staten Island',
}

export function districtOf(dbn: string): number {
  return parseInt(dbn.slice(0, 2), 10)
}

export function boroughOf(district: number): string {
  return DISTRICT_BOROUGH[district] || 'Citywide'
}

export const BOROUGHS = ['Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island']

// Schematic (not literal-address) positions for the abstract map: each
// borough gets a hand-placed region in roughly its real relative position,
// each district a fixed anchor within that region, and each school a small
// deterministic offset from its district anchor so points spread out
// without claiming to be real geocoding.
const BOROUGH_ANCHOR: Record<string, MapPosition> = {
  Manhattan: { x: 0.46, y: 0.42 },
  Bronx: { x: 0.52, y: 0.14 },
  Brooklyn: { x: 0.5, y: 0.68 },
  Queens: { x: 0.72, y: 0.42 },
  'Staten Island': { x: 0.14, y: 0.82 },
  Citywide: { x: 0.46, y: 0.42 },
}

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

export function approxMapPosition(dbn: string): MapPosition {
  const district = districtOf(dbn)
  const borough = boroughOf(district)
  const anchor = BOROUGH_ANCHOR[borough]
  const h = hashString(dbn)
  // Deterministic per-DBN jitter within the borough region, and a smaller
  // per-district clustering offset so schools in the same district land
  // near each other.
  const districtAngle = (district * 47) % 360
  const districtRadius = 0.05
  const dx = Math.cos((districtAngle * Math.PI) / 180) * districtRadius
  const dy = Math.sin((districtAngle * Math.PI) / 180) * districtRadius
  const jitterX = (((h % 1000) / 1000) - 0.5) * 0.06
  const jitterY = ((((h >> 10) % 1000) / 1000) - 0.5) * 0.06
  const x = Math.min(0.95, Math.max(0.05, anchor.x + dx + jitterX))
  const y = Math.min(0.95, Math.max(0.05, anchor.y + dy + jitterY))
  return { x, y }
}
