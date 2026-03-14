'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { AgeFactor, DiseaseFactor } from '@/types/policy';
import { formatCurrency } from '@/lib/utils/formatters';

interface PremiumCalculatorProps {
  baseAmount: number;
  ageFactors: AgeFactor[];
  diseaseFactors: DiseaseFactor[];
  onCalculate?: (amount: number, details: any) => void;
}

export default function PremiumCalculator({ 
  baseAmount, 
  ageFactors, 
  diseaseFactors,
  onCalculate 
}: PremiumCalculatorProps) {
  const [age, setAge] = useState<number>(30);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [term, setTerm] = useState<1 | 5 | 10>(1);
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [calculatedPremium, setCalculatedPremium] = useState<number>(baseAmount);
  const [breakdown, setBreakdown] = useState<any[]>([]);

  useEffect(() => {
    calculatePremium();
  }, [age, selectedDiseases, term, frequency, baseAmount]);

  const calculatePremium = () => {
    let amount = baseAmount;
    const breakdownItems = [];

    // Find age factor
    const ageFactor = ageFactors.find(f => age >= f.min && age <= f.max);
    if (ageFactor) {
      const ageMultiplier = ageFactor.multiplier;
      breakdownItems.push({
        factor: 'Age',
        value: `${age} years`,
        multiplier: ageMultiplier,
        impact: `${((ageMultiplier - 1) * 100).toFixed(0)}% ${ageMultiplier > 1 ? 'increase' : 'decrease'}`
      });
      amount *= ageFactor.multiplier;
    }

    // Apply disease factors
    selectedDiseases.forEach(disease => {
      const diseaseFactor = diseaseFactors.find(f => 
        f.disease.toLowerCase() === disease.toLowerCase()
      );
      if (diseaseFactor) {
        breakdownItems.push({
          factor: 'Medical Condition',
          value: disease,
          multiplier: diseaseFactor.multiplier,
          impact: `${((diseaseFactor.multiplier - 1) * 100).toFixed(0)}% increase`
        });
        amount *= diseaseFactor.multiplier;
      }
    });

    // Apply term multiplier
    const termMultipliers = { 1: 1, 5: 4.5, 10: 8 };
    const termMultiplier = termMultipliers[term];
    breakdownItems.push({
      factor: 'Policy Term',
      value: `${term} year${term > 1 ? 's' : ''}`,
      multiplier: termMultiplier / term, // Average per year
      impact: `${termMultiplier}x total (${(termMultiplier / term).toFixed(1)}x per year)`
    });
    amount *= termMultiplier;

    // Apply frequency factor
    const frequencyMultipliers = { monthly: 0.0833, yearly: 1 };
    const frequencyMultiplier = frequencyMultipliers[frequency];
    amount *= frequencyMultiplier;

    // Round to nearest rupee
    const finalAmount = Math.round(amount);
    setCalculatedPremium(finalAmount);
    
    if (onCalculate) {
      onCalculate(finalAmount, {
        baseAmount,
        age,
        selectedDiseases,
        term,
        frequency,
        breakdown: breakdownItems
      });
    }
  };

  const diseaseOptions = diseaseFactors.map(f => ({
    value: f.disease,
    label: f.disease.charAt(0).toUpperCase() + f.disease.slice(1)
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Age</label>
        <Input
          type="number"
          min="18"
          max="100"
          value={age}
          onChange={(e) => setAge(parseInt(e.target.value) || 30)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pre-existing Conditions
        </label>
        <Select
          value=""
          onChange={(e) => {
            if (e.target.value && !selectedDiseases.includes(e.target.value)) {
              setSelectedDiseases([...selectedDiseases, e.target.value]);
            }
          }}
          options={[{ value: '', label: 'Add a condition...' }, ...diseaseOptions]}
        />
        {selectedDiseases.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedDiseases.map(disease => (
              <span
                key={disease}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {disease}
                <button
                  type="button"
                  onClick={() => setSelectedDiseases(selectedDiseases.filter(d => d !== disease))}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Term</label>
        <Select
          value={term}
          onChange={(e) => setTerm(parseInt(e.target.value) as 1 | 5 | 10)}
          options={[
            { value: '1', label: '1 Year' },
            { value: '5', label: '5 Years' },
            { value: '10', label: '10 Years' }
          ]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency</label>
        <Select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'monthly' | 'yearly')}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' }
          ]}
        />
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600 font-medium">Calculated Premium</p>
        <p className="text-2xl font-bold text-blue-700">
          {formatCurrency(calculatedPremium)}/{frequency === 'monthly' ? 'mo' : 'yr'}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Base premium: {formatCurrency(baseAmount)}/{frequency === 'monthly' ? 'mo' : 'yr'}
        </p>
      </div>

      <p className="text-xs text-gray-500">
        *Final premium may vary based on medical underwriting
      </p>
    </div>
  );
}