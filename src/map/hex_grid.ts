export const HEX_CHUNK_SIZE = 4

export interface AxialCoord {
  q: number
  r: number
}

export interface PixelCoord {
  x: number
  y: number
}

export function wrap_q(q: number, width: number): number {
  return ((q % width) + width) % width
}

export function sphere_spread(r: number, height: number): number {
  const lat = (r / (height - 1) - 0.5) * Math.PI
  return Math.cos(lat)
}

export function sphere_project(q: number, r: number, width: number, height: number, size: number): PixelCoord {
  const lat = (r / (height - 1) - 0.5) * Math.PI
  const spread = Math.cos(lat)
  const half_span = (Math.sqrt(3) * size * width) / 2
  const x_plane = Math.sqrt(3) * size * (q + r / 2)
  const y_span = (1.5 * size * (height - 1)) / Math.PI
  return { x: (x_plane - half_span) * spread, y: y_span * lat }
}

export function axial_to_pixel(coord: AxialCoord, size: number): PixelCoord {
  const x = size * Math.sqrt(3) * (coord.q + coord.r / 2)
  const y = size * 1.5 * coord.r
  return { x, y }
}

export function pixel_to_axial(x: number, y: number, size: number): AxialCoord {
  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size
  const r = ((2 / 3) * y) / size
  return axial_round(q, r)
}

export function axial_round(q: number, r: number): AxialCoord {
  const s = -q - r
  let rq = Math.round(q)
  let rr = Math.round(r)
  const rs = Math.round(s)
  const dq = Math.abs(rq - q)
  const dr = Math.abs(rr - r)
  const ds = Math.abs(rs - s)
  if (dq > dr && dq > ds) {
    rq = -rr - rs
  } else if (dr > ds) {
    rr = -rq - rs
  }
  return { q: rq, r: rr }
}

export function axial_distance(a: AxialCoord, b: AxialCoord): number {
  const dq = a.q - b.q
  const dr = a.r - b.r
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2
}

export function axial_neighbors(coord: AxialCoord): AxialCoord[] {
  return [
    { q: coord.q + 1, r: coord.r },
    { q: coord.q - 1, r: coord.r },
    { q: coord.q, r: coord.r + 1 },
    { q: coord.q, r: coord.r - 1 },
    { q: coord.q + 1, r: coord.r - 1 },
    { q: coord.q - 1, r: coord.r + 1 }
  ]
}

export function chunk_of(coord: AxialCoord): AxialCoord {
  return {
    q: Math.floor(coord.q / HEX_CHUNK_SIZE),
    r: Math.floor(coord.r / HEX_CHUNK_SIZE)
  }
}

export function chunk_cells(chunk: AxialCoord): AxialCoord[] {
  const cells: AxialCoord[] = []
  for (let dr = 0; dr < HEX_CHUNK_SIZE; dr++) {
    for (let dq = 0; dq < HEX_CHUNK_SIZE; dq++) {
      cells.push({ q: chunk.q * HEX_CHUNK_SIZE + dq, r: chunk.r * HEX_CHUNK_SIZE + dr })
    }
  }
  return cells
}

export function hex_corners(center: PixelCoord, size: number): PixelCoord[] {
  const corners: PixelCoord[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    corners.push({ x: center.x + size * Math.cos(angle), y: center.y + size * Math.sin(angle) })
  }
  return corners
}
