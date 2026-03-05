export interface MedicalCategory {
  category: string;
  subcategories: MedicalSubcategory[];
}

export interface MedicalSubcategory {
  name: string;
  field: string;
  description?: string;
  maxLimit?: number;
  requiresPreApproval?: boolean;
}

export interface MedicalCharge {
  id: string;
  claimId: string;
  category: string;
  subcategory: string;
  fieldName: string;
  description?: string;
  requestedAmount: number;
  approvedAmount?: number;
  rejectedAmount?: number;
  rejectionReason?: string;
  status: 'pending' | 'approved' | 'partial' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalBill {
  id: string;
  claimId: string;
  fileUrl: string;
  extractedData?: any;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface RoomPhoto {
  id: string;
  claimId: string;
  fileUrl: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
}