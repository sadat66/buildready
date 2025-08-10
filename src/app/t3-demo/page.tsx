import { T3Example } from '@/components/examples/T3Example'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'T3 Stack Demo - BuildReady',
  description: 'Demonstration of T3 Stack integration with tRPC, TypeScript, Tailwind CSS, and Supabase',
}

export default function T3DemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">T3 Stack Demo</h1>
          <p className="text-gray-600">
            This page demonstrates the complete T3 Stack integration with Supabase as the backend.
            The T3 Stack provides end-to-end type safety, excellent developer experience, and modern web development practices.
          </p>
        </div>
        
        <T3Example />
      </div>
    </div>
  )
}