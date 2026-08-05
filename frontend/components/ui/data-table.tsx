'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  isLoading?: boolean
  serverSide?: boolean
  totalItems?: number
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  isLoading = false,
  serverSide = false,
  totalItems = 0,
  pageSize: initialPageSize = 10,
  currentPage: externalCurrentPage,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize)

  const currentPage = serverSide && externalCurrentPage !== undefined ? externalCurrentPage : internalCurrentPage
  const pageSize = serverSide && initialPageSize !== undefined ? initialPageSize : internalPageSize

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (!serverSide) {
      setInternalCurrentPage(1)
    }
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
    if (!serverSide) {
      setInternalCurrentPage(1)
    }
  }

  const filteredData = (!serverSide && searchQuery && !onSearch)
    ? data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data

  const sortedData = (!serverSide && sortKey)
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        
        if (aValue === bValue) return 0
        
        const comparison = aValue > bValue ? 1 : -1
        return sortOrder === 'asc' ? comparison : -comparison
      })
    : filteredData

  const actualTotalItems = serverSide ? totalItems : sortedData.length
  const totalPages = Math.ceil(actualTotalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, actualTotalItems)
  const paginatedData = serverSide ? data : sortedData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages))
    if (!serverSide) {
      setInternalCurrentPage(newPage)
    }
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  const handlePageSizeChangeLocal = (size: string) => {
    const newSize = Number(size)
    if (!serverSide) {
      setInternalPageSize(newSize)
      setInternalCurrentPage(1)
    }
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    }
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold">
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="h-8 px-2 hover:bg-gray-100"
                    >
                      {column.label}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex items-center justify-center">
                    <motion.div
                      className="h-8 w-8 border-4 border-[#e32d31] border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-gray-500">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">Rows per page:</p>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChangeLocal}>
              <SelectTrigger className="w-20 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <p className="text-sm text-gray-600">
              {startIndex + 1}-{endIndex} of {actualTotalItems}
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number
                  
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="h-9 w-9 p-0"
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
