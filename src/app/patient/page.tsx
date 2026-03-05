'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, User, FileText, Activity, ArrowRight, AlertCircle } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import toast from 'react-hot-toast';

export default function PatientPortal() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    claimNumber: '',
    policyNumber: '',
    patientName: ''
  });
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    // Validate at least one search parameter
    if (!searchParams.claimNumber && !searchParams.policyNumber && !searchParams.patientName) {
      toast.error('Please enter at least one search criteria');
      return;
    }

    setSearching(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (searchParams.claimNumber) params.append('claimNumber', searchParams.claimNumber);
      if (searchParams.policyNumber) params.append('policyNumber', searchParams.policyNumber);
      if (searchParams.patientName) params.append('patientName', searchParams.patientName);

      const response = await fetch(`/api/claims?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      if (data.claims && data.claims.length > 0) {
        // If multiple claims found, show the first one (you could enhance this to show a list)
        router.push(`/patient/track/${data.claims[0].claim_number}`);
      } else {
        toast.error('No claims found matching your criteria');
      }
    } catch (error: any) {
      toast.error(error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleQuickSearch = (type: 'claim' | 'policy') => {
    if (type === 'claim') {
      setSearchParams({
        claimNumber: 'CLM-',
        policyNumber: '',
        patientName: ''
      });
    } else {
      setSearchParams({
        claimNumber: '',
        policyNumber: 'POL-',
        patientName: ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Portal</h1>
              <p className="text-gray-600 mt-1">Track your insurance claim status in real-time</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Card */}
        <Card className="mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Track Your Claim</h2>
            <p className="text-gray-600 mt-2">
              Enter your claim details below to check the current status
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Search
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleQuickSearch('claim')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  By Claim Number
                </button>
                <button
                  onClick={() => handleQuickSearch('policy')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  By Policy Number
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or enter manually</span>
              </div>
            </div>

            <Input
              label="Claim Number"
              placeholder="e.g., CLM-20240301-1234"
              value={searchParams.claimNumber}
              onChange={(e) => setSearchParams({ ...searchParams, claimNumber: e.target.value })}
              icon={<FileText className="h-5 w-5 text-gray-400" />}
            />

            <Input
              label="Policy Number"
              placeholder="Enter your policy number"
              value={searchParams.policyNumber}
              onChange={(e) => setSearchParams({ ...searchParams, policyNumber: e.target.value })}
              icon={<FileText className="h-5 w-5 text-gray-400" />}
            />

            <Input
              label="Patient Name"
              placeholder="Enter patient name"
              value={searchParams.patientName}
              onChange={(e) => setSearchParams({ ...searchParams, patientName: e.target.value })}
              icon={<User className="h-5 w-5 text-gray-400" />}
            />

            <Button
              onClick={handleSearch}
              loading={searching}
              fullWidth
              size="lg"
              className="mt-4"
            >
              <Search className="h-5 w-5 mr-2" />
              Search Claim
            </Button>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">
              Get instant updates on your claim status
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Transparent Breakdown</h3>
            <p className="text-sm text-gray-600">
              View detailed breakdown of approved and rejected amounts
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Document Requests</h3>
            <p className="text-sm text-gray-600">
              Submit additional documents when requested
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-blue-800">
            <p className="flex items-start">
              <ArrowRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Your claim number can be found on the receipt given by the hospital</span>
            </p>
            <p className="flex items-start">
              <ArrowRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>Policy number is printed on your insurance card</span>
            </p>
            <p className="flex items-start">
              <ArrowRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>You can search using any one of the fields above</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}