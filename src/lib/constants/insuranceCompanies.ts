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

export const getCompanyById = (id: string) => {
  return INSURANCE_COMPANIES.find(c => c.id === id);
};

export const getCompanyByCode = (code: string) => {
  return INSURANCE_COMPANIES.find(c => c.code === code);
};