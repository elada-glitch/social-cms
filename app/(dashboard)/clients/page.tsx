'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Search, Plus, Users, Building2, ExternalLink } from 'lucide-react'
import { PlatformBadge } from '@/components/content/platform-badge'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Client {
  id: string
  businessName: string
  industry: string | null
  contactPerson: string | null
  contactEmail: string | null
  activePlatforms: string
  monthlyQuota: number
  monthlyPackage: string | null
  isActive: boolean
  _count: { contentItems: number }
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (filter === 'active') params.set('active', 'true')
  if (filter === 'inactive') params.set('active', 'false')

  const { data, isLoading } = useSWR(`/api/clients?${params}`, fetcher, {
    keepPreviousData: true,
  })

  const clients: Client[] = data?.clients || []

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">לקוחות</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} לקוחות</p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          <Plus size={16} />
          לקוח חדש
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60 max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חיפוש לקוח..."
            className="input pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? 'הכל' : f === 'active' ? 'פעילים' : 'לא פעילים'}
            </button>
          ))}
        </div>
      </div>

      {/* Clients grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">לא נמצאו לקוחות</p>
          <p className="text-sm mt-1">נסה לשנות את מסנני החיפוש</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => {
            const platforms: string[] = JSON.parse(client.activePlatforms || '[]')
            const fillPercent = client.monthlyQuota > 0
              ? Math.round((client._count.contentItems / client.monthlyQuota) * 100)
              : 0

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="card hover:shadow-md transition-all duration-150 flex flex-col gap-4 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} className="text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                        {client.businessName}
                      </div>
                      {client.industry && (
                        <div className="text-xs text-gray-500 mt-0.5">{client.industry}</div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      client.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {client.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>

                {/* Platforms */}
                {platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} size="sm" />
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-500">חבילה חודשית</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">
                      {client.monthlyPackage || '-'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-500">קוטה חודשית</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">
                      {client._count.contentItems} / {client.monthlyQuota}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {client.monthlyQuota > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>מילוי קוטה</span>
                      <span>{Math.min(100, fillPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          fillPercent >= 80 ? 'bg-green-500' : fillPercent >= 50 ? 'bg-brand-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(100, fillPercent)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Contact */}
                {client.contactPerson && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <ExternalLink size={12} />
                    <span>{client.contactPerson}</span>
                    {client.contactEmail && <span>· {client.contactEmail}</span>}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
