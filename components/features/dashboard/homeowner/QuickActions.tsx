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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Create New Project</h3>
            </div>
            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
              🚀 Post your project details and get proposals from qualified contractors. Start your home improvement journey today!
            </p>
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 font-semibold">
              Post Project
            </Button>
          </div>
        </div>
      </Link>

      <Link href="/homeowner/proposals" className="flex-1 group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Review Proposals</h3>
              </div>
              {proposalsCount > 0 && (
                <div className="bg-white/30 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full border border-white/20 animate-pulse">
                  {proposalsCount} pending
                </div>
              )}
            </div>
            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
              📋 Check proposals from contractors for your projects. Compare bids and choose the perfect match!
            </p>
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 font-semibold">
              View Proposals
            </Button>
          </div>
        </div>
      </Link>
    </div>
  )
}
