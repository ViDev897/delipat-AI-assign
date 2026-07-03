'use client'

import { useEffect, useState } from 'react'
import { FiTrendingUp, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi'

interface Metrics {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  lostLeads: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  averageScore: number
  topIndustries: Array<{ name: string; count: number }>
  scoreDistribution: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data)
      setError('')
    } catch (err) {
      setError('Failed to load dashboard metrics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  const MetricCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = 'blue',
  }: {
    icon: React.ComponentType<{ className: string }>
    title: string
    value: number | string
    subtitle?: string
    color?: string
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
    }

    return (
      <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <Icon className="w-8 h-8 opacity-50" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={FiUsers}
          title="Total Leads"
          value={metrics.totalLeads}
          color="blue"
        />
        <MetricCard
          icon={FiTrendingUp}
          title="New Leads"
          value={metrics.newLeads}
          subtitle="Awaiting qualification"
          color="orange"
        />
        <MetricCard
          icon={FiCheckCircle}
          title="Qualified Leads"
          value={metrics.qualifiedLeads}
          color="green"
        />
        <MetricCard
          icon={FiXCircle}
          title="Lost Leads"
          value={metrics.lostLeads}
          color="red"
        />
      </div>

      {/* Temperature Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Temperature</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">🔥 Hot Leads</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{metrics.hotLeads}</p>
            <p className="text-xs text-gray-500 mt-1">High priority</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">🌡️ Warm Leads</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{metrics.warmLeads}</p>
            <p className="text-xs text-gray-500 mt-1">Medium priority</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">❄️ Cold Leads</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{metrics.coldLeads}</p>
            <p className="text-xs text-gray-500 mt-1">Low priority</p>
          </div>
        </div>
      </div>

      {/* Average Score and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Average Lead Score</h3>
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600">{metrics.averageScore}</p>
            <p className="text-gray-500 text-sm mt-2">out of 100</p>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${metrics.averageScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Excellent (80-100)</span>
                <span className="font-semibold">{metrics.scoreDistribution.excellent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(metrics.scoreDistribution.excellent / (metrics.scoreDistribution.excellent + metrics.scoreDistribution.good + metrics.scoreDistribution.fair + metrics.scoreDistribution.poor)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Good (60-80)</span>
                <span className="font-semibold">{metrics.scoreDistribution.good}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${(metrics.scoreDistribution.good / (metrics.scoreDistribution.excellent + metrics.scoreDistribution.good + metrics.scoreDistribution.fair + metrics.scoreDistribution.poor)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fair (40-60)</span>
                <span className="font-semibold">{metrics.scoreDistribution.fair}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${(metrics.scoreDistribution.fair / (metrics.scoreDistribution.excellent + metrics.scoreDistribution.good + metrics.scoreDistribution.fair + metrics.scoreDistribution.poor)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Poor (&lt;40)</span>
                <span className="font-semibold">{metrics.scoreDistribution.poor}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${(metrics.scoreDistribution.poor / (metrics.scoreDistribution.excellent + metrics.scoreDistribution.good + metrics.scoreDistribution.fair + metrics.scoreDistribution.poor)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Industries */}
      {metrics.topIndustries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Industries</h3>
          <div className="space-y-3">
            {metrics.topIndustries.map((industry, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{industry.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(industry.count / metrics.totalLeads) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-700 w-8">{industry.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
