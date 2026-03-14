'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PolicyForm from '@/components/agent/PolicyForm';
import { ArrowLeft } from 'lucide-react';

export default function CreatePolicyPage() {
  const router = useRouter();

  return (
    <ProtectedRoute allowedRoles={['agent']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <Link
                href="/agent/policies"
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Policy</h1>
                <p className="text-gray-600 mt-1">Define coverage rules and premium calculations</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PolicyForm />
        </main>
      </div>
    </ProtectedRoute>
  );
}