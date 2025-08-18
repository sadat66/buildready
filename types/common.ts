export interface FileReference {
  id: string
  filename: string
  url: string
  size?: number
  mimeType?: string
  uploadedAt?: Date
}

export interface GeospatialLocation {
  address: string
  latitude?: number
  longitude?: number
  city: string
  province: string
  postalCode: string
}
