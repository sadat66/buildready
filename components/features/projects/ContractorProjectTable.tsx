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
import { ArrowUpDown, Calendar, MapPin, DollarSign, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Project } from '@/types'
import { getProjectStatusConfig } from '@/lib/helpers'

interface ContractorProjectTableProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
}

const columnHelper = createColumnHelper<Project>()

export default function ContractorProjectTable({ 
  projects, 
  onProjectClick
}: ContractorProjectTableProps) {
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
            <div className="text-sm text-muted-foreground line-clamp-1 max-w-[180px]" title={row.original.statement_of_work}>
              {row.original.statement_of_work}
            </div>
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: ({ row }) => {
          const location = row.original.location;
          
          // Check if location exists and has meaningful data
          if (location && location.address && location.city) {
            return (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                Not specified
              </span>
            </div>
          );
        },
        size: 160,
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: ({ row }) => {
          const categories = row.original.category;
          if (!categories || categories.length === 0) {
            return <span className="text-sm text-muted-foreground">No category</span>;
          }
          
          return (
            <div className="text-sm text-muted-foreground">
              {categories.slice(0, 2).join(', ')}
              {categories.length > 2 && ` +${categories.length - 2} more`}
            </div>
          );
        },
        size: 120,
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
            <span className="text-sm font-medium">
              {row.original.budget ? 
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(row.original.budget) : 
                'Not specified'
              }
            </span>
          </div>
        ),
        size: 100,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const config = getProjectStatusConfig(status)
          
          return (
            <Badge variant={config.variant} className={`${config.color} px-2 py-1 text-xs font-medium text-center min-w-[100px] flex items-center justify-center`}>
              {config.label}
            </Badge>
          )
        },
        size: 100,
      }),
      columnHelper.accessor('expiry_date', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Expires
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const expiryDate = row.original.expiry_date;
          if (!expiryDate) {
            return <span className="text-sm text-muted-foreground">No expiry</span>;
          }
          
          const date = new Date(expiryDate);
          const now = new Date();
          const isExpired = date < now;
          
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={`text-sm ${isExpired ? 'text-red-600' : ''}`}>
                {date.toLocaleDateString()}
              </span>
            </div>
          );
        },
        size: 100,
      }),
      columnHelper.accessor('created_at', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Posted
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
        size: 100,
      }),

    ],
    []
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
      <div className="max-w-full">
        <Table className="w-full table-fixed">
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
                No projects available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}