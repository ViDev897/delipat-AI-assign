import { FiZap, FiHome } from 'react-icons/fi'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function CRMLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiZap className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Delipat CRM</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <FiHome className="w-4 h-4" />
            Back to Site
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
