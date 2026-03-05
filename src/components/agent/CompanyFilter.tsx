'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { INSURANCE_COMPANIES } from '@/lib/constants/insuranceCompanies';

interface CompanyFilterProps {
  selectedCompany?: string;
  onCompanyChange: (companyId: string) => void;
}

export default function CompanyFilter({ selectedCompany, onCompanyChange }: CompanyFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = INSURANCE_COMPANIES.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Select Insurance Company</h2>
      
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Company List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => onCompanyChange(company.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                selectedCompany === company.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{company.name}</span>
                {selectedCompany === company.id && (
                  <span className="text-blue-600 text-sm">Selected</span>
                )}
              </div>
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No companies found</p>
        )}
      </div>
    </div>
  );
}