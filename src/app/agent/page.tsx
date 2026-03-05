'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanyFilter from '@/components/agent/CompanyFilter';
import ClaimReviewTable from '@/components/agent/ClaimReviewTable';
import { useClaims } from '@/hooks/useClaims';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Building2, Search } from 'lucide-react';

export default function AgentPortal() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<string>();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { claims, loading } = useClaims(
    selectedCompany ? { companyId: selectedCompany } : {}
  );

  const filteredClaims = claims.filter(claim => 
    claim.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.policy_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Insurance Agent Portal</h1>
              <p className="text-gray-600 mt-1">Review and manage insurance claims</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CompanyFilter
              selectedCompany={selectedCompany}
              onCompanyChange={setSelectedCompany}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, claim number, or policy number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Claims Table */}
            {loading ? (
              <div className="bg-white rounded-lg shadow p-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <ClaimReviewTable 
                claims={filteredClaims}
                companyName={selectedCompany ? undefined : 'All Companies'}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}