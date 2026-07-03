'use client'

import { useEffect, useState } from 'react'
import { FiEdit, FiTrash2, FiChevronDown } from 'react-icons/fi'
import Link from 'next/link'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  industry: string
  status: string
  createdAt: string
  qualification?: {
    leadScore: number
    temperature: string
    confidence: number
    reasoning: string
  }
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchLeads()
  }, [statusFilter])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const url = statusFilter === 'ALL' 
        ? '/api/leads' 
        : `/api/leads?status=${statusFilter}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch leads')
      const data = await response.json()
      setLeads(data.leads)
      setError('')
    } catch (err) {
      setError('Failed to load leads')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    try {
      const response = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete lead')
      setLeads(leads.filter(lead => lead.id !== id))
    } catch (err) {
      alert('Failed to delete lead')
    }
  }

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'Hot':
        return 'bg-red-100 text-red-800'
      case 'Warm':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cold':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'QUALIFIED':
        return 'bg-green-100 text-green-800'
      case 'LOST':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading leads...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {['ALL', 'NEW', 'QUALIFIED', 'LOST'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {leads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No leads found
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white border border-gray-200 rounded-lg">
              {/* Lead Summary Row */}
              <div
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <FiChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedId === lead.id ? 'rotate-180' : ''
                      }`}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {lead.qualification && (
                      <>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {lead.qualification.leadScore}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getTemperatureColor(
                              lead.qualification.temperature
                            )}`}
                          >
                            {lead.qualification.temperature}
                          </span>
                        </div>
                      </>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === lead.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="font-medium">{lead.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Company</p>
                      <p className="font-medium">{lead.company}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Industry</p>
                      <p className="font-medium">{lead.industry}</p>
                    </div>
                  </div>

                  {lead.qualification && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">AI Reasoning</p>
                        <p className="text-sm text-gray-700">{lead.qualification.reasoning}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Score</p>
                          <p className="font-bold">{lead.qualification.leadScore}/100</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Confidence</p>
                          <p className="font-bold">{lead.qualification.confidence}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
