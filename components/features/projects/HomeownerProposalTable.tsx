'use client'

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown, Eye, CheckCircle, XCircle, Calendar, Clock, FileDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PROPOSAL_STATUSES, ProposalStatus } from '@/lib/constants'
import { generateProposalPDF } from '@/lib/utils/pdfGenerator'
import toast from 'react-hot-toast'

interface ProposalWithJoins {
  id: string
  project: string
  project_id: string
  contractor_id: string
  homeowner: string
  title: string
  description_of_work: string
  subtotal_amount: number
  tax_included: "yes" | "no"
  total_amount: number
  deposit_amount: number
  deposit_due_on: string
  proposed_start_date: string
  proposed_end_date: string
  expiry_date: string
  status: string
  is_selected: "yes" | "no"
  is_deleted: "yes" | "no"
  submitted_date?: string
  accepted_date?: string
  rejected_date?: string
  withdrawn_date?: string
  viewed_date?: string
  last_updated: string
  rejected_by?: string
  rejection_reason?: string
  rejection_reason_notes?: string
  clause_preview_html?: string
  attached_files?: Array<{
    id: string
    filename: string
    url: string
    size?: number
    mimeType?: string
    uploadedAt?: string
  }>
  notes?: string
  agreement?: string
  proposals: string[]
  created_by: string
  last_modified_by: string
  visibility_settings: "private" | "public" | "shared"
  created_at: string
  updated_at: string
  project_details: {
    id: string
    project_title: string
    statement_of_work: string
    category: string[]
    location: Record<string, unknown>
    status: string
    budget: number
  }
  contractor_profile?: {
    id: string
    full_name: string
    email: string
    phone_number?: string
    address?: string
  }
}

interface HomeownerProposalTableProps {
  proposals: ProposalWithJoins[]
  onStatusUpdate?: (proposalId: string, status: ProposalStatus) => void
  actionLoading?: string | null
}

export function HomeownerProposalTable({
  proposals,
  onStatusUpdate,
  actionLoading,
}: HomeownerProposalTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const router = useRouter()

  const handleRowClick = (proposalId: string) => {
    router.push(`/homeowner/proposals/${proposalId}`)
  }

  const getStatusBadgeStyle = (status: string) => {
    const badgeStyles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'submitted': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'viewed': 'bg-blue-100 text-blue-800 border-blue-300',
      'accepted': 'bg-green-100 text-green-800 border-green-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300',
      'withdrawn': 'bg-gray-100 text-gray-800 border-gray-300',
      'expired': 'bg-gray-100 text-gray-800 border-gray-300',
      'draft': 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return badgeStyles[status as keyof typeof badgeStyles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getDisplayStatus = (status: string) => {
    return status === 'submitted' ? 'pending' : status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days`
  }

  const columns: ColumnDef<ProposalWithJoins>[] = [
    {
      accessorKey: 'project_details.project_title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Project
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const proposal = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">
              {proposal.project_details?.project_title || 'Unknown Project'}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {proposal.title}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'contractor_profile.full_name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Contractor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const proposal = row.original
        return (
          <div className="font-medium text-gray-900">
            {proposal.contractor_profile?.full_name
              ? proposal.contractor_profile.full_name
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1).toLowerCase()
                  )
                  .join(" ")
              : "Unknown"}
          </div>
        )
      },
    },
    {
      accessorKey: 'total_amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const proposal = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">
              {formatCurrency(proposal.total_amount || 0)}
            </div>
            <div className="text-sm text-gray-500">
              Deposit: {formatCurrency(proposal.deposit_amount || 0)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const displayStatus = getDisplayStatus(status)
        return (
          <Badge 
            variant="outline" 
            className={`capitalize border ${getStatusBadgeStyle(status)}`}
          >
            {displayStatus}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'proposed_start_date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Timeline
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const proposal = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span>
                {proposal.proposed_start_date && proposal.proposed_end_date
                  ? `${formatDate(proposal.proposed_start_date)} - ${formatDate(proposal.proposed_end_date)}`
                  : "Dates TBD"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-3 w-3 text-gray-400" />
              <span>
                {proposal.proposed_start_date && proposal.proposed_end_date
                  ? calculateDuration(proposal.proposed_start_date, proposal.proposed_end_date)
                  : "Duration TBD"}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className="text-gray-600 font-semibold">Actions</span>,
      cell: ({ row }) => {
        const proposal = row.original
        const canTakeAction = proposal.status === PROPOSAL_STATUSES.SUBMITTED || proposal.status === PROPOSAL_STATUSES.VIEWED
        const isAccepted = proposal.status === PROPOSAL_STATUSES.ACCEPTED
        const isRejected = proposal.status === PROPOSAL_STATUSES.REJECTED
        const isLoading = actionLoading === proposal.id

        if (canTakeAction) {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusUpdate?.(proposal.id, PROPOSAL_STATUSES.ACCEPTED)
                }}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusUpdate?.(proposal.id, PROPOSAL_STATUSES.REJECTED)
                }}
                disabled={isLoading}
                variant="destructive"
                className="h-8 px-3 text-xs"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          )
        }

        if (isAccepted || isRejected) {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/homeowner/proposals/${proposal.id}`)
                }}
                className="h-8 px-3 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
              {isAccepted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      await generateProposalPDF(proposal)
                      toast.success('PDF generated successfully')
                    } catch (error) {
                      toast.error('Failed to generate PDF')
                    }
                  }}
                  className="h-8 px-3 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  PDF
                </Button>
              )}
            </div>
          )
        }

        return (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/homeowner/proposals/${proposal.id}`)
            }}
            className="h-8 px-3 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data: proposals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-gray-200">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="bg-gray-50 font-semibold text-gray-900 p-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No proposals found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default HomeownerProposalTable