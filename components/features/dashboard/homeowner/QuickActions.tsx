'use client'

import { Plus, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  proposalsCount: number
}

export default function QuickActions({ proposalsCount }: QuickActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link href="/homeowner/projects/create" className="flex-1">
        <div className="border border-green-200 bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <Plus className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Create New Project</h3>
          </div>
          <p className="text-green-600 text-sm mb-4">
            Post your project details and get proposals from qualified contractors.
          </p>
          <Button className="bg-green-600 hover:bg-green-700">
            Post Project
          </Button>
        </div>
      </Link>

      <Link href="/homeowner/proposals" className="flex-1">
        <div className="border border-blue-200 bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Review Proposals</h3>
            </div>
            {proposalsCount > 0 && (
              <div className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                {proposalsCount} pending
              </div>
            )}
          </div>
          <p className="text-blue-600 text-sm mb-4">
            Check proposals from contractors for your projects.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            View Proposals
          </Button>
        </div>
      </Link>
    </div>
  )
}
