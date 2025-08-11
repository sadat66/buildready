'use client'

import dynamic from 'next/dynamic'

const LocationMap = dynamic(() => import('@/components/features/projects').then(mod => ({ default: mod.LocationMap })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
})

export default function TestMapPage() {
  const handleLocationSelect = (coordinates: { lat: number; lng: number; address: string }) => {
    console.log('Selected location:', coordinates)
    alert(`Location selected: ${coordinates.address}\nCoordinates: ${coordinates.lat}, ${coordinates.lng}`)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Map Component Test</h1>
      <p className="text-gray-600 mb-6">
        This page tests the LocationMap component. Click on the map or search for a location to test functionality.
      </p>
      
      <LocationMap 
        onLocationSelect={handleLocationSelect}
        className="w-full"
      />
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Click anywhere on the map to select coordinates</li>
          <li>Use the search bar to find specific addresses</li>
          <li>Check the browser console for coordinate data</li>
          <li>Verify the selected location display updates</li>
        </ul>
      </div>
    </div>
  )
}
