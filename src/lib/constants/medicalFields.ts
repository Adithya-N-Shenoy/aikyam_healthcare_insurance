export const MEDICAL_FIELDS = [
  {
    category: 'Room & Accommodation',
    subcategories: [
      { name: 'General Ward', field: 'room_general_ward' },
      { name: 'Semi-Private Room', field: 'room_semi_private' },
      { name: 'Private Room', field: 'room_private' },
      { name: 'ICU Charges', field: 'icu_charges' },
      { name: 'NICU/PICU Charges', field: 'nicu_picu_charges' },
      { name: 'Emergency Room', field: 'emergency_room' },
    ]
  },
  {
    category: 'Medical Services',
    subcategories: [
      { name: 'Doctor Consultation', field: 'doctor_consultation' },
      { name: 'Surgeon Fees', field: 'surgeon_fees' },
      { name: 'Specialist Consultation', field: 'specialist_consultation' },
      { name: 'Nursing Charges', field: 'nursing_charges' },
      { name: 'Anesthesia Charges', field: 'anesthesia_charges' },
      { name: 'Physician Fees', field: 'physician_fees' },
    ]
  },
  {
    category: 'Diagnostics & Tests',
    subcategories: [
      { name: 'Laboratory Tests', field: 'lab_tests' },
      { name: 'X-Ray Charges', field: 'xray_charges' },
      { name: 'MRI/CT Scan', field: 'mri_ct_scan' },
      { name: 'Ultrasound', field: 'ultrasound' },
      { name: 'ECG/EEG', field: 'ecg_eeg' },
      { name: 'PET Scan', field: 'pet_scan' },
      { name: 'Pathology Tests', field: 'pathology_tests' },
    ]
  },
  {
    category: 'Treatment & Procedures',
    subcategories: [
      { name: 'Surgery Charges', field: 'surgery_charges' },
      { name: 'Dialysis', field: 'dialysis' },
      { name: 'Chemotherapy/Radiotherapy', field: 'chemotherapy' },
      { name: 'Blood Transfusion', field: 'blood_transfusion' },
      { name: 'Ventilator Charges', field: 'ventilator_charges' },
      { name: 'OT Charges', field: 'ot_charges' },
    ]
  },
  {
    category: 'Medications & Supplies',
    subcategories: [
      { name: 'Pharmacy/Medications', field: 'pharmacy' },
      { name: 'Medical Supplies', field: 'medical_supplies' },
      { name: 'Implants/Prosthetics', field: 'implants' },
      { name: 'Surgical Equipment', field: 'surgical_equipment' },
      { name: 'Disposables', field: 'disposables' },
      { name: 'Blood Products', field: 'blood_products' },
    ]
  },
  {
    category: 'Other Services',
    subcategories: [
      { name: 'Ambulance Charges', field: 'ambulance' },
      { name: 'Physiotherapy', field: 'physiotherapy' },
      { name: 'Rehabilitation', field: 'rehabilitation' },
      { name: 'Dietary Services', field: 'dietary' },
      { name: 'Attendant Charges', field: 'attendant' },
      { name: 'Miscellaneous', field: 'miscellaneous' },
    ]
  }
];

export const INSURANCE_COMPANIES = [
  { id: 'icici-lombard', name: 'ICICI Lombard', code: 'ICICI' },
  { id: 'hdfc-ergo', name: 'HDFC ERGO', code: 'HDFC' },
  { id: 'star-health', name: 'Star Health Insurance', code: 'STAR' },
  { id: 'care-health', name: 'Care Health Insurance', code: 'CARE' },
  { id: 'max-bupa', name: 'Max Bupa Health Insurance', code: 'MAX' },
  { id: 'bajaj-allianz', name: 'Bajaj Allianz', code: 'BAJAJ' },
  { id: 'niva-bupa', name: 'Niva Bupa', code: 'NIVA' },
  { id: 'policybazaar', name: 'PolicyBazaar', code: 'POLICY' },
  { id: 'acko', name: 'Acko General Insurance', code: 'ACKO' },
  { id: 'digit', name: 'Digit Insurance', code: 'DIGIT' },
  { id: 'other', name: 'Other', code: 'OTHER' }
];

export const CLAIM_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  DOCUMENTS_REQUESTED: 'documents_requested',
  APPROVED: 'approved',
  PARTIAL: 'partial',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const;

export const ITEM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIAL: 'partial',
  REJECTED: 'rejected'
} as const;