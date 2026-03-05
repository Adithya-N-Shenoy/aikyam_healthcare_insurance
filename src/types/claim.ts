export interface MedicalChargeItem {
  id?: string;
  category: string;
  subcategory: string;
  fieldName: string;
  requestedAmount: number;
  approvedAmount?: number;
  rejectedAmount?: number;
  rejectionReason?: string;
  status: 'pending' | 'approved' | 'partial' | 'rejected';
  notes?: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  companyId: string;
  agentId?: string;
  status: 'submitted' | 'under_review' | 'documents_requested' | 'approved' | 'partial' | 'rejected' | 'completed';
  
  // Patient Info
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientPhone: string;
  patientEmail?: string;
  policyNumber: string;
  patientAddress?: string;
  
  // Admission Details
  admissionDate: string;
  dischargeDate?: string;
  admissionType: 'planned' | 'emergency';
  lengthOfStay?: number;
  
  // Hospital Staff
  staffName: string;
  staffDesignation: string;
  staffPhone: string;
  staffEmail: string;
  
  // Files
  billFileUrl: string;
  roomPhotoUrl: string;
  
  // Financials
  totalRequested: number;
  totalApproved: number;
  totalRejected: number;
  
  // Metadata
  submittedAt: string;
  reviewedAt?: string;
  completedAt?: string;
  updatedAt: string;
  
  // Relations
  items?: MedicalChargeItem[];
  documentRequests?: DocumentRequest[];
  statusHistory?: StatusHistory[];
  reviewNotes?: ReviewNote[];
}

export interface DocumentRequest {
  id: string;
  claimId: string;
  documentType: string;
  description: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedUrl?: string;
  submittedAt?: string;
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  claimId: string;
  status: string;
  notes?: string;
  changedBy?: string;
  createdAt: string;
}

export interface ReviewNote {
  id: string;
  claimId: string;
  agentId: string;
  agentName?: string;
  notes: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface ClaimFormData {
  companyId: string;
  
  // Patient Information
  patientName: string;
  patientDob: string;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientEmail?: string;
  policyNumber: string;
  patientAddress?: string;
  
  // Admission Details
  admissionDate: string;
  dischargeDate?: string;
  admissionType: 'planned' | 'emergency';
  lengthOfStay?: number;
  
  // Hospital Staff
  staffName: string;
  staffDesignation: string;
  staffPhone: string;
  staffEmail: string;
  
  // Medical Charges (dynamic)
  medicalCharges: MedicalChargeItem[];
}

export interface ClaimReviewData {
  claimId: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  reviewNotes: string;
  items: {
    id: string;
    approvedAmount: number;
    rejectedAmount: number;
    rejectionReason?: string;
    status: 'pending' | 'approved' | 'partial' | 'rejected';
  }[];
  documentRequests?: {
    documentType: string;
    description: string;
  }[];
}