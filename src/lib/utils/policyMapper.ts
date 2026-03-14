import { MedicalChargeItem } from '@/types/claim';
import { PurchasedPolicy, CoverageRule } from '@/types/policy';

export interface MappedClaimItem {
  fieldName: string;
  requestedAmount: number;
  coverageRule: CoverageRule;
  eligibleAmount: number;
  suggestedAmount: number;
  reason?: string;
}

export const mapClaimToPolicy = (
  billItems: MedicalChargeItem[],
  policy: PurchasedPolicy
): MappedClaimItem[] => {
  return billItems.map(item => {
    const coverageRule = (policy.coverage as any)[item.fieldName] || {
      type: 'none',
      value: 0
    };
    
    let eligibleAmount = 0;
    let suggestedAmount = 0;
    let reason = '';

    switch (coverageRule.type) {
      case 'full':
        eligibleAmount = item.requestedAmount;
        suggestedAmount = item.requestedAmount;
        reason = 'Full coverage as per policy';
        break;
        
      case 'limit':
        eligibleAmount = Math.min(item.requestedAmount, coverageRule.value);
        suggestedAmount = eligibleAmount;
        reason = `Limited to ₹${coverageRule.value} as per policy`;
        break;
        
      case 'percentage':
        eligibleAmount = (item.requestedAmount * coverageRule.value) / 100;
        suggestedAmount = eligibleAmount;
        reason = `${coverageRule.value}% coverage as per policy`;
        break;
        
      case 'none':
        eligibleAmount = 0;
        suggestedAmount = 0;
        reason = 'Not covered under this policy';
        break;
    }

    return {
      fieldName: item.fieldName,
      requestedAmount: item.requestedAmount,
      coverageRule,
      eligibleAmount,
      suggestedAmount,
      reason
    };
  });
};

export const calculateTotalEligible = (mappedItems: MappedClaimItem[]): number => {
  return mappedItems.reduce((sum, item) => sum + item.eligibleAmount, 0);
};

export const generateClaimReport = (
  mappedItems: MappedClaimItem[],
  policy: PurchasedPolicy
): string => {
  const totalRequested = mappedItems.reduce((sum, i) => sum + i.requestedAmount, 0);
  const totalEligible = calculateTotalEligible(mappedItems);
  
  return `
CLAIM AUTO-MAPPING REPORT
==========================
Policy: ${policy.policyName} (${policy.policyNumber})
Patient: ${policy.patientName}

SUMMARY
-------
Total Requested: ₹${totalRequested.toLocaleString()}
Total Eligible: ₹${totalEligible.toLocaleString()}
Coverage Ratio: ${((totalEligible / totalRequested) * 100).toFixed(1)}%

DETAILED BREAKDOWN
------------------
${mappedItems.map(item => `
${item.fieldName}:
  Requested: ₹${item.requestedAmount.toLocaleString()}
  Eligible: ₹${item.eligibleAmount.toLocaleString()}
  Rule: ${item.coverageRule.type} (${item.coverageRule.value})
  Reason: ${item.reason}
`).join('\n')}

DISCLAIMER
----------
This is an AI-generated suggestion. Final approval subject to agent review.
  `;
};