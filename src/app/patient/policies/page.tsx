'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { InsurancePolicy } from '@/types/policy';
import { ShoppingCart, Shield, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

export default function PatientPoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const { getDocuments } = useFirestore<InsurancePolicy>('policies');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setPolicies(data.filter(p => p.isActive));
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['patient']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Available Policies</h1>
            <p className="text-gray-600 mt-1">Choose the right coverage for your needs</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {policies.length === 0 ? (
            <Card className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Available</h3>
              <p className="text-gray-600">Check back later for new insurance plans</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map((policy) => (
                <Card key={policy.id} className="hover:shadow-lg transition">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{policy.policyName}</h3>
                    <p className="text-sm text-gray-500">{policy.companyName}</p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{policy.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      Starting at {formatCurrency(policy.premiumRules.baseAmount)}/month
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Terms: 1, 5, 10 years
                    </div>
                  </div>

                  <Link href={`/patient/policies/${policy.id}`}>
                    <Button fullWidth>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View & Buy
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}