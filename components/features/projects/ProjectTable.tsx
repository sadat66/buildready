'use client'

import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowUpDown, Calendar, MapPin, DollarSign, Clock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Project } from '@/types/database'

interface ProjectTableProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
}

const columnHelper = createColumnHelper<Project>()

export default function ProjectTable({ projects, onProjectClick }: ProjectTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
      columnHelper.accessor('project_title', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Project Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.project_title}</div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {row.original.description}
            </div>
          </div>
        ),
        size: 300,
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{row.original.location || 'Not specified'}</span>
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor('budget', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Budget
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {row.original.budget ? `$${row.original.budget.toLocaleString()}` : 'Not specified'}
            </span>
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor('proposal_deadline', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Deadline
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {row.original.proposal_deadline 
                ? new Date(row.original.proposal_deadline).toLocaleDateString()
                : 'Not specified'
              }
            </span>
          </div>
        ),
        size: 150,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const statusConfig = {
            open: { label: 'Open', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
            in_progress: { label: 'In Progress', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
            completed: { label: 'Completed', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
            cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
          }
          
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
          
          return (
            <Badge variant={config.variant} className={config.color}>
              {config.label}
            </Badge>
          )
        },
        size: 120,
      }),
      columnHelper.accessor('created_at', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(row.original.created_at).toLocaleDateString()}
            </span>
          </div>
        ),
        size: 120,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onProjectClick?.(row.original)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View project</span>
          </Button>
        ),
        size: 80,
      }),
    ],
    [onProjectClick]
  )

  const table = useReactTable({
    data: projects,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })



  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => onProjectClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
