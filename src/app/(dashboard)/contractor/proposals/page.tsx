'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Clock, DollarSign, User, Plus, Edit, Eye } from 'lucide-react'

export default function ContractorProposalsPage() {

  const proposals = [
    {
      id: 1,
      projectTitle: 'Kitchen Renovation',
      homeowner: 'John Smith',
      homeownerRating: 4.9,
      budget: '$20,000 - $30,000',
      timeline: '8-10 weeks',
      status: 'Draft',
      lastModified: '2024-01-10',
      description: 'Complete kitchen remodel including new cabinets, countertops, and appliances'
    },
    {
      id: 2,
      projectTitle: 'Bathroom Update',
      homeowner: 'Sarah Johnson',
      homeownerRating: 4.7,
      budget: '$15,000 - $20,000',
      timeline: '4-6 weeks',
      status: 'Submitted',
      lastModified: '2024-01-08',
      description: 'Contemporary bathroom design with walk-in shower and double vanity'
    },
    {
      id: 3,
      projectTitle: 'Deck Construction',
      homeowner: 'Mike Wilson',
      homeownerRating: 4.8,
      budget: '$12,000 - $18,000',
      timeline: '6-8 weeks',
      status: 'Submitted',
      lastModified: '2024-01-05',
      description: 'Wooden deck with railing and stairs'
    }
  ]

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-gray-600">Manage and track your project proposals</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Proposal</span>
        </Button>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
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
                {proposal.status === 'Draft' && (
                  <>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                    <Button className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Submit</span>
                    </Button>
                  </>
                )}
                
                {proposal.status === 'Submitted' && (
                  <>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Message Homeowner
                    </Button>
                  </>
                )}

                <Button variant="outline" size="sm">
                  Duplicate
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
            <p className="text-gray-600 mb-4">Create your first proposal to get started</p>
            <Button>Create Your First Proposal</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
