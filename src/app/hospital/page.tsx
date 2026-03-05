'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Camera, PlusCircle, Activity } from 'lucide-react';

export default function HospitalPortal() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Portal</h1>
              <p className="text-gray-600 mt-1">Submit and manage insurance claims</p>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <Link
            href="/hospital/submit"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Submit New Claim
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Step 1: Upload Documents</h3>
            <p className="text-gray-600 text-sm">
              Upload patient bill (PDF/Image) and room photo as proof of admission
            </p>
            <div className="mt-4 text-xs text-gray-500">
              Supported: PDF, PNG, JPG (max 50MB)
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Step 2: AI Extraction</h3>
            <p className="text-gray-600 text-sm">
              Gemini AI automatically extracts and fills medical charge fields from bill
            </p>
            <div className="mt-4 text-xs text-green-600">
              ✨ Auto-fill enabled
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <PlusCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Step 3: Review & Submit</h3>
            <p className="text-gray-600 text-sm">
              Verify extracted data, make manual adjustments, and submit claim
            </p>
            <div className="mt-4 text-xs text-purple-600">
              ✏️ Editable fields
            </div>
          </div>
        </div>

        {/* Recent Claims Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Recent Claims</h2>
          </div>
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No claims submitted yet</p>
            <p className="text-sm text-gray-400">
              Click "Submit New Claim" to get started with your first claim
            </p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Quick Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Make sure the bill is clear and readable for best AI extraction results</li>
            <li>• Take a well-lit photo of the patient in their room as proof</li>
            <li>• Double-check all amounts before submitting the claim</li>
          </ul>
        </div>
      </main>
    </div>
  );
}