export const CLAIM_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  DOCUMENTS_REQUESTED: 'documents_requested',
  APPROVED: 'approved',
  PARTIAL: 'partial',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const;

export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUS.SUBMITTED]: 'Submitted',
  [CLAIM_STATUS.UNDER_REVIEW]: 'Under Review',
  [CLAIM_STATUS.DOCUMENTS_REQUESTED]: 'Documents Requested',
  [CLAIM_STATUS.APPROVED]: 'Approved',
  [CLAIM_STATUS.PARTIAL]: 'Partially Approved',
  [CLAIM_STATUS.REJECTED]: 'Rejected',
  [CLAIM_STATUS.COMPLETED]: 'Completed'
} as const;

export const CLAIM_STATUS_COLORS = {
  [CLAIM_STATUS.SUBMITTED]: 'bg-yellow-100 text-yellow-800',
  [CLAIM_STATUS.UNDER_REVIEW]: 'bg-blue-100 text-blue-800',
  [CLAIM_STATUS.DOCUMENTS_REQUESTED]: 'bg-purple-100 text-purple-800',
  [CLAIM_STATUS.APPROVED]: 'bg-green-100 text-green-800',
  [CLAIM_STATUS.PARTIAL]: 'bg-orange-100 text-orange-800',
  [CLAIM_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [CLAIM_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800'
} as const;

export const ITEM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIAL: 'partial',
  REJECTED: 'rejected'
} as const;

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const ADMISSION_TYPES = {
  PLANNED: 'planned',
  EMERGENCY: 'emergency'
} as const;

export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other'
} as const;