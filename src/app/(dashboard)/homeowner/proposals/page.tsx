'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Clock, DollarSign, User, CheckCircle, XCircle } from 'lucide-react'

export default function HomeownerProposalsPage() {
  const { user } = useAuth()

  const proposals = [
    {
      id: 1,
      projectTitle: 'Kitchen Renovation',
      contractor: 'ABC Construction',
      contractorRating: 4.8,
      price: '$25,000',
      timeline: '8-10 weeks',
      status: 'Pending',
      submittedDate: '2024-01-10',
      description: 'Complete kitchen remodel including new cabinets, countertops, and appliances'
    },
    {
      id: 2,
      projectTitle: 'Kitchen Renovation',
      contractor: 'XYZ Remodeling',
      contractorRating: 4.6,
      price: '$28,500',
      timeline: '10-12 weeks',
      status: 'Accepted',
      submittedDate: '2024-01-08',
      description: 'Premium kitchen renovation with custom cabinets and granite countertops'
    },
    {
      id: 3,
      projectTitle: 'Bathroom Update',
      contractor: 'Modern Bath Co.',
      contractorRating: 4.9,
      price: '$18,000',
      timeline: '4-6 weeks',
      status: 'Rejected',
      submittedDate: '2024-01-05',
      description: 'Contemporary bathroom design with walk-in shower and double vanity'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Project Proposals</h1>
        <p className="text-gray-600">Review and manage proposals from contractors</p>
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
                    <p className="font-medium">{proposal.contractor}</p>
                    <p className="text-sm text-gray-600">Rating: {proposal.contractorRating}/5</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{proposal.price}</p>
                    <p className="text-sm text-gray-600">Total cost</p>
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
                  Submitted: {proposal.submittedDate}
                </p>
              </div>

              {proposal.status === 'Pending' && (
                <div className="flex space-x-2">
                  <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Accept</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              )}

              {proposal.status === 'Accepted' && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Message Contractor
                  </Button>
                </div>
              )}

              {proposal.status === 'Rejected' && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Provide Feedback
                  </Button>
                </div>
              )}
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
            <p className="text-gray-600 mb-4">Proposals from contractors will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
