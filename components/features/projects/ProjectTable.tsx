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
import { ArrowUpDown, Calendar, MapPin, DollarSign, Clock, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Project } from '@/types'
import { PROJECT_STATUSES } from "@/lib/constants"

interface ProjectTableProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
  onEditProject?: (project: Project) => void
  onDeleteProject?: (project: Project) => void
}

const columnHelper = createColumnHelper<Project>()

export default function ProjectTable({ projects, onProjectClick, onEditProject, onDeleteProject }: ProjectTableProps) {
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
            <div className="font-medium truncate" title={row.original.project_title}>
              {row.original.project_title}
            </div>
            <div 
              className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]" 
              title={row.original.statement_of_work}
            >
              {row.original.statement_of_work}
            </div>
          </div>
        ),
        size: 250,
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: ({ row }) => {
          const location = row.original.location;
          
          // Check if location exists and has meaningful data
          if (location && location.address && location.city) {
            return (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate" title={`${location.address}, ${location.city}`}>
                  {location.address}, {location.city}
                </span>
              </div>
            );
          }
          
          // Check if location exists but might have empty strings
          if (location && (location.address || location.city || location.province)) {
            const displayParts = [
              location.address,
              location.city,
              location.province
            ].filter(Boolean);
            
            if (displayParts.length > 0) {
              return (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate" title={displayParts.join(', ')}>
                    {displayParts.join(', ')}
                  </span>
                </div>
              );
            }
          }
          
          // No valid location data
          return (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Not specified
              </span>
            </div>
          );
        },
        size: 180,
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
        size: 120,
      }),
      columnHelper.accessor('expiry_date', {
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
              {row.original.expiry_date 
                ? new Date(row.original.expiry_date).toLocaleDateString()
                : 'Not specified'
              }
            </span>
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const statusConfig = {
            [PROJECT_STATUSES.DRAFT]: { 
              label: PROJECT_STATUSES.DRAFT, 
              variant: 'outline' as const, 
              color: 'bg-gray-50 text-gray-700 border-gray-300' 
            },
            [PROJECT_STATUSES.OPEN_FOR_PROPOSALS]: { 
              label: PROJECT_STATUSES.OPEN_FOR_PROPOSALS, 
              variant: 'default' as const, 
              color: 'bg-blue-100 text-blue-800 border-blue-300' 
            },
            [PROJECT_STATUSES.PROPOSAL_SELECTED]: { 
              label: PROJECT_STATUSES.PROPOSAL_SELECTED, 
              variant: 'secondary' as const, 
              color: 'bg-green-100 text-green-800 border-green-300' 
            },
            [PROJECT_STATUSES.IN_PROGRESS]: { 
              label: PROJECT_STATUSES.IN_PROGRESS, 
              variant: 'secondary' as const, 
              color: 'bg-orange-100 text-orange-800 border-orange-300' 
            },
            [PROJECT_STATUSES.COMPLETED]: { 
              label: PROJECT_STATUSES.COMPLETED, 
              variant: 'outline' as const, 
              color: 'bg-gray-900 text-white border-gray-900' 
            },
            [PROJECT_STATUSES.CANCELLED]: { 
              label: PROJECT_STATUSES.CANCELLED, 
              variant: 'destructive' as const, 
              color: 'bg-red-100 text-red-800 border-red-300' 
            },
          }
          
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[PROJECT_STATUSES.DRAFT]
          
          return (
            <Badge variant={config.variant} className={`${config.color} px-3 py-1.5 text-xs font-medium text-center min-w-[120px] flex items-center justify-center`}>
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
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onProjectClick?.(row.original)
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onEditProject?.(row.original)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600" 
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteProject?.(row.original)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead 
                  key={header.id} 
                  style={{ width: header.getSize() }}
                  className="whitespace-nowrap"
                >
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
                  <TableCell 
                    key={cell.id} 
                    style={{ width: cell.column.getSize() }}
                    className="max-w-0"
                  >
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
    </div>
  )
}
