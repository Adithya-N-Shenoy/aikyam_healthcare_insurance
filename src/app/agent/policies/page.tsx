'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePolicies } from '@/hooks/usePolicies';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusCircle, Edit, Users, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export default function AgentPoliciesPage() {
  const { userData } = useAuth();
  const { policies, loading } = usePolicies(userData?.companyId);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['agent']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['agent']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Insurance Policies</h1>
                <p className="text-gray-600 mt-1">Manage your policy offerings</p>
              </div>
              <Link href="/agent/policies/create">
                <Button>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create New Policy
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {policies.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Created</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first insurance policy
              </p>
              <Link href="/agent/policies/create">
                <Button>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Your First Policy
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map((policy) => (
                <Card key={policy.id} className="hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{policy.policyName}</h3>
                      <p className="text-sm text-gray-500">Type {policy.policyType}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{policy.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      Base Premium: {formatCurrency(policy.premiumRules.baseAmount)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Terms: 1, 5, 10 years
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      Age-based pricing
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/agent/policies/${policy.id}`} className="flex-1">
                      <Button variant="outline" fullWidth>
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/agent/policies/${policy.id}/edit`}>
                      <Button variant="outline" className="px-3">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}