import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { InsurancePolicy, PurchasedPolicy } from '@/types/policy';
import { where } from 'firebase/firestore';
import { calculatePremium } from '@/lib/utils/premiumCalculator';
import toast from 'react-hot-toast';

export function usePolicies(agentId?: string) {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const { getDocuments, addDocument } = useFirestore<InsurancePolicy>('policies');
  const purchasedPolicies = useFirestore<PurchasedPolicy>('purchasedPolicies');

  useEffect(() => {
    fetchPolicies();
  }, [agentId]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const constraints = agentId ? [where('agentId', '==', agentId)] : [];
      const data = await getDocuments(constraints);
      setPolicies(data);
    } catch (error: any) {
      toast.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (policyData: Partial<InsurancePolicy>) => {
    try {
      const id = await addDocument(policyData);
      if (id) {
        toast.success('Policy created successfully');
        await fetchPolicies();
        return id;
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const purchasePolicy = async (
    policyId: string,
    patientId: string,
    patientName: string,
    premiumInput: {
      age: number;
      preExistingConditions: string[];
      term: 1 | 5 | 10;
      frequency: 'monthly' | 'yearly';
    }
  ) => {
    try {
      const policy = policies.find(p => p.id === policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }

      const premiumAmount = calculatePremium(policy.premiumRules, premiumInput);
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + premiumInput.term);

      const purchasedPolicy: Partial<PurchasedPolicy> = {
        policyId,
        patientId,
        patientName,
        policyName: policy.policyName,
        policyNumber: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase(),
        startDate,
        endDate,
        term: premiumInput.term,
        premium: {
          amount: premiumAmount,
          frequency: premiumInput.frequency,
          nextDueDate: startDate
        },
        coverage: policy.coverage,
        status: 'active'
      };

      const id = await purchasedPolicies.addDocument(purchasedPolicy);
      if (id) {
        toast.success('Policy purchased successfully!');
        return id;
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    policies,
    loading,
    createPolicy,
    purchasePolicy,
    refresh: fetchPolicies
  };
}