import Dashboard from '@/components/Dashboard'
import LeadsList from '@/components/LeadsList'

export default function CRMDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor your leads, AI qualification scores, and conversion metrics
        </p>
      </div>

      {/* Dashboard Metrics */}
      <Dashboard />

      {/* Leads Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Leads</h2>
        <LeadsList />
      </div>
    </div>
  )
}
