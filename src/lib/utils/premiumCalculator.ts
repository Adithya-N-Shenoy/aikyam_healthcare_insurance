import { PremiumRule, AgeFactor, DiseaseFactor } from '@/types/policy';

interface PremiumInput {
  age: number;
  preExistingConditions: string[];
  term: 1 | 5 | 10;
  frequency: 'monthly' | 'yearly';
}

export const calculatePremium = (
  rule: PremiumRule,
  input: PremiumInput
): number => {
  let baseAmount = rule.baseAmount;
  
  // Apply age factor
  const ageFactor = rule.ageFactors.find(
    f => input.age >= f.min && input.age <= f.max
  );
  if (ageFactor) {
    baseAmount *= ageFactor.multiplier;
  }
  
  // Apply disease factors
  input.preExistingConditions.forEach(condition => {
    const diseaseFactor = rule.diseaseFactors.find(
      f => f.disease.toLowerCase() === condition.toLowerCase()
    );
    if (diseaseFactor) {
      baseAmount *= diseaseFactor.multiplier;
    }
  });
  
  // Apply term multiplier
  baseAmount *= rule.termMultipliers[input.term];
  
  // Apply frequency factor
  baseAmount *= rule.paymentFrequency[input.frequency];
  
  return Math.round(baseAmount);
};

export const formatPremium = (amount: number, frequency: string): string => {
  return `₹${amount.toLocaleString()}/${frequency === 'monthly' ? 'mo' : 'yr'}`;
};