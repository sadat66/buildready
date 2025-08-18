'use client'

import { Plus, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  proposalsCount: number
}

export default function QuickActions({ proposalsCount }: QuickActionsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Link href="/homeowner/projects/create" className="flex-1 group">
        <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                <Plus className="h-6 w-6 text-gray-600 group-hover:text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Create New Project</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Post your project details and get proposals from qualified contractors. Start your home improvement journey today!
            </p>
            <Button className="bg-gray-900 hover:bg-black text-white border-0 transition-all duration-200 font-semibold">
              Post Project
            </Button>
          </div>
        </div>
      </Link>

      <Link href="/homeowner/proposals" className="flex-1 group">
        <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-orange-300">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Briefcase className="h-6 w-6 text-gray-600 group-hover:text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Review Proposals</h3>
              </div>
              {proposalsCount > 0 && (
                <div className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                  {proposalsCount} pending
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Check proposals from contractors for your projects. Compare bids and choose the perfect match!
            </p>
            <Button className="bg-gray-900 hover:bg-black text-white border-0 transition-all duration-200 font-semibold">
              View Proposals
            </Button>
          </div>
        </div>
      </Link>
    </div>
  )
}
