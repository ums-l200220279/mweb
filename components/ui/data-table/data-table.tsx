"use client"

import type React from "react"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions } from "./data-table-view-options"
import { Search } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  emptyState?: {
    title: string
    description?: string
  }
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  pagination?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyState = {
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  searchPlaceholder = "Search...",
  onSearch,
  pagination = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [searchValue, setSearchValue] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (data.length === 0) {
    return <EmptyState title={emptyState.title} description={emptyState.description} className="py-10" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {onSearch && (
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={searchPlaceholder} value={searchValue} onChange={handleSearch} className="pl-8" />
          </div>
        )}
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
      {pagination && <DataTablePagination table={table} />}
    </div>
  )
}

