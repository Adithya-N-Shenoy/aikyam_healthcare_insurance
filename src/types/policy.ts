export type CoverageType = 'full' | 'limit' | 'percentage' | 'none';

export interface CoverageRule {
  type: CoverageType;
  value: number; // For limit: max amount, for percentage: 0-100
}

export interface MedicalCoverage {
  // Room & Accommodation
  room_general_ward: CoverageRule;
  room_semi_private: CoverageRule;
  room_private: CoverageRule;
  icu_charges: CoverageRule;
  nicu_picu_charges: CoverageRule;
  emergency_room: CoverageRule;
  
  // Medical Services
  doctor_consultation: CoverageRule;
  surgeon_fees: CoverageRule;
  specialist_consultation: CoverageRule;
  nursing_charges: CoverageRule;
  anesthesia_charges: CoverageRule;
  
  // Diagnostics
  lab_tests: CoverageRule;
  xray_charges: CoverageRule;
  mri_ct_scan: CoverageRule;
  ultrasound: CoverageRule;
  ecg_eeg: CoverageRule;
  
  // Treatment
  surgery_charges: CoverageRule;
  dialysis: CoverageRule;
  chemotherapy: CoverageRule;
  blood_transfusion: CoverageRule;
  
  // Medications
  pharmacy: CoverageRule;
  medical_supplies: CoverageRule;
  implants: CoverageRule;
  surgical_equipment: CoverageRule;
  
  // Other
  ambulance: CoverageRule;
  physiotherapy: CoverageRule;
  rehabilitation: CoverageRule;
  miscellaneous: CoverageRule;
}

export interface AgeFactor {
  min: number;
  max: number;
  multiplier: number;
}

export interface DiseaseFactor {
  disease: string;
  multiplier: number;
}

export interface PremiumRule {
  baseAmount: number;
  ageFactors: AgeFactor[];
  diseaseFactors: DiseaseFactor[];
  termMultipliers: {
    '1': number;  // 1 year
    '5': number;  // 5 years
    '10': number; // 10 years
  };
  paymentFrequency: {
    monthly: number;
    yearly: number;
  };
}

export interface InsurancePolicy {
  id: string;
  agentId: string;
  agentName: string;
  companyName: string;
  policyName: string;
  policyType: 'A' | 'B' | 'custom';
  description: string;
  coverage: MedicalCoverage;
  premiumRules: PremiumRule;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface PurchasedPolicy {
  id: string;
  policyId: string;
  patientId: string;
  patientName: string;
  policyName: string;
  policyNumber: string;
  startDate: Date;
  endDate: Date;
  term: number; // in years
  premium: {
    amount: number;
    frequency: 'monthly' | 'yearly';
    nextDueDate: Date;
  };
  coverage: MedicalCoverage; // Snapshot of coverage at purchase time
  status: 'active' | 'expired' | 'cancelled';
}