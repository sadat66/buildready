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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreHorizontal, ArrowUpDown, Eye, Edit } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Proposal {
  id: string
  title: string
  status: string
  subtotal_amount: number | null
  total_amount: number | null
  created_at: string
  description_of_work: string
  proposed_start_date: string | null
  proposed_end_date: string | null
  project?: {
    id: string
    project_title: string
    statement_of_work: string
    category: string
    location: string
    status: string
    budget: number | null
    creator: string
  }
  homeowner_details?: {
    id: string
    full_name: string
    email: string
  }
}

interface ContractorProposalTableProps {
  proposals: Proposal[]
  onProposalClick?: (proposal: Proposal) => void
  onViewDetails?: (proposal: Proposal) => void
  onEditProposal?: (proposal: Proposal) => void
}

export function ContractorProposalTable({
  proposals,
  onProposalClick,
  onViewDetails,
  onEditProposal,
}: ContractorProposalTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'accepted':
        return 'default'
      case 'submitted':
      case 'viewed':
        return 'secondary'
      case 'rejected':
      case 'withdrawn':
      case 'expired':
        return 'destructive'
      case 'draft':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: 'project.project_title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Project Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const proposal = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">
              {proposal.project?.project_title || 'Unknown Project'}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {proposal.title}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'homeowner_details.full_name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Homeowner
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const proposal = row.original
        return (
          <div className="font-medium text-gray-900">
            {proposal.homeowner_details?.full_name || 'Unknown'}
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
            Proposal Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = row.getValue('total_amount') as number
        return (
          <div className="font-medium text-gray-900">
            {formatCurrency(amount || 0)}
          </div>
        )
      },
    },
    {
      accessorKey: 'project.budget',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Project Budget
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const proposal = row.original
        return (
          <div className="font-medium text-gray-900">
            {formatCurrency(proposal.project?.budget || 0)}
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
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold text-left justify-start w-full text-gray-600"
          >
            Submitted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string
        return (
          <div className="text-gray-900">
            {formatDate(date)}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className="text-gray-600 font-semibold">Actions</span>,
      cell: ({ row }) => {
        const proposal = row.original
        const isDraft = proposal.status === 'draft'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onViewDetails?.(proposal)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {isDraft && (
                <DropdownMenuItem
                  onClick={() => onEditProposal?.(proposal)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Proposal
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
                onClick={() => onProposalClick?.(row.original)}
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

export default ContractorProposalTable