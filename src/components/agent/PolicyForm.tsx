'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import CoverageFields from './CoverageFields';
import PremiumCalculator from './PremiumCalculator';
import { MEDICAL_FIELDS } from '@/lib/constants/medicalFields';
import { CoverageRule, InsurancePolicy } from '@/types/policy';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const policySchema = z.object({
  policyName: z.string().min(3, 'Policy name is required'),
  policyType: z.enum(['A', 'B', 'custom']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  baseAmount: z.number().min(100, 'Base amount must be at least ₹100'),
});

type PolicyFormData = z.infer<typeof policySchema>;

interface PolicyFormProps {
  onSubmit?: (policy: Partial<InsurancePolicy>) => void;
}

export default function PolicyForm({ onSubmit }: PolicyFormProps) {
  const { user, userData } = useAuth();
  const [coverage, setCoverage] = useState<Record<string, CoverageRule>>({});
  const [ageFactors, setAgeFactors] = useState([
    { min: 18, max: 30, multiplier: 1.0 },
    { min: 31, max: 40, multiplier: 1.3 },
    { min: 41, max: 50, multiplier: 1.6 },
    { min: 51, max: 60, multiplier: 2.0 },
  ]);
  const [diseaseFactors, setDiseaseFactors] = useState([
    { disease: 'diabetes', multiplier: 1.2 },
    { disease: 'heart disease', multiplier: 1.5 },
    { disease: 'hypertension', multiplier: 1.1 },
    { disease: 'asthma', multiplier: 1.1 },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      policyType: 'A',
      baseAmount: 5000,
    }
  });

  const baseAmount = watch('baseAmount');

  const handleCoverageChange = (field: string, rule: CoverageRule) => {
    setCoverage(prev => ({ ...prev, [field]: rule }));
  };

  const onSubmitForm = async (data: PolicyFormData) => {
    if (!user || !userData) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const policyData: Partial<InsurancePolicy> = {
        ...data,
        agentId: user.uid,
        agentName: userData.name,
        companyName: userData.companyName || '',
        coverage: coverage as any,
        premiumRules: {
          baseAmount: data.baseAmount,
          ageFactors,
          diseaseFactors,
          termMultipliers: {
            '1': 1,
            '5': 4.5,
            '10': 8,
          },
          paymentFrequency: {
            monthly: 0.0833, // 1/12 of yearly
            yearly: 1,
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      if (onSubmit) {
        onSubmit(policyData);
      } else {
        // Save to Firebase
        const response = await fetch('/api/policies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(policyData)
        });

        if (!response.ok) {
          throw new Error('Failed to create policy');
        }

        toast.success('Policy created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {/* Basic Policy Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Policy Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Policy Name"
            placeholder="e.g., Silver Health Plan"
            error={errors.policyName?.message}
            {...register('policyName')}
            required
          />
          
          <Select
            label="Policy Type"
            options={[
              { value: 'A', label: 'Type A - Comprehensive' },
              { value: 'B', label: 'Type B - Basic' },
              { value: 'custom', label: 'Custom Plan' }
            ]}
            error={errors.policyType?.message}
            {...register('policyType')}
            required
          />
          
          <div className="md:col-span-2">
            <Input
              label="Description"
              placeholder="Describe what this policy covers..."
              error={errors.description?.message}
              {...register('description')}
              required
            />
          </div>
          
          <Input
            label="Base Premium Amount (₹)"
            type="number"
            min="100"
            step="100"
            error={errors.baseAmount?.message}
            {...register('baseAmount', { valueAsNumber: true })}
            required
          />
        </div>
      </div>

      {/* Coverage Rules */}
      <CoverageFields
        coverage={coverage}
        onChange={handleCoverageChange}
      />

      {/* Premium Calculator Preview */}
      <PremiumCalculator
        baseAmount={baseAmount}
        ageFactors={ageFactors}
        diseaseFactors={diseaseFactors}
      />

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} size="lg">
          Create Policy
        </Button>
      </div>
    </form>
  );
}