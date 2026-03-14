'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PremiumCalculator from '@/components/agent/PremiumCalculator';
import { InsurancePolicy } from '@/types/policy';
import { ArrowLeft, Shield, Calendar, Users, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { MEDICAL_FIELDS } from '@/lib/constants/medicalFields';
import toast from 'react-hot-toast';

export default function PolicyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData } = useAuth();
  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const { getDocument } = useFirestore<InsurancePolicy>('policies');

  useEffect(() => {
    fetchPolicy();
  }, [params.id]);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const data = await getDocument(params.id as string);
      setPolicy(data);
    } catch (error) {
      console.error('Error fetching policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please login to purchase this policy');
      router.push('/login');
      return;
    }
    router.push(`/patient/policies/${params.id}/buy`);
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

  if (!policy) {
    return (
      <ProtectedRoute allowedRoles={['patient']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Policy Not Found</h3>
            <p className="text-gray-600 mt-2 mb-4">The policy you're looking for doesn't exist.</p>
            <Link href="/patient/policies">
              <Button>Browse Policies</Button>
            </Link>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <Link
                href="/patient/policies"
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{policy.policyName}</h1>
                <p className="text-gray-600 mt-1">by {policy.companyName}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Policy Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Policy Description</h2>
                <p className="text-gray-700">{policy.description}</p>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4">Coverage Details</h2>
                <div className="space-y-4">
                  {MEDICAL_FIELDS.map((category) => {
                    const hasCoverage = category.subcategories.some(
                      sub => (policy.coverage as any)[sub.field]?.type !== 'none'
                    );
                    
                    if (!hasCoverage) return null;

                    return (
                      <div key={category.category} className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">{category.category}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {category.subcategories.map((sub) => {
                            const coverage = (policy.coverage as any)[sub.field];
                            if (!coverage || coverage.type === 'none') return null;

                            let coverageText = '';
                            if (coverage.type === 'full') coverageText = 'Full Coverage';
                            else if (coverage.type === 'limit') coverageText = `Up to ${formatCurrency(coverage.value)}`;
                            else if (coverage.type === 'percentage') coverageText = `${coverage.value}% Coverage`;

                            return (
                              <div key={sub.field} className="text-sm">
                                <span className="text-gray-600">{sub.name}:</span>{' '}
                                <span className="font-medium text-green-600">{coverageText}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right Column - Premium Calculator */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Premium Calculator</h2>
                <PremiumCalculator
                  baseAmount={policy.premiumRules.baseAmount}
                  ageFactors={policy.premiumRules.ageFactors}
                  diseaseFactors={policy.premiumRules.diseaseFactors}
                  onCalculate={(amount, details) => {
                    // You can store this in state if needed
                  }}
                />
                
                {user ? (
                  <Button onClick={handleBuyNow} fullWidth size="lg" className="mt-6">
                    Buy This Policy
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button fullWidth size="lg" className="mt-6">
                      Login to Purchase
                    </Button>
                  </Link>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}