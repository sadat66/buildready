'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Clock, DollarSign, User, Eye } from 'lucide-react'

export default function ContractorProposalsPage() {

  const proposals: Array<{
    id: number;
    projectTitle: string;
    homeowner: string;
    homeownerRating: number;
    budget: string;
    timeline: string;
    status: string;
    lastModified: string;
    description: string;
  }> = []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800'
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'Accepted':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
        <p className="text-gray-600">Track your submitted project proposals</p>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl">{proposal.projectTitle}</CardTitle>
                  <CardDescription className="mt-2">{proposal.description}</CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                  {proposal.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{proposal.homeowner}</p>
                    <p className="text-sm text-gray-600">Rating: {proposal.homeownerRating}/5</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{proposal.budget}</p>
                    <p className="text-sm text-gray-600">Budget range</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{proposal.timeline}</p>
                    <p className="text-sm text-gray-600">Estimated duration</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Last modified: {proposal.lastModified}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {proposals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
            <p className="text-gray-600 mb-4">Submit your first proposal to get started</p>
            <Button>Browse Projects</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
